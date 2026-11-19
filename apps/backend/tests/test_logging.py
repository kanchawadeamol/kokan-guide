import json
import logging
from collections.abc import Iterator

import pytest
import structlog

from app.core.logging import configure_logging
from tests.conftest import SettingsFactory


@pytest.fixture(autouse=True)
def _restore_logging() -> Iterator[None]:
    root = logging.getLogger()
    handlers, level = root.handlers[:], root.level
    yield
    root.handlers[:] = handlers
    root.setLevel(level)
    structlog.reset_defaults()


def _last_line(capsys: pytest.CaptureFixture[str]) -> str:
    return capsys.readouterr().out.strip().splitlines()[-1]


def test_production_logs_are_json_with_context(
    make_settings: SettingsFactory, capsys: pytest.CaptureFixture[str]
) -> None:
    configure_logging(make_settings(app_env="production", jwt_secret_key="x" * 64))

    structlog.contextvars.bind_contextvars(request_id="req-1")
    try:
        structlog.get_logger("test").info("hello", answer=42)
    finally:
        structlog.contextvars.clear_contextvars()

    record = json.loads(_last_line(capsys))
    assert record["event"] == "hello"
    assert record["answer"] == 42
    assert record["request_id"] == "req-1"
    assert record["level"] == "info"
    assert "timestamp" in record


def test_stdlib_loggers_use_same_pipeline(
    make_settings: SettingsFactory, capsys: pytest.CaptureFixture[str]
) -> None:
    configure_logging(make_settings(app_env="production", jwt_secret_key="x" * 64))

    logging.getLogger("third.party").warning("from stdlib")

    record = json.loads(_last_line(capsys))
    assert record["event"] == "from stdlib"
    assert record["logger"] == "third.party"


def test_log_level_filters_lower_levels(
    make_settings: SettingsFactory, capsys: pytest.CaptureFixture[str]
) -> None:
    configure_logging(make_settings(log_level="WARNING"))

    structlog.get_logger("test").info("should be hidden")

    assert "should be hidden" not in capsys.readouterr().out
