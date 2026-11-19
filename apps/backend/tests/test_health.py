import httpx

from app import __version__


async def test_health_returns_ok_and_version(client: httpx.AsyncClient) -> None:
    response = await client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "version": __version__}


async def test_health_does_not_leak_environment_details(client: httpx.AsyncClient) -> None:
    body = (await client.get("/api/v1/health")).json()

    assert set(body) == {"status", "version"}


async def test_health_is_only_served_under_versioned_prefix(client: httpx.AsyncClient) -> None:
    assert (await client.get("/health")).status_code == 404


async def test_health_rejects_unsupported_method(client: httpx.AsyncClient) -> None:
    assert (await client.post("/api/v1/health")).status_code == 405
