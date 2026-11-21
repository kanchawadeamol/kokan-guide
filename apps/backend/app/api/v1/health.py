from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncEngine

from app.db.session import get_engine
from app.schemas.health import HealthResponse, ReadinessResponse
from app.services.health import get_liveness, get_readiness

router = APIRouter(prefix="/health", tags=["health"])


def get_expected_migration_head(request: Request) -> str | None:
    head: str | None = request.app.state.expected_migration_head
    return head


@router.get("", summary="Liveness check")
async def get_health() -> HealthResponse:
    return get_liveness()


@router.get(
    "/ready",
    summary="Readiness check (database, PostGIS, schema at migration head)",
    responses={status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ReadinessResponse}},
)
async def get_readiness_status(
    response: Response,
    engine: Annotated[AsyncEngine, Depends(get_engine)],
    expected_head: Annotated[str | None, Depends(get_expected_migration_head)],
) -> ReadinessResponse:
    result = await get_readiness(engine, expected_head)
    if result.status != "ready":
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return result
