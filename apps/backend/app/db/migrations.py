"""Expected Alembic head, read from the migration scripts shipped with the application."""

from pathlib import Path

from alembic.script import ScriptDirectory

# apps/backend/app/db/migrations.py -> apps/backend/migrations (same layout in the image).
MIGRATIONS_DIR = Path(__file__).resolve().parents[2] / "migrations"


def expected_migration_head(directory: Path = MIGRATIONS_DIR) -> str | None:
    """Return the single head revision, or None if the scripts are missing or branched."""
    if not directory.is_dir():
        return None
    heads = ScriptDirectory(str(directory)).get_heads()
    return heads[0] if len(heads) == 1 else None
