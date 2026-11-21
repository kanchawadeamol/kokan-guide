"""Alembic environment: async migrations as the migrator (schema owner) role.

Tests may pass an existing synchronous connection via `config.attributes["connection"]`; the
migrations then run inside the caller's transaction (which the test rolls back).
"""

import asyncio
from logging.config import fileConfig
from typing import Literal

from alembic import context
from geoalchemy2 import alembic_helpers
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool
from sqlalchemy.sql.schema import SchemaItem

import app.models  # noqa: F401  (registers all models on Base.metadata)
from app.core.config import get_settings
from app.db.base import Base

config = context.config
if config.config_file_name is not None and not config.attributes.get("skip_logging_config"):
    fileConfig(config.config_file_name, disable_existing_loggers=False)

target_metadata = Base.metadata

# Objects owned by PostGIS extensions; never autogenerate migrations for them.
_EXTENSION_TABLES = frozenset({"spatial_ref_sys"})
_EXTENSION_SCHEMAS = frozenset({"tiger", "tiger_data", "topology"})


def include_object(
    obj: SchemaItem,
    name: str | None,
    type_: Literal[
        "schema",
        "table",
        "column",
        "index",
        "unique_constraint",
        "foreign_key_constraint",
        "check_constraint",
    ],
    reflected: bool,
    compare_to: SchemaItem | None,
) -> bool:
    if type_ == "table" and name in _EXTENSION_TABLES:
        return False
    schema = getattr(obj, "schema", None)
    if schema in _EXTENSION_SCHEMAS:
        return False
    # GeoAlchemy2 helper: ignores spatial artefacts it manages itself.
    return bool(
        alembic_helpers.include_object(  # type: ignore[no-untyped-call]  # untyped upstream
            obj, name, type_, reflected, compare_to
        )
    )


def _configure(connection: Connection | None = None, url: str | None = None) -> None:
    context.configure(
        connection=connection,
        url=url,
        target_metadata=target_metadata,
        include_object=include_object,
        process_revision_directives=alembic_helpers.writer,
        render_item=alembic_helpers.render_item,
        compare_type=True,
        compare_server_default=True,
        literal_binds=connection is None,
        dialect_opts={"paramstyle": "named"} if connection is None else {},
    )


def run_migrations_offline() -> None:
    """Emit SQL to stdout without connecting (`alembic upgrade head --sql`)."""
    url = get_settings().migrator_database_url.render_as_string(hide_password=True)
    _configure(url=url)
    with context.begin_transaction():
        context.run_migrations()


def _run_sync(connection: Connection) -> None:
    _configure(connection=connection)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    engine = create_async_engine(get_settings().migrator_database_url, poolclass=NullPool)
    try:
        async with engine.connect() as connection:
            await connection.run_sync(_run_sync)
            await connection.commit()
    finally:
        await engine.dispose()


provided: Connection | None = config.attributes.get("connection")
if context.is_offline_mode():
    run_migrations_offline()
elif provided is not None:
    _run_sync(provided)
else:
    asyncio.run(run_migrations_online())
