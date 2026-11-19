import re

import httpx
import pytest

_GENERATED_ID = re.compile(r"^[0-9a-f]{32}$")


async def test_generates_request_id_when_absent(client: httpx.AsyncClient) -> None:
    response = await client.get("/api/v1/health")

    assert _GENERATED_ID.match(response.headers["x-request-id"])


async def test_request_ids_are_unique_per_request(client: httpx.AsyncClient) -> None:
    first = (await client.get("/api/v1/health")).headers["x-request-id"]
    second = (await client.get("/api/v1/health")).headers["x-request-id"]

    assert first != second


async def test_echoes_safe_caller_request_id(client: httpx.AsyncClient) -> None:
    response = await client.get("/api/v1/health", headers={"X-Request-ID": "trace-abc.123_x"})

    assert response.headers["x-request-id"] == "trace-abc.123_x"


@pytest.mark.parametrize(
    "unsafe_id",
    [
        "a" * 65,  # too long
        "bad id with spaces",
        "inject\\nfake-log-line",
        "<script>",
    ],
)
async def test_replaces_unsafe_caller_request_id(client: httpx.AsyncClient, unsafe_id: str) -> None:
    response = await client.get("/api/v1/health", headers={"X-Request-ID": unsafe_id})

    assert _GENERATED_ID.match(response.headers["x-request-id"])


async def test_request_id_added_to_error_responses(client: httpx.AsyncClient) -> None:
    response = await client.get("/api/v1/does-not-exist")

    assert response.status_code == 404
    assert _GENERATED_ID.match(response.headers["x-request-id"])
