"""Application settings loaded from environment variables.

In containers, Compose injects the environment. For local development, the repository-root
`.env` is read if present. Secrets are typed as `SecretStr` so they never appear in logs or
reprs.
"""

from enum import StrEnum
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Self

from pydantic import Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

# apps/backend/app/core/config.py -> repository root is four levels up.
_REPO_ROOT_ENV = Path(__file__).resolve().parents[4] / ".env"

_MIN_JWT_SECRET_LENGTH = 32


class Environment(StrEnum):
    DEVELOPMENT = "development"
    TEST = "test"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_REPO_ROOT_ENV,
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_env: Environment = Environment.DEVELOPMENT
    log_level: str = "INFO"

    # Database (used from Sprint 0.3 onwards)
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "konkan"
    db_app_user: str = "konkan_app"
    db_app_password: SecretStr = SecretStr("")

    # Auth
    jwt_secret_key: SecretStr = SecretStr("")
    jwt_access_token_expire_minutes: int = Field(default=15, gt=0)
    jwt_refresh_token_expire_days: int = Field(default=14, gt=0)

    # CORS: explicit origins only. NoDecode lets the validator below parse a comma list.
    cors_allowed_origins: Annotated[list[str], NoDecode] = Field(default_factory=list)

    @field_validator("log_level")
    @classmethod
    def _normalise_log_level(cls, value: str) -> str:
        level = value.upper()
        if level not in {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}:
            raise ValueError(f"invalid log level: {value!r}")
        return level

    @field_validator("cors_allowed_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("cors_allowed_origins")
    @classmethod
    def _reject_wildcard_origins(cls, origins: list[str]) -> list[str]:
        for origin in origins:
            if "*" in origin:
                raise ValueError("wildcard CORS origins are not allowed")
            if not origin.startswith(("http://", "https://")):
                raise ValueError(f"CORS origin must include a scheme: {origin!r}")
        return origins

    @model_validator(mode="after")
    def _enforce_production_safety(self) -> Self:
        if self.app_env in {Environment.STAGING, Environment.PRODUCTION}:
            if len(self.jwt_secret_key.get_secret_value()) < _MIN_JWT_SECRET_LENGTH:
                raise ValueError(
                    f"JWT_SECRET_KEY must be at least {_MIN_JWT_SECRET_LENGTH} characters "
                    f"in {self.app_env}"
                )
            if any(o.startswith("http://") for o in self.cors_allowed_origins):
                raise ValueError(f"CORS origins must use https in {self.app_env}")
        return self

    @property
    def is_production(self) -> bool:
        return self.app_env is Environment.PRODUCTION

    @property
    def docs_enabled(self) -> bool:
        """Interactive API docs are disabled in production to reduce attack surface."""
        return not self.is_production


@lru_cache
def get_settings() -> Settings:
    return Settings()
