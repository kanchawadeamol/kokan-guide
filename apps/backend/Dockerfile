# syntax=docker/dockerfile:1
#
# Konkan backend image. Stages:
#   deps      -> production dependencies in /opt/venv (hash-verified)
#   deps-dev  -> + test/lint tooling
#   dev       -> dev image (tests, reload); build with --target dev
#   runtime   -> production image (default/final stage), non-root, no build tools

ARG PYTHON_IMAGE=python:3.12-slim-bookworm

# ------------------------------------------------------------------ deps
FROM ${PYTHON_IMAGE} AS deps
ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_ROOT_USER_ACTION=ignore \
    PYTHONDONTWRITEBYTECODE=1
RUN python -m venv /opt/venv
ENV PATH=/opt/venv/bin:$PATH
COPY requirements.lock /tmp/requirements.lock
RUN pip install --require-hashes --no-deps -r /tmp/requirements.lock

# ------------------------------------------------------------------ deps-dev
FROM deps AS deps-dev
COPY requirements-dev.lock /tmp/requirements-dev.lock
RUN pip install --require-hashes --no-deps -r /tmp/requirements-dev.lock

# ------------------------------------------------------------------ base runtime layout
FROM ${PYTHON_IMAGE} AS base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH=/opt/venv/bin:$PATH
RUN groupadd --system --gid 10001 app \
 && useradd --system --uid 10001 --gid app --no-create-home --shell /usr/sbin/nologin app
WORKDIR /srv
EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/v1/health', timeout=3)"]

# ------------------------------------------------------------------ dev
FROM base AS dev
COPY --from=deps-dev /opt/venv /opt/venv
# Code is owned by root and read-only to the app user.
COPY alembic.ini pyproject.toml ./
COPY migrations ./migrations
COPY app ./app
COPY tests ./tests
USER app
CMD ["uvicorn", "app.main:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "app"]

# ------------------------------------------------------------------ runtime (production)
FROM base AS runtime
COPY --from=deps /opt/venv /opt/venv
COPY alembic.ini ./
COPY migrations ./migrations
COPY app ./app
USER app
CMD ["uvicorn", "app.main:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "127.0.0.1", "--no-server-header"]
