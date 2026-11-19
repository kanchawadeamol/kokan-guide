"""Ensure the PostGIS extension is available.

Locally the extension is created by the database init script (superuser). On managed
databases where the migrator may create it, this migration does so. `IF NOT EXISTS`
makes it a no-op when it is already installed.

Downgrade intentionally does NOT drop PostGIS: spatial columns in later migrations depend on
it, and dropping an extension is a destructive, superuser-level operation.

Revision ID: 0001
Revises:
Create Date: 2026-11-20
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0001"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")


def downgrade() -> None:
    pass
