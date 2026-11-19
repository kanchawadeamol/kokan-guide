"""Fixtures for tests against the real Compose database.

Credentials come from the repository-root `.env` (or the environment in CI). These tests fail,
rather than skip, when the database is unreachable: selecting `-m integration` means the
database is expected to be running.
"""

from collections.abc import AsyncIterator

import pytest
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import Environment, Settings


@pytest.fixture
def live_settings() -> Settings:
    return Settings(app_env=Environment.TEST)


@pytest.fixture
async def app_engine(live_settings: Settings) -> AsyncIterator[AsyncEngine]:
    engine = create_async_engine(live_settings.app_database_url, poolclass=NullPool)
    yield engine
    await engine.dispose()


@pytest.fixture
async def migrator_engine(live_settings: Settings) -> AsyncIterator[AsyncEngine]:
    engine = create_async_engine(live_settings.migrator_database_url, poolclass=NullPool)
    yield engine
    await engine.dispose()
