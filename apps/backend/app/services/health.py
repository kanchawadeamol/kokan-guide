"""Health checks.

- Liveness: the process is up. No dependency checks (a DB outage must not restart the API).
- Readiness: the API can serve traffic: database reachable and PostGIS available.
"""

import asyncio

import structlog
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncEngine

from app import __version__
from app.schemas.health import CheckStatus, HealthResponse, ReadinessChecks, ReadinessResponse

logger = structlog.get_logger(__name__)

READINESS_TIMEOUT_SECONDS = 3.0


def get_liveness() -> HealthResponse:
    return HealthResponse(status="ok", version=__version__)


async def get_readiness(engine: AsyncEngine) -> ReadinessResponse:
    database: CheckStatus = "fail"
    postgis: CheckStatus = "fail"
    try:
        async with asyncio.timeout(READINESS_TIMEOUT_SECONDS), engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            database = "ok"
            installed = await conn.scalar(
                text("SELECT 1 FROM pg_extension WHERE extname = 'postgis'")
            )
            postgis = "ok" if installed == 1 else "fail"
    except (SQLAlchemyError, OSError, TimeoutError) as exc:
        # Details go to logs only; the response never exposes them.
        logger.warning("readiness_check_failed", error_type=type(exc).__name__)

    checks = ReadinessChecks(database=database, postgis=postgis)
    ready = database == "ok" and postgis == "ok"
    return ReadinessResponse(status="ready" if ready else "unavailable", checks=checks)
