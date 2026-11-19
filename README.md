# Konkan Regional Discovery Platform

Discover local services, businesses and tourist attractions in **Ratnagiri** and **Raigad**
districts, Maharashtra. Available in Marathi, English and Hindi.

> **Status:** Sprint 0 (engineering foundation). No features are implemented yet. See
> [`docs/development-checklist.md`](docs/development-checklist.md) for verified progress.

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
- Python 3.12+
- Docker Desktop (Compose v2)
- Git

## Getting started

```bash
git clone <repo-url> konkan-discovery
cd konkan-discovery
cp .env.example .env      # then replace every `change-me` with a generated secret
npm install
npm run format:check
```

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

Further setup (web, admin, mobile) will be added as each Sprint 0 module is completed.

## Documentation

- [`CLAUDE.md`](CLAUDE.md): engineering rules and repository conventions
- [`docs/development-checklist.md`](docs/development-checklist.md): sprint checklist
- [`docs/architecture/`](docs/architecture/): architecture decision records

## Security

Never commit secrets. AI provider keys live only in backend environment configuration.
Report vulnerabilities privately to the maintainers.
