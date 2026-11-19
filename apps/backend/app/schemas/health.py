from typing import Literal

from pydantic import BaseModel, ConfigDict

CheckStatus = Literal["ok", "fail"]


class HealthResponse(BaseModel):
    """Liveness response. Deliberately minimal: no environment, hostnames or dependency details."""

    model_config = ConfigDict(frozen=True)

    status: Literal["ok"]
    version: str


class ReadinessChecks(BaseModel):
    model_config = ConfigDict(frozen=True)

    database: CheckStatus
    postgis: CheckStatus


class ReadinessResponse(BaseModel):
    """Readiness response. Reports pass/fail per dependency, never error messages or hosts."""

    model_config = ConfigDict(frozen=True)

    status: Literal["ready", "unavailable"]
    checks: ReadinessChecks
