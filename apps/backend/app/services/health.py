"""Health checks.

Liveness only for now. A readiness check (database, Redis) is added in Sprint 0.3 once those
services exist, so the endpoint never reports dependencies it cannot actually verify.
"""

from app import __version__
from app.schemas.health import HealthResponse


def get_liveness() -> HealthResponse:
    return HealthResponse(status="ok", version=__version__)
