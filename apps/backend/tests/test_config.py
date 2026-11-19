import pytest
from pydantic import ValidationError

from app.core.config import Environment
from tests.conftest import SettingsFactory

STRONG_SECRET = "x" * 64


def test_defaults_are_safe_for_development(make_settings: SettingsFactory) -> None:
    settings = make_settings(app_env="development")

    assert settings.app_env is Environment.DEVELOPMENT
    assert settings.cors_allowed_origins == []
    assert settings.docs_enabled is True


def test_parses_comma_separated_cors_origins(make_settings: SettingsFactory) -> None:
    settings = make_settings(
        cors_allowed_origins=" http://localhost:3000 , http://localhost:5173,, "
    )

    assert settings.cors_allowed_origins == ["http://localhost:3000", "http://localhost:5173"]


def test_reads_cors_origins_from_environment(
    make_settings: SettingsFactory, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("CORS_ALLOWED_ORIGINS", "http://a.test,http://b.test")

    assert make_settings().cors_allowed_origins == ["http://a.test", "http://b.test"]


@pytest.mark.parametrize("origins", ["*", "https://*.example.com", "localhost:3000"])
def test_rejects_wildcard_or_schemeless_origins(
    make_settings: SettingsFactory, origins: str
) -> None:
    with pytest.raises(ValidationError):
        make_settings(cors_allowed_origins=origins)


@pytest.mark.parametrize("env", ["staging", "production"])
@pytest.mark.parametrize("secret", ["", "too-short"])
def test_deployed_environments_require_strong_jwt_secret(
    make_settings: SettingsFactory, env: str, secret: str
) -> None:
    with pytest.raises(ValidationError, match="JWT_SECRET_KEY"):
        make_settings(app_env=env, jwt_secret_key=secret)


def test_production_rejects_plain_http_origins(make_settings: SettingsFactory) -> None:
    with pytest.raises(ValidationError, match="https"):
        make_settings(
            app_env="production",
            jwt_secret_key=STRONG_SECRET,
            cors_allowed_origins="http://konkan.example",
        )


def test_production_accepts_valid_configuration(make_settings: SettingsFactory) -> None:
    settings = make_settings(
        app_env="production",
        jwt_secret_key=STRONG_SECRET,
        cors_allowed_origins="https://konkan.example",
    )

    assert settings.is_production
    assert settings.docs_enabled is False


def test_log_level_is_normalised(make_settings: SettingsFactory) -> None:
    assert make_settings(log_level="debug").log_level == "DEBUG"


def test_invalid_log_level_rejected(make_settings: SettingsFactory) -> None:
    with pytest.raises(ValidationError):
        make_settings(log_level="verbose")


def test_secrets_are_not_exposed_in_repr(make_settings: SettingsFactory) -> None:
    settings = make_settings(jwt_secret_key=STRONG_SECRET, db_app_password="db-pass-123")

    rendered = repr(settings) + str(settings.model_dump())
    assert STRONG_SECRET not in rendered
    assert "db-pass-123" not in rendered


def test_unknown_environment_rejected(make_settings: SettingsFactory) -> None:
    with pytest.raises(ValidationError):
        make_settings(app_env="prod")
