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
npm run lint           # lint all workspaces
npm run typecheck      # type check all workspaces
npm test               # test all workspaces
```

Backend and Docker commands are documented in `README.md` once those modules exist.

## Environment notes

- Development machine is Windows; repo enforces LF line endings via `.gitattributes`.
- Node 24 / npm 11, Python 3.12, Docker Desktop with Compose v2.
