"""Database platform and least-privilege role checks against the live database."""

import uuid
from collections.abc import AsyncIterator
from pathlib import Path

import httpx
import pytest
from alembic.config import Config
from alembic.script import ScriptDirectory
from asyncpg.exceptions import InsufficientPrivilegeError
from sqlalchemy import text
from sqlalchemy.exc import ProgrammingError
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import Settings
from app.main import create_app

pytestmark = pytest.mark.integration

BACKEND_DIR = Path(__file__).resolve().parents[2]


async def test_postgres_and_postgis_versions(app_engine: AsyncEngine) -> None:
    async with app_engine.connect() as conn:
        server_version = await conn.scalar(text("SHOW server_version_num"))
        postgis_version = await conn.scalar(
            text("SELECT extversion FROM pg_extension WHERE extname = 'postgis'")
        )

    assert int(str(server_version)) // 10000 == 17
    assert str(postgis_version).startswith("3.7")


async def test_spatial_query_works(app_engine: AsyncEngine) -> None:
    # Straight-line distance Ratnagiri -> Dapoli is roughly 86 km (geography, metres).
    async with app_engine.connect() as conn:
        metres = await conn.scalar(
            text(
                "SELECT ST_Distance("
                "ST_SetSRID(ST_MakePoint(73.3120, 16.9902), 4326)::geography, "
                "ST_SetSRID(ST_MakePoint(73.1890, 17.7590), 4326)::geography)"
            )
        )

    assert 80_000 < float(metres) < 95_000


async def test_migrations_are_at_head(app_engine: AsyncEngine) -> None:
    script = ScriptDirectory.from_config(Config(str(BACKEND_DIR / "alembic.ini")))

    async with app_engine.connect() as conn:
        current = await conn.scalar(text("SELECT version_num FROM alembic_version"))

    assert current == script.get_current_head()


async def test_app_role_is_not_privileged(app_engine: AsyncEngine) -> None:
    async with app_engine.connect() as conn:
        row = (
            await conn.execute(
                text(
                    "SELECT rolsuper, rolcreatedb, rolcreaterole, rolbypassrls "
                    "FROM pg_roles WHERE rolname = current_user"
                )
            )
        ).one()

    assert tuple(row) == (False, False, False, False)


async def test_app_role_cannot_create_tables(app_engine: AsyncEngine) -> None:
    async with app_engine.connect() as conn:
        with pytest.raises(ProgrammingError, match="permission denied"):
            await conn.execute(text("CREATE TABLE should_not_exist (id int)"))


@pytest.fixture
async def probe_table(migrator_engine: AsyncEngine) -> AsyncIterator[str]:
    """A table created by the migrator, as a real migration would."""
    name = f"probe_{uuid.uuid4().hex[:12]}"
    async with migrator_engine.begin() as conn:
        await conn.execute(text(f"CREATE TABLE {name} (id serial PRIMARY KEY, label text)"))
    yield name
    async with migrator_engine.begin() as conn:
        await conn.execute(text(f"DROP TABLE IF EXISTS {name}"))


async def test_app_role_has_dml_on_migrator_tables(
    app_engine: AsyncEngine, probe_table: str
) -> None:
    async with app_engine.begin() as conn:
        await conn.execute(text(f"INSERT INTO {probe_table} (label) VALUES ('a')"))  # noqa: S608
        await conn.execute(text(f"UPDATE {probe_table} SET label = 'b'"))  # noqa: S608
        count = await conn.scalar(text(f"SELECT count(*) FROM {probe_table}"))  # noqa: S608
        await conn.execute(text(f"DELETE FROM {probe_table}"))  # noqa: S608

    assert count == 1


@pytest.mark.parametrize(
    "ddl",
    ["DROP TABLE {t}", "ALTER TABLE {t} ADD COLUMN extra int", "TRUNCATE {t}"],
)
async def test_app_role_cannot_alter_migrator_tables(
    app_engine: AsyncEngine, probe_table: str, ddl: str
) -> None:
    async with app_engine.connect() as conn:
        with pytest.raises(ProgrammingError, match=r"must be owner|permission denied"):
            await conn.execute(text(ddl.format(t=probe_table)))


async def test_readiness_reports_ready_against_live_database(live_settings: Settings) -> None:
    app = create_app(live_settings)

    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://testserver"
        ) as client,
    ):
        response = await client.get("/api/v1/health/ready")

    assert response.status_code == 200
    assert response.json() == {"status": "ready", "checks": {"database": "ok", "postgis": "ok"}}


async def test_only_expected_extensions_installed(app_engine: AsyncEngine) -> None:
    async with app_engine.connect() as conn:
        names = set((await conn.scalars(text("SELECT extname FROM pg_extension"))).all())
        search_path = await conn.scalar(text("SHOW search_path"))

    assert names == {"plpgsql", "postgis"}
    assert "topology" not in str(search_path)


@pytest.mark.parametrize("database", ["postgres", "template1", "template_postgis"])
async def test_app_role_cannot_connect_to_other_databases(
    live_settings: Settings, database: str
) -> None:
    url = live_settings.app_database_url.set(database=database)
    engine = create_async_engine(url, poolclass=NullPool)
    try:
        with pytest.raises(InsufficientPrivilegeError, match="permission denied for database"):
            async with engine.connect():
                pass
    finally:
        await engine.dispose()
