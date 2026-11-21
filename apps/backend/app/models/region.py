"""Regional hierarchy: Country -> State -> District -> Taluka -> Village/Town/City.

Generic by design (ADR 0003): no district is special-cased in schema or code. Ratnagiri and
Raigad exist only as seed data.
"""

import uuid
from enum import StrEnum
from typing import Any

from geoalchemy2 import Geography, WKBElement
from sqlalchemy import CheckConstraint, ForeignKey, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import (
    SLUG_PATTERN,
    ActiveMixin,
    LocalizedNameMixin,
    TimestampMixin,
    UUIDPrimaryKeyMixin,
    slug_column_type,
)


class VillageKind(StrEnum):
    VILLAGE = "village"
    TOWN = "town"
    CITY = "city"


def _common_checks() -> tuple[CheckConstraint, ...]:
    """Constraints shared by every region table (names resolved by the naming convention)."""
    return (
        CheckConstraint(f"slug ~ '{SLUG_PATTERN}'", name="slug_format"),
        CheckConstraint("btrim(name_en) <> ''", name="name_en_not_blank"),
        CheckConstraint("btrim(name_mr) <> ''", name="name_mr_not_blank"),
        CheckConstraint("name_hi IS NULL OR btrim(name_hi) <> ''", name="name_hi_not_blank"),
    )


def _centroid() -> Mapped[WKBElement | None]:
    # spatial_index=False: the GiST index is declared explicitly in __table_args__ so the
    # migration and the model describe exactly the same index.
    return mapped_column(Geography(geometry_type="POINT", srid=4326, spatial_index=False))


def _gist_index(table: str) -> Index:
    return Index(f"ix_{table}_centroid", "centroid", postgresql_using="gist")


class Country(UUIDPrimaryKeyMixin, TimestampMixin, LocalizedNameMixin, ActiveMixin, Base):
    __tablename__ = "countries"
    __table_args__: Any = (
        UniqueConstraint("code"),
        UniqueConstraint("slug"),
        CheckConstraint("code ~ '^[A-Z]{2}$'", name="code_iso_alpha2"),
        *_common_checks(),
    )

    code: Mapped[str] = mapped_column(String(2))
    slug: Mapped[str] = mapped_column(slug_column_type)

    states: Mapped[list["State"]] = relationship(back_populates="country")


class State(UUIDPrimaryKeyMixin, TimestampMixin, LocalizedNameMixin, ActiveMixin, Base):
    __tablename__ = "states"
    __table_args__: Any = (
        UniqueConstraint("country_id", "slug"),
        UniqueConstraint("code"),
        CheckConstraint(
            "code IS NULL OR code ~ '^[A-Z]{2}-[A-Z0-9]{1,3}$'", name="code_iso_3166_2"
        ),
        *_common_checks(),
    )

    country_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("countries.id", ondelete="RESTRICT"))
    code: Mapped[str | None] = mapped_column(String(6))
    slug: Mapped[str] = mapped_column(slug_column_type)

    country: Mapped[Country] = relationship(back_populates="states")
    districts: Mapped[list["District"]] = relationship(back_populates="state")


class District(UUIDPrimaryKeyMixin, TimestampMixin, LocalizedNameMixin, ActiveMixin, Base):
    __tablename__ = "districts"
    __table_args__: Any = (
        UniqueConstraint("state_id", "slug"),
        UniqueConstraint("lgd_code"),
        CheckConstraint("lgd_code IS NULL OR lgd_code > 0", name="lgd_code_positive"),
        _gist_index("districts"),
        *_common_checks(),
    )

    state_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("states.id", ondelete="RESTRICT"))
    slug: Mapped[str] = mapped_column(slug_column_type)
    lgd_code: Mapped[int | None] = mapped_column(Integer)
    centroid: Mapped[WKBElement | None] = _centroid()

    state: Mapped[State] = relationship(back_populates="districts")
    talukas: Mapped[list["Taluka"]] = relationship(back_populates="district")


class Taluka(UUIDPrimaryKeyMixin, TimestampMixin, LocalizedNameMixin, ActiveMixin, Base):
    __tablename__ = "talukas"
    __table_args__: Any = (
        UniqueConstraint("district_id", "slug"),
        UniqueConstraint("lgd_code"),
        CheckConstraint("lgd_code IS NULL OR lgd_code > 0", name="lgd_code_positive"),
        _gist_index("talukas"),
        *_common_checks(),
    )

    district_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("districts.id", ondelete="RESTRICT"))
    slug: Mapped[str] = mapped_column(slug_column_type)
    lgd_code: Mapped[int | None] = mapped_column(Integer)
    centroid: Mapped[WKBElement | None] = _centroid()

    district: Mapped[District] = relationship(back_populates="talukas")
    villages: Mapped[list["Village"]] = relationship(back_populates="taluka")


class Village(UUIDPrimaryKeyMixin, TimestampMixin, LocalizedNameMixin, ActiveMixin, Base):
    """A village, town or city (the brief's "Village / City" level)."""

    __tablename__ = "villages"
    __table_args__: Any = (
        UniqueConstraint("taluka_id", "slug"),
        UniqueConstraint("lgd_code"),
        CheckConstraint("lgd_code IS NULL OR lgd_code > 0", name="lgd_code_positive"),
        CheckConstraint(
            "kind IN (" + ", ".join(f"'{k.value}'" for k in VillageKind) + ")", name="kind_valid"
        ),
        _gist_index("villages"),
        *_common_checks(),
    )

    taluka_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("talukas.id", ondelete="RESTRICT"))
    kind: Mapped[str] = mapped_column(String(16))
    slug: Mapped[str] = mapped_column(slug_column_type)
    lgd_code: Mapped[int | None] = mapped_column(Integer)
    centroid: Mapped[WKBElement | None] = _centroid()

    taluka: Mapped[Taluka] = relationship(back_populates="villages")
