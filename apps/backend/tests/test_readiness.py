"""Readiness behaviour without a database (unreachable host): no Docker required."""

import httpx

from app.main import create_app
from tests.conftest import SettingsFactory


async def test_readiness_returns_503_when_database_unreachable(
    make_settings: SettingsFactory,
) -> None:
    # Port 1 on loopback: connection refused immediately, no real database involved.
    app = create_app(
        make_settings(
            postgres_host="127.0.0.1",
            postgres_port=1,
            db_app_password="unused",
            db_connect_timeout_seconds=1,
        )
    )

    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://testserver"
        ) as client,
    ):
        response = await client.get("/api/v1/health/ready")

    assert response.status_code == 503
    assert response.json() == {
        "status": "unavailable",
        "checks": {"database": "fail", "postgis": "fail"},
    }


async def test_liveness_unaffected_by_database_outage(make_settings: SettingsFactory) -> None:
    app = create_app(make_settings(postgres_host="127.0.0.1", postgres_port=1))

    async with (
        app.router.lifespan_context(app),
        httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://testserver"
        ) as client,
    ):
        response = await client.get("/api/v1/health")

    assert response.status_code == 200
