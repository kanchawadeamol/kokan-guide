"""Validated region seed data and an idempotent upsert into the hierarchy tables.

The seed manages only what it declares (codes, names, kind). It never deletes rows, never
deactivates them, and never touches columns it does not own (`lgd_code`, `centroid`,
`is_active`), so later authoritative imports and admin edits are preserved.
"""

import json
import re
from collections.abc import Sequence
from dataclasses import dataclass, field
from pathlib import Path
from typing import Annotated, Any, Self

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base
from app.db.mixins import SLUG_MAX_LENGTH, SLUG_PATTERN
from app.models import Country, District, State, Taluka, Village, VillageKind

DEFAULT_SEED_FILE = Path(__file__).with_name("regions.json")

_DEVANAGARI = re.compile(r"[ऀ-ॿ]")

Slug = Annotated[str, StringConstraints(pattern=SLUG_PATTERN, max_length=SLUG_MAX_LENGTH)]
Text = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]


class _Strict(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)


class SeedName(_Strict):
    en: Text
    mr: Text
    hi: Text | None = None

    @model_validator(mode="after")
    def _scripts(self) -> Self:
        if _DEVANAGARI.search(self.en):
            raise ValueError(f"English name must not be in Devanagari: {self.en!r}")
        for lang in ("mr", "hi"):
            value = getattr(self, lang)
            if value is not None and not _DEVANAGARI.search(value):
                raise ValueError(f"{lang} name must be in Devanagari: {value!r}")
        return self


def _unique_slugs(children: Sequence[Any], level: str) -> None:
    seen: set[str] = set()
    for child in children:
        if child.slug in seen:
            raise ValueError(f"duplicate {level} slug {child.slug!r} under the same parent")
        seen.add(child.slug)


class PlaceSeed(_Strict):
    slug: Slug
    kind: VillageKind
    name: SeedName


class TalukaSeed(_Strict):
    slug: Slug
    name: SeedName
    places: list[PlaceSeed] = Field(default_factory=list)

    @model_validator(mode="after")
    def _unique(self) -> Self:
        _unique_slugs(self.places, "place")
        return self


class DistrictSeed(_Strict):
    slug: Slug
    name: SeedName
    talukas: list[TalukaSeed] = Field(min_length=1)

    @model_validator(mode="after")
    def _unique(self) -> Self:
        _unique_slugs(self.talukas, "taluka")
        return self


class StateSeed(_Strict):
    code: Annotated[str, StringConstraints(pattern=r"^[A-Z]{2}-[A-Z0-9]{1,3}$")]
    slug: Slug
    name: SeedName
    districts: list[DistrictSeed] = Field(min_length=1)

    @model_validator(mode="after")
    def _unique(self) -> Self:
        _unique_slugs(self.districts, "district")
        return self


class CountrySeed(_Strict):
    code: Annotated[str, StringConstraints(pattern=r"^[A-Z]{2}$")]
    slug: Slug
    name: SeedName
    states: list[StateSeed] = Field(min_length=1)

    @model_validator(mode="after")
    def _unique(self) -> Self:
        _unique_slugs(self.states, "state")
        return self


class RegionSeed(_Strict):
    meta: dict[str, str] = Field(default_factory=dict)
    countries: list[CountrySeed] = Field(min_length=1)

    @model_validator(mode="after")
    def _unique(self) -> Self:
        _unique_slugs(self.countries, "country")
        codes = [c.code for c in self.countries]
        if len(codes) != len(set(codes)):
            raise ValueError("duplicate country code")
        return self


def load_region_seed(path: Path = DEFAULT_SEED_FILE) -> RegionSeed:
    return RegionSeed.model_validate(json.loads(path.read_text(encoding="utf-8")))


@dataclass
class SeedReport:
    created: dict[str, int] = field(default_factory=dict)
    updated: dict[str, int] = field(default_factory=dict)
    unchanged: dict[str, int] = field(default_factory=dict)

    def record(self, level: str, outcome: str) -> None:
        bucket: dict[str, int] = getattr(self, outcome)
        bucket[level] = bucket.get(level, 0) + 1

    def total(self, outcome: str) -> int:
        return sum(getattr(self, outcome).values())


def _apply(row: Any, values: dict[str, Any]) -> bool:
    """Set changed attributes; return True if anything changed."""
    changed = False
    for key, value in values.items():
        if getattr(row, key) != value:
            setattr(row, key, value)
            changed = True
    return changed


def _names(name: SeedName) -> dict[str, Any]:
    return {"name_en": name.en, "name_mr": name.mr, "name_hi": name.hi}


async def _upsert[M: Base](
    session: AsyncSession,
    report: SeedReport,
    level: str,
    model: type[M],
    natural_key: dict[str, Any],
    values: dict[str, Any],
) -> M:
    row = (await session.execute(select(model).filter_by(**natural_key))).scalar_one_or_none()
    if row is None:
        row = model(**natural_key, **values)
        session.add(row)
        await session.flush()
        report.record(level, "created")
    elif _apply(row, values):
        await session.flush()
        report.record(level, "updated")
    else:
        report.record(level, "unchanged")
    return row


async def seed_regions(session: AsyncSession, data: RegionSeed) -> SeedReport:
    """Upsert the whole hierarchy by natural key (parent + slug). Caller commits."""
    report = SeedReport()
    for c in data.countries:
        country = await _upsert(
            session,
            report,
            "countries",
            Country,
            {"code": c.code},
            {"slug": c.slug, **_names(c.name)},
        )
        for s in c.states:
            state = await _upsert(
                session,
                report,
                "states",
                State,
                {"country_id": country.id, "slug": s.slug},
                {"code": s.code, **_names(s.name)},
            )
            for d in s.districts:
                district = await _upsert(
                    session,
                    report,
                    "districts",
                    District,
                    {"state_id": state.id, "slug": d.slug},
                    _names(d.name),
                )
                for t in d.talukas:
                    taluka = await _upsert(
                        session,
                        report,
                        "talukas",
                        Taluka,
                        {"district_id": district.id, "slug": t.slug},
                        _names(t.name),
                    )
                    for p in t.places:
                        await _upsert(
                            session,
                            report,
                            "villages",
                            Village,
                            {"taluka_id": taluka.id, "slug": p.slug},
                            {"kind": p.kind.value, **_names(p.name)},
                        )
    return report
