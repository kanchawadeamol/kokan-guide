# Development Checklist

Legend: `[x]` done **and verified**, `[~]` in progress / partially verified, `[ ]` not started.
Only tick an item after it has actually been run and checked.

## Sprint 0: Engineering foundation

### 0.1 Repository foundation

- [x] Audit existing repository (empty directory as of 2026-11-20)
- [x] Initialise Git repository (`main` branch)
- [x] Root `package.json` with npm workspaces (`apps/*`, `packages/*`)
- [x] `.gitignore` (secrets, env files, build output, caches)
- [x] `.gitattributes` (LF line endings for Windows dev machine)
- [x] `.editorconfig`, `.nvmrc`, Prettier config
- [x] `.env.example` with documented placeholders (no real secrets)
- [x] `CLAUDE.md`, `README.md`, ADR 0001 (monorepo structure)
- [x] Root `package-lock.json` generated, `npm run format:check` passes
- [x] Verified `.env` is ignored and `.env.example` is tracked
- Known: root `npm test`/`lint`/`typecheck` exit with "No workspaces found" until the first
  workspace (0.4) exists. Expected; do not wire into CI before then.

### 0.2 Backend scaffold (`apps/backend`)

- [x] `pyproject.toml` (FastAPI 0.165, Pydantic 2.14, SQLAlchemy 2.0.58, Alembic 1.20,
      asyncpg, GeoAlchemy2, structlog)
- [x] Settings via pydantic-settings with production safety validation (JWT secret length,
      https-only CORS, no wildcard origins); secrets as `SecretStr`
- [x] Structured logging (JSON in staging/production) + request ID middleware
- [x] `GET /api/v1/health` liveness endpoint (service layer, Pydantic schema)
- [x] OpenAPI docs served under `/api/v1/docs`, disabled in production
- [x] Ruff (incl. bandit rules), Mypy strict, Pytest + HTTPX: 37 tests pass, 98% coverage
- [x] Smoke-tested with real uvicorn server; `pip-audit`: no known vulnerabilities
- [x] Dependency lock files (hash-pinned, generated in Linux image): done in 0.3
- [x] Readiness endpoint `GET /api/v1/health/ready` (DB + PostGIS, 503 when not ready): 0.3

### 0.3 Docker & database

- [x] Docker Desktop running (engine 28.0.4; started via `docker desktop start`)
- [x] Compose: PostGIS `17-3.7` (PG 17.12, PostGIS 3.7.0), `migrate` one-shot, `api`,
      Redis 8 under optional `redis` profile
- [x] Health checks on db (TCP, so not healthy until init scripts finish), api, redis
- [x] Named volumes; base `compose.yaml` publishes no ports (verified); dev override binds
      127.0.0.1 only
- [x] Three DB roles: superuser (init), migrator (DDL), app (DML only). Verified by 14
      integration tests: no DDL, no superuser flags, DML on migrator tables, cannot connect
      to `postgres`/`template1`/`template_postgis`
- [x] Removed unused `postgis_topology` and its `search_path` entry (was breaking
      `alembic check`)
- [x] Multi-stage Dockerfile; runtime image 222 MB, uid 10001, code read-only, no dev tools;
      production-like run verified with read-only rootfs + `no-new-privileges`
- [x] Alembic (async, migrator role, URL from settings) + migration `0001` (PostGIS);
      `alembic check` clean
- [x] Backup/restore commands documented and verified (`docs/database/README.md`)
- [x] Unit tests also pass inside the Linux dev container (41 passed)
- [ ] Redis not yet used by the backend (wire up with rate limiting in Sprint 2/7)

### 0.4 Shared packages

- [ ] `packages/design-tokens`
- [ ] `packages/shared-types`
- [ ] `packages/api-client` (OpenAPI codegen)
- [ ] Shared TS config (strict) and ESLint flat config

### 0.5 Admin app (`apps/admin`)

- [ ] Vite + React + TS strict, ESLint, Vitest + RTL, Playwright

### 0.6 Web app (`apps/web`)

- [ ] Next.js + TS strict, ESLint, Vitest + RTL, Playwright

### 0.7 Mobile app (`apps/mobile`)

- [ ] Expo SDK 58 + Expo Router + TS strict, Jest + jest-expo, RNTL
- [ ] Maestro installed and smoke flow (requires Java 17+; machine has Java 8)

### 0.8 CI/CD

- [ ] GitHub Actions: install, lint, format, typecheck, tests, builds
- [ ] Security checks (npm audit, pip-audit, secret scanning, CodeQL/Dependabot)
- [ ] GitHub remote configured (none yet; `gh` CLI not installed)

### 0.9 Environment validation

- [ ] Full stack starts with `docker compose up` and health checks pass
- [ ] All lint/type/test commands green from a clean clone

## Sprint 1 to Sprint 10

Not started. See project brief in `CLAUDE.md`.
