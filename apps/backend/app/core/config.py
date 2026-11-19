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
from sqlalchemy import URL


def find_repo_env_file(start: Path) -> Path | None:
    """Return the `.env` beside the nearest ancestor containing `.env.example`.

    Works at any directory depth. In containers there is no `.env.example`, so this returns
    None and settings come purely from the environment.
    """
    for directory in start.resolve().parents:
        if (directory / ".env.example").is_file():
            return directory / ".env"
    return None


_REPO_ROOT_ENV = find_repo_env_file(Path(__file__))

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

    # Database. Two roles, least privilege:
    #   migrator: owns schema objects, runs Alembic (DDL)
    #   app:      used by the API at runtime (DML only)
    postgres_host: str = "localhost"
    postgres_port: int = Field(default=5432, gt=0, lt=65536)
    postgres_db: str = "konkan"
    db_migrator_user: str = "konkan_migrator"
    db_migrator_password: SecretStr = SecretStr("")
    db_app_user: str = "konkan_app"
    db_app_password: SecretStr = SecretStr("")
    db_pool_size: int = Field(default=5, gt=0)
    db_max_overflow: int = Field(default=10, ge=0)
    db_connect_timeout_seconds: float = Field(default=5.0, gt=0)

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

    def _database_url(self, user: str, password: SecretStr) -> URL:
        # URL.create escapes special characters in credentials safely.
        return URL.create(
            "postgresql+asyncpg",
            username=user,
            password=password.get_secret_value(),
            host=self.postgres_host,
            port=self.postgres_port,
            database=self.postgres_db,
        )

    @property
    def app_database_url(self) -> URL:
        return self._database_url(self.db_app_user, self.db_app_password)

    @property
    def migrator_database_url(self) -> URL:
        return self._database_url(self.db_migrator_user, self.db_migrator_password)

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
