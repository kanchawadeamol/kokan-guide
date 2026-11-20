from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncEngine

from app.db.session import get_engine
from app.schemas.health import HealthResponse, ReadinessResponse
from app.services.health import get_liveness, get_readiness

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", summary="Liveness check")
async def get_health() -> HealthResponse:
    return get_liveness()


@router.get(
    "/ready",
    summary="Readiness check (database and PostGIS)",
    responses={status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ReadinessResponse}},
)
async def get_readiness_status(
    response: Response, engine: Annotated[AsyncEngine, Depends(get_engine)]
) -> ReadinessResponse:
    result = await get_readiness(engine)
    if result.status != "ready":
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return result
