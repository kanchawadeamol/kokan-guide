"""ORM models. Import every model module here so `Base.metadata` is complete for Alembic."""

from app.models.region import Country, District, State, Taluka, Village, VillageKind

__all__ = ["Country", "District", "State", "Taluka", "Village", "VillageKind"]
