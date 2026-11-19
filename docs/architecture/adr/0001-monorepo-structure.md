# ADR 0001: Monorepo with npm workspaces plus a standalone Python backend

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

The platform has three TypeScript front ends (Expo mobile, Next.js web, Vite admin), shared
TypeScript packages (API client, types, design tokens) and a Python FastAPI backend. One team
maintains all of them. A single repository keeps API contracts, design tokens and CI in sync.

## Decision

- One Git repository, with apps under `apps/` and shared code under `packages/`.
- **npm workspaces** (`apps/*`, `packages/*`) with a single root `package-lock.json`. npm was
  chosen over pnpm/yarn because it is already installed and the brief requires a
  `package-lock.json`. Expo SDK 58 supports npm workspaces natively.
- `apps/backend` is a **standalone Python project** (`pyproject.toml`). It has no
  `package.json`, so the `apps/*` workspace glob skips it.
- No task runner (Turborepo/Nx) for now. Root scripts fan out with
  `npm run <script> --workspaces --if-present`. Revisit if CI time becomes a problem.
- TypeScript types for API calls are generated from the backend OpenAPI schema into
  `packages/api-client`, so the backend is the single source of truth.

## Consequences

- One `npm install` sets up all JS apps. The Python toolchain is managed separately.
- Hoisting can cause React/React Native version conflicts between Expo and Next.js. Pin
  per-app versions and use Metro's monorepo support; verify when the apps are scaffolded.
- CI uses path filters so backend-only changes don't rebuild the mobile app.
