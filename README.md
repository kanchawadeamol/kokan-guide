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
cp .env.example .env      # then fill in local values; never commit .env
npm install
npm run format:check
```

Further setup (backend, database, apps) will be added as each Sprint 0 module is completed.

## Documentation

- [`CLAUDE.md`](CLAUDE.md): engineering rules and repository conventions
- [`docs/development-checklist.md`](docs/development-checklist.md): sprint checklist
- [`docs/architecture/`](docs/architecture/): architecture decision records

## Security

Never commit secrets. AI provider keys live only in backend environment configuration.
Report vulnerabilities privately to the maintainers.
