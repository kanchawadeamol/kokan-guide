from typing import Literal

from pydantic import BaseModel, ConfigDict


class HealthResponse(BaseModel):
    """Liveness response. Deliberately minimal: no environment, hostnames or dependency details."""

    model_config = ConfigDict(frozen=True)

    status: Literal["ok"]
    version: str
