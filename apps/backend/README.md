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

```powershell
.venv\Scripts\uvicorn app.main:create_app --factory --reload --port 8000
```

- Health: http://localhost:8000/api/v1/health
- OpenAPI docs (disabled when `APP_ENV=production`): http://localhost:8000/api/v1/docs

Settings come from environment variables, falling back to the repository-root `.env`.

## Quality checks

```powershell
.venv\Scripts\python -m pytest --cov=app   # tests + coverage
.venv\Scripts\ruff check .                 # lint (incl. bandit security rules)
.venv\Scripts\ruff format --check .        # formatting
.venv\Scripts\mypy                         # strict type checking
.venv\Scripts\pip-audit --skip-editable    # dependency vulnerabilities
```

Tests never read your `.env`: they build `Settings(_env_file=None)` and clear relevant
environment variables.

## Configuration safety

`Settings` refuses to start when:

- `APP_ENV` is `staging`/`production` and `JWT_SECRET_KEY` is shorter than 32 chars
- `APP_ENV` is `staging`/`production` and any CORS origin uses `http://`
- any CORS origin is a wildcard or has no scheme
