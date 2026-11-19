"""App-factory behaviour: API docs exposure and CORS policy."""

import httpx
import pytest

from app.main import create_app
from tests.conftest import SettingsFactory

STRONG_SECRET = "x" * 64


def _client(app: object) -> httpx.AsyncClient:
    return httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),  # type: ignore[arg-type]
        base_url="http://testserver",
    )


async def test_openapi_schema_available_outside_production(client: httpx.AsyncClient) -> None:
    response = await client.get("/api/v1/openapi.json")

    assert response.status_code == 200
    assert "/api/v1/health" in response.json()["paths"]


async def test_docs_disabled_in_production(make_settings: SettingsFactory) -> None:
    app = create_app(make_settings(app_env="production", jwt_secret_key=STRONG_SECRET))

    async with _client(app) as client:
        assert (await client.get("/api/v1/openapi.json")).status_code == 404
        assert (await client.get("/api/v1/docs")).status_code == 404
        assert (await client.get("/api/v1/health")).status_code == 200


async def test_cors_preflight_allows_configured_origin(client: httpx.AsyncClient) -> None:
    response = await client.options(
        "/api/v1/health",
        headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"},
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


@pytest.mark.parametrize("origin", ["https://evil.example", "http://localhost:3001"])
async def test_cors_does_not_allow_unlisted_origin(client: httpx.AsyncClient, origin: str) -> None:
    response = await client.get("/api/v1/health", headers={"Origin": origin})

    assert "access-control-allow-origin" not in response.headers


async def test_no_cors_headers_when_no_origins_configured(
    make_settings: SettingsFactory,
) -> None:
    app = create_app(make_settings())

    async with _client(app) as client:
        response = await client.get("/api/v1/health", headers={"Origin": "http://localhost:3000"})

    assert "access-control-allow-origin" not in response.headers
