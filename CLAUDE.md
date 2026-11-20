# CLAUDE.md: Konkan Regional Discovery Platform

Guidance for Claude Code working in this repository.

## Product

A regional discovery platform (businesses, services, tourist places) for **Ratnagiri and Raigad**
districts, Maharashtra. Languages: **Marathi (mr), English (en), Hindi (hi)**. All user-facing
text must be localized. Region hierarchy is generic: Country → State → District → Taluka →
Village/City. Never hardcode Ratnagiri/Raigad in schema or logic (seed data only).

## Monorepo layout

| Path                     | Stack                                                    |
| ------------------------ | -------------------------------------------------------- |
| `apps/mobile`            | React Native, Expo SDK 58, Expo Router, TypeScript       |
| `apps/web`               | Next.js, TypeScript (public, SEO)                        |
| `apps/admin`             | React, Vite, TypeScript (admin dashboard)                |
| `apps/backend`           | Python 3.12, FastAPI, Pydantic, SQLAlchemy 2.x, Alembic  |
| `packages/api-client`    | Typed API client generated from backend OpenAPI          |
| `packages/shared-types`  | Shared TS types                                          |
| `packages/design-tokens` | Colours, spacing, typography shared by mobile/web/admin  |
| `infrastructure/`        | Docker, Compose, monitoring                              |
| `docs/`                  | Architecture, database, API, testing docs, dev checklist |

JS workspaces use **npm workspaces** (root `package-lock.json`). The backend is a standalone
Python project (not an npm workspace).

## Engineering rules

- Workflow: IMPLEMENT → TEST → REVIEW → FIX → VALIDATE → DOCUMENT → COMMIT.
- Work sprint by sprint, one logical module at a time. Update `docs/development-checklist.md`
  after every task.
- Never claim something works unless it was actually run and verified.
- Never skip/disable failing tests to make a build pass.
- No business logic in FastAPI route handlers; use service layer.
- Enforce authorization on the backend (geographic scoping for District/Taluka admins).
- AI: backend-only keys; never invent businesses, phone numbers, hours, prices or emergency
  contacts; ground answers in DB records; validate tool calls with Pydantic.
- Never commit `.env`, secrets, keys. Use `.env.example` for documented placeholders.
- Ask before destructive changes or activating paid services.
- TypeScript strict mode everywhere; Ruff + Mypy for Python.
- Accessibility target: WCAG 2.2 AA.

## Commands (root)

```bash
npm install            # install all JS workspaces
npm run format:check   # Prettier
npm run lint           # ESLint over the whole repo (one pass)
npm run typecheck      # tsc in every workspace
npm test               # Vitest in every workspace
npm run api:generate   # regenerate packages/api-client from backend OpenAPI
npm run api:check      # fail if the generated API client is stale
```

### Shared packages (`packages/*`)

- Source-only: `exports` point at `src/index.ts`; no build step (ADR 0002).
- Use extensionless relative imports (`./colors`) for Metro compatibility.
- API types come only from `npm run api:generate`; never hand-write them or edit
  `schema.generated.ts`. After any backend route/schema change, regenerate and commit.
- UI code uses semantic tokens (`themes.light.textMuted`), never `palette` directly. New
  colour pairs must be added to `colors.test.ts` contrast checks.
- TypeScript is pinned to 5.9.x (tooling peer ranges); see ADR 0002 before upgrading.

### Admin app (`apps/admin`)

```bash
npm run dev -w apps/admin        # http://127.0.0.1:5173 (needs backend running)
npm run test -w apps/admin       # Vitest + RTL + axe
npm run test:e2e -w apps/admin   # Playwright (builds + previews on 127.0.0.1:4173)
```

- All UI strings live in `src/i18n/messages.ts` for en/mr/hi.
- Colours via `var(--color-*)` only; CSS modules, no inline styles.
- Hooks/contexts in `context.ts`, components in `.tsx` (Fast Refresh lint rule).
- Never put secrets in `VITE_*` variables: they are bundled into browser code.
- Dev servers bind to `127.0.0.1`; CORS allow-lists must include `127.0.0.1` origins.

### Backend (`apps/backend`, venv at `apps/backend/.venv`)

```bash
.venv/Scripts/python -m pytest --cov=app          # unit (no DB)
.venv/Scripts/python -m pytest -m integration     # needs `docker compose up` (from root)
.venv/Scripts/alembic check
.venv/Scripts/ruff check . && .venv/Scripts/ruff format --check .
.venv/Scripts/mypy
.venv/Scripts/uvicorn app.main:create_app --factory --reload
```

There is no module-level `app` object; always use `create_app()` (`--factory` for uvicorn).
Details in `apps/backend/README.md`.

### Docker / database

- `docker compose up -d --build --wait` from the root starts db → migrate → api.
- Three DB roles: superuser (init only), migrator (DDL, Alembic), app (DML only). The API
  must never receive migrator or superuser credentials.
- `docker compose down -v` deletes the database volume. Ask the user before running it.
- After changing `pyproject.toml` dependencies, regenerate lock files with `scripts/lock.sh`
  inside the Linux image (see backend README). Never hand-edit `requirements*.lock`.
- In Git Bash, prefix `docker` commands with container paths with `MSYS_NO_PATHCONV=1`.

## Environment notes

- Development machine is Windows; repo enforces LF line endings via `.gitattributes`.
- Node 24 / npm 11, Python 3.12, Docker Desktop with Compose v2.
