# Konkan Regional Discovery Platform

Discover local services, businesses and tourist attractions in **Ratnagiri** and **Raigad**
districts, Maharashtra. Available in Marathi, English and Hindi.

> **Status:** Sprint 0 (engineering foundation) complete. Product features start in Sprint 1.
> See [`docs/development-checklist.md`](docs/development-checklist.md) for verified progress.

## Components

| App / package     | Purpose                                 | Stack                         |
| ----------------- | --------------------------------------- | ----------------------------- |
| `apps/mobile`     | Mobile app for users and owners         | Expo SDK 58, React Native, TS |
| `apps/web`        | Public SEO website                      | Next.js, TS                   |
| `apps/admin`      | Admin dashboard                         | React, Vite, TS               |
| `apps/backend`    | REST API (`/api/v1`) and AI service     | FastAPI, SQLAlchemy, Alembic  |
| `packages/*`      | Shared API client, types, design tokens | TypeScript                    |
| `infrastructure/` | Docker, PostgreSQL 17 + PostGIS 3.7     | Docker Compose                |

## Prerequisites

- Node.js 24+ and npm 11+ (see `.nvmrc`)
- Python 3.12
- Docker Desktop (Compose v2), running
- Git
- Mobile end-to-end tests and native builds only: Java 17+, Android SDK / Xcode, Maestro CLI

Commands below are for Git Bash, macOS or Linux. On Windows PowerShell, use
`.venv\Scripts\...` paths and `py -3.12` instead of `python3.12`.

## Getting started

```bash
git clone <repo-url> konkan-discovery
cd konkan-discovery

# 1. Environment: creates .env with generated secrets (never overwrites an existing one)
python scripts/create-dev-env.py

# 2. JavaScript workspaces (web, admin, mobile, shared packages)
npm ci

# 3. Backend virtualenv (tests, linting, migrations from the host)
cd apps/backend && python3.12 -m venv .venv && .venv/bin/python -m pip install -e ".[dev]" && cd ../..

# 4. Database + API (PostGIS -> migrations -> API)
docker compose up -d --build --wait
curl http://127.0.0.1:8000/api/v1/health/ready

# 5. One-time browser download for Playwright end-to-end tests
npx playwright install chromium
```

Then verify everything the way CI does:

```bash
npm run format:check && npm run lint && npm run typecheck && npm test && npm run api:check
(cd apps/backend && .venv/bin/python -m pytest --cov=app && .venv/bin/python -m pytest -m integration)
npm run test:e2e -w apps/admin && npm run test:e2e -w apps/web
```

### Running the apps

| App     | Command                        | URL / notes                                                  |
| ------- | ------------------------------ | ------------------------------------------------------------ |
| API     | `docker compose up -d --wait`  | http://127.0.0.1:8000/api/v1/docs                            |
| Admin   | `npm run dev -w apps/admin`    | http://127.0.0.1:5173                                        |
| Website | `npm run dev -w apps/web`      | http://127.0.0.1:3000                                        |
| Mobile  | `npm run start -w apps/mobile` | needs `apps/mobile/.env.local` (see `apps/mobile/README.md`) |

### Backend stack (Docker Compose)

```bash
docker compose up -d --build --wait     # db (PostGIS) -> migrate -> api
curl http://127.0.0.1:8000/api/v1/health/ready
docker compose logs -f api
docker compose down                     # stop (data kept); `down -v` also DELETES data
```

| Service   | Purpose                                         | Dev port (127.0.0.1 only) |
| --------- | ----------------------------------------------- | ------------------------- |
| `db`      | PostgreSQL 17 + PostGIS 3.7                     | 5432                      |
| `migrate` | One-shot `alembic upgrade head` (migrator role) | none                      |
| `api`     | FastAPI (app role, live reload in dev)          | 8000                      |
| `redis`   | Optional: `docker compose --profile redis up`   | none                      |

`compose.yaml` alone is production-like and publishes no ports; `compose.override.yaml` adds
dev ports and live reload. See [`apps/backend/README.md`](apps/backend/README.md) and
[`docs/database/README.md`](docs/database/README.md).

## Documentation

- [`CLAUDE.md`](CLAUDE.md): engineering rules and repository conventions
- [`docs/development-checklist.md`](docs/development-checklist.md): verified sprint checklist
- [`docs/architecture/adr/`](docs/architecture/adr/): architecture decision records
- [`docs/database/README.md`](docs/database/README.md): roles, migrations, backup/restore
- [`docs/testing/ci.md`](docs/testing/ci.md): CI pipeline and repository settings
- App guides: [backend](apps/backend/README.md), [admin](apps/admin/README.md),
  [web](apps/web/README.md), [mobile](apps/mobile/README.md)

## Security

This repository is public. Never commit secrets or personal data; a leaked secret must be
rotated. AI provider keys live only in backend environment configuration. Report
vulnerabilities privately through GitHub's private vulnerability reporting.
