from fastapi import APIRouter

from app.schemas.health import HealthResponse
from app.services.health import get_liveness

router = APIRouter(tags=["health"])


@router.get("/health", summary="Liveness check")
async def health() -> HealthResponse:
    return get_liveness()
