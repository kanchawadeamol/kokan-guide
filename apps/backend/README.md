# Backend: Konkan Discovery API

FastAPI service exposing the versioned REST API (`/api/v1`) and, in later sprints, the AI
service layer.

## Layout

```
app/
  main.py            # create_app() factory: middleware, CORS, routers
  core/
    config.py        # Settings (pydantic-settings), production safety checks
    logging.py       # structlog: JSON in staging/production, console in dev
    middleware.py    # Request ID + structured access log (pure ASGI)
  api/v1/            # Route handlers only: thin, delegate to services
  services/          # Business logic
  schemas/           # Pydantic request/response models
tests/               # pytest + httpx ASGI client
```

Rules: route handlers contain no business logic; every response uses a Pydantic schema.

## Local setup (Windows PowerShell)

```powershell
cd apps/backend
py -3.12 -m venv .venv
.venv\Scripts\python -m pip install -e ".[dev]"
```

## Run

Recommended: the full stack via Docker Compose from the repository root (see root README).
The API then runs in a container with live reload of `app/`.

To run the API directly on the host against the Compose database:

```powershell
.venv\Scripts\uvicorn app.main:create_app --factory --reload --port 8001
```

- Liveness: http://127.0.0.1:8000/api/v1/health (process up; no dependency checks)
- Readiness: http://127.0.0.1:8000/api/v1/health/ready (DB + PostGIS; `503` if not ready)
- OpenAPI docs (disabled when `APP_ENV=production`): http://127.0.0.1:8000/api/v1/docs

Settings come from environment variables, falling back to the repository-root `.env`.
Use `POSTGRES_HOST=127.0.0.1`, not `localhost`: on Windows, `localhost` tries IPv6 first and
each refused attempt adds about 2 s.

## Docker image

`Dockerfile` stages: `deps` → `deps-dev` → `dev` (tests, reload) / `runtime` (production,
default). Runtime runs as uid 10001, code is root-owned and read-only, no dev tools, and
Compose runs it with a read-only root filesystem and `no-new-privileges`.

Dependencies install from **hash-pinned lock files** (`requirements.lock`,
`requirements-dev.lock`). After changing dependencies in `pyproject.toml`, regenerate them
inside the same Linux image the Dockerfile uses (from the repository root):

```bash
MSYS_NO_PATHCONV=1 docker run --rm -v "$PWD/apps/backend:/src" -w /src \
  python:3.12-slim-bookworm sh scripts/lock.sh
```

## Database and migrations

See [`docs/database/README.md`](../../docs/database/README.md) for roles, migrations and
backup/restore.

## Quality checks

```powershell
.venv\Scripts\python -m pytest --cov=app   # unit tests + coverage (no database needed)
.venv\Scripts\python -m pytest -m integration   # live DB tests (needs `docker compose up`)
.venv\Scripts\alembic check                # ORM models match the migrated database
.venv\Scripts\ruff check .                 # lint (incl. bandit security rules)
.venv\Scripts\ruff format --check .        # formatting
.venv\Scripts\mypy                         # strict type checking
.venv\Scripts\pip-audit --strict --disable-pip --require-hashes -r requirements-dev.lock
```

`pip-audit` checks the hash-locked dependency set (what CI installs and Docker deploys), not
the local virtualenv, so `--strict` works without tripping over the editable install.

Tests never read your `.env`: they build `Settings(_env_file=None)` and clear relevant
environment variables.

## Configuration safety

`Settings` refuses to start when:

- `APP_ENV` is `staging`/`production` and `JWT_SECRET_KEY` is shorter than 32 chars
- `APP_ENV` is `staging`/`production` and any CORS origin uses `http://`
- any CORS origin is a wildcard or has no scheme
