from collections.abc import AsyncIterator, Callable
from typing import Any

import httpx
import pytest
from fastapi import FastAPI

from app.core.config import Settings
from app.main import create_app

SettingsFactory = Callable[..., Settings]


@pytest.fixture(autouse=True)
def _isolate_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    """Prevent the developer's shell environment from leaking into tests."""
    for name in (
        "APP_ENV",
        "LOG_LEVEL",
        "JWT_SECRET_KEY",
        "CORS_ALLOWED_ORIGINS",
        "DB_APP_PASSWORD",
    ):
        monkeypatch.delenv(name, raising=False)


@pytest.fixture
def make_settings() -> SettingsFactory:
    """Build Settings without reading any `.env` file."""

    def _make(**overrides: Any) -> Settings:
        values: dict[str, Any] = {"app_env": "test", **overrides}
        return Settings(_env_file=None, **values)

    return _make


@pytest.fixture
def app(make_settings: SettingsFactory) -> FastAPI:
    return create_app(make_settings(cors_allowed_origins="http://localhost:3000"))


@pytest.fixture
async def client(app: FastAPI) -> AsyncIterator[httpx.AsyncClient]:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as c:
        yield c
