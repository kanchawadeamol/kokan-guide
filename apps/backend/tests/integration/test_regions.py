"""Region hierarchy against the live database.

Every test runs inside a transaction that is rolled back, so the developer database is left
unchanged (including the migration round trip: PostgreSQL DDL is transactional).
"""

from collections.abc import AsyncIterator
from typing import Any

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import Connection, func, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine, AsyncSession

from app.db.migrations import MIGRATIONS_DIR
from app.models import Country, District, State, Taluka, Village
from app.seed.regions import load_region_seed, seed_regions

pytestmark = pytest.mark.integration

REGION_TABLES = ("countries", "states", "districts", "talukas", "villages")


@pytest.fixture
async def migrator_conn(migrator_engine: AsyncEngine) -> AsyncIterator[AsyncConnection]:
    async with migrator_engine.connect() as conn:
        transaction = await conn.begin()
        try:
            yield conn
        finally:
            await transaction.rollback()


@pytest.fixture
async def session(migrator_conn: AsyncConnection) -> AsyncIterator[AsyncSession]:
    async with AsyncSession(
        bind=migrator_conn, join_transaction_mode="create_savepoint", expire_on_commit=False
    ) as s:
        yield s


@pytest.fixture
async def taluka(session: AsyncSession) -> Taluka:
    """A throwaway Country > State > District > Taluka chain for constraint tests."""
    country = Country(code="ZZ", slug="testland", name_en="Testland", name_mr="टेस्टलँड")
    session.add(country)
    await session.flush()
    state = State(country_id=country.id, slug="test-state", name_en="Test", name_mr="टेस्ट")
    session.add(state)
    await session.flush()
    district = District(state_id=state.id, slug="test-district", name_en="T", name_mr="ट")
    session.add(district)
    await session.flush()
    row = Taluka(district_id=district.id, slug="test-taluka", name_en="T", name_mr="ट")
    session.add(row)
    await session.flush()
    return row


async def _violates(session: AsyncSession, row: Any, constraint: str) -> None:
    with pytest.raises(IntegrityError, match=constraint):
        async with session.begin_nested():
            session.add(row)
            await session.flush()


def _village(taluka: Taluka, **overrides: Any) -> Village:
    values: dict[str, Any] = {
        "taluka_id": taluka.id,
        "slug": "sample",
        "kind": "village",
        "name_en": "Sample",
        "name_mr": "नमुना",
    }
    values.update(overrides)
    return Village(**values)


# ------------------------------------------------------------------ constraints


@pytest.mark.parametrize(
    ("overrides", "constraint"),
    [
        ({"slug": "Bad Slug"}, "ck_villages_slug_format"),
        ({"slug": "trailing-"}, "ck_villages_slug_format"),
        ({"name_en": "   "}, "ck_villages_name_en_not_blank"),
        ({"name_mr": ""}, "ck_villages_name_mr_not_blank"),
        ({"name_hi": " "}, "ck_villages_name_hi_not_blank"),
        ({"kind": "metropolis"}, "ck_villages_kind_valid"),
        ({"lgd_code": 0}, "ck_villages_lgd_code_positive"),
    ],
)
async def test_check_constraints(
    session: AsyncSession, taluka: Taluka, overrides: dict[str, Any], constraint: str
) -> None:
    await _violates(session, _village(taluka, **overrides), constraint)


async def test_slug_unique_within_parent_only(session: AsyncSession, taluka: Taluka) -> None:
    session.add(_village(taluka, slug="beach"))
    await session.flush()

    await _violates(session, _village(taluka, slug="beach"), "uq_villages_taluka_id_slug")

    other = Taluka(district_id=taluka.district_id, slug="other", name_en="O", name_mr="ओ")
    session.add(other)
    await session.flush()
    session.add(_village(other, slug="beach"))
    await session.flush()  # same slug under a different taluka is allowed


async def test_lgd_code_unique(session: AsyncSession, taluka: Taluka) -> None:
    session.add(_village(taluka, slug="a", lgd_code=987654))
    await session.flush()
    await _violates(session, _village(taluka, slug="b", lgd_code=987654), "uq_villages_lgd_code")


async def test_country_code_must_be_iso_alpha2(session: AsyncSession) -> None:
    row = Country(code="zz", slug="x", name_en="X", name_mr="क")
    await _violates(session, row, "ck_countries_code_iso_alpha2")


async def test_parent_with_children_cannot_be_deleted(
    session: AsyncSession, taluka: Taluka
) -> None:
    session.add(_village(taluka))
    await session.flush()

    with pytest.raises(IntegrityError, match="fk_villages_taluka_id_talukas"):
        async with session.begin_nested():
            await session.execute(text("DELETE FROM talukas WHERE id = :id"), {"id": taluka.id})


async def test_updated_at_trigger_overrides_supplied_value(
    session: AsyncSession, taluka: Taluka
) -> None:
    await session.execute(
        text("UPDATE talukas SET name_en = 'Renamed', updated_at = '2000-01-01' WHERE id = :id"),
        {"id": taluka.id},
    )
    updated_at = await session.scalar(
        text("SELECT updated_at FROM talukas WHERE id = :id"), {"id": taluka.id}
    )
    assert updated_at is not None
    assert updated_at.year > 2000


async def test_spatial_index_is_used_for_distance_queries(
    session: AsyncSession, taluka: Taluka
) -> None:
    session.add(_village(taluka, centroid="SRID=4326;POINT(73.19 17.76)"))
    await session.flush()
    await session.execute(text("SET LOCAL enable_seqscan = off"))

    plan = "\n".join(
        (
            await session.execute(
                text(
                    "EXPLAIN SELECT id FROM villages WHERE ST_DWithin(centroid, "
                    "ST_GeogFromText('SRID=4326;POINT(73.2 17.75)'), 5000)"
                )
            )
        ).scalars()
    )
    assert "ix_villages_centroid" in plan
    nearby = await session.scalar(
        text(
            "SELECT count(*) FROM villages WHERE ST_DWithin(centroid, "
            "ST_GeogFromText('SRID=4326;POINT(73.2 17.75)'), 5000)"
        )
    )
    assert nearby == 1


# ------------------------------------------------------------------ seed


async def test_seed_creates_hierarchy_and_is_idempotent(session: AsyncSession) -> None:
    data = load_region_seed()
    await seed_regions(session, data)
    second = await seed_regions(session, data)

    assert second.total("created") == 0
    assert second.total("updated") == 0
    assert second.total("unchanged") == 62

    rows = await session.execute(
        select(District.slug, func.count(Taluka.id))
        .join(Taluka, Taluka.district_id == District.id)
        .group_by(District.slug)
    )
    taluka_counts: dict[str, int] = dict(rows.tuples().all())
    assert taluka_counts == {"ratnagiri": 9, "raigad": 15}


async def test_seed_updates_names_but_preserves_unmanaged_columns(
    session: AsyncSession,
) -> None:
    data = load_region_seed()
    await seed_regions(session, data)
    dapoli = (await session.execute(select(Taluka).filter_by(slug="dapoli"))).scalar_one()
    dapoli.name_en = "Wrong Name"
    dapoli.lgd_code = 123456
    dapoli.is_active = False
    await session.flush()

    report = await seed_regions(session, data)
    await session.refresh(dapoli)

    assert report.updated == {"talukas": 1}
    assert dapoli.name_en == "Dapoli"  # managed by the seed: restored
    assert dapoli.lgd_code == 123456  # not managed: preserved
    assert dapoli.is_active is False  # admin decision: preserved


async def test_seed_places_marathi_names(session: AsyncSession) -> None:
    await seed_regions(session, load_region_seed())
    village = (await session.execute(select(Village).filter_by(slug="ganpatipule"))).scalar_one()

    assert village.name_mr == "गणपतीपुळे"
    assert village.kind == "village"
    assert village.name_hi is None


# ------------------------------------------------------------------ roles and migrations


async def test_app_role_can_read_region_tables(app_engine: AsyncEngine) -> None:
    async with app_engine.connect() as conn:
        for table in REGION_TABLES:
            count = await conn.scalar(text(f"SELECT count(*) FROM {table}"))  # noqa: S608
            assert count is not None


async def test_migration_round_trip(migrator_conn: AsyncConnection) -> None:
    """downgrade to 0001 then upgrade to head inside a rolled-back transaction."""

    def run(sync_conn: Connection) -> list[str]:
        config = Config()
        config.set_main_option("script_location", str(MIGRATIONS_DIR))
        config.attributes["connection"] = sync_conn
        config.attributes["skip_logging_config"] = True
        command.downgrade(config, "0001")
        after_down = sync_conn.execute(
            text("SELECT to_regclass('public.villages') IS NULL")
        ).scalar_one()
        assert after_down, "downgrade did not drop the region tables"
        command.upgrade(config, "head")
        return [
            row[0]
            for row in sync_conn.execute(
                text(
                    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' "
                    "AND tablename = ANY(:names) ORDER BY tablename"
                ),
                {"names": list(REGION_TABLES)},
            )
        ]

    tables = await migrator_conn.run_sync(run)
    assert tables == sorted(REGION_TABLES)
