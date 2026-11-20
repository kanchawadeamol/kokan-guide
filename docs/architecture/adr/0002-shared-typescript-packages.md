# ADR 0002: Shared TypeScript packages as source-only internal packages

- **Status:** Accepted
- **Date:** 2026-11-21

## Context

Mobile (Expo/Metro), web (Next.js) and admin (Vite) share design tokens, locale helpers and an
API client. Each bundler compiles TypeScript itself.

## Decision

1. **Source-only internal packages.** `packages/*` export TypeScript source
   (`"exports": { ".": "./src/index.ts" }`) with no build step. Consumers compile them:
   Next.js via `transpilePackages`, Vite and Metro natively. This avoids build ordering and
   stale `dist/` problems. Packages are `private` and never published.
2. **Extensionless relative imports** (`./colors`, not `./colors.js`). Bundler-mode TypeScript,
   Vite, Next.js and Vitest accept both, but Metro does not reliably map `.js` to `.ts`.
3. **The backend OpenAPI schema is the single source of truth for API types.**
   `npm run api:generate` exports the schema with isolated settings and generates
   `packages/api-client/src/schema.generated.ts` with `openapi-typescript`. The runtime client
   is a thin `openapi-fetch` wrapper. `npm run api:check` fails when the committed client is
   stale and runs in CI. API domain types (roles, regions, businesses) are never hand-written
   in `shared-types`.
4. **Operation IDs are handler function names** (`get_health`), so generated client code is
   readable. Duplicate IDs make FastAPI emit warnings, which the backend tests turn into
   failures.
5. **TypeScript 5.9.3, pinned.** TypeScript 7 exists, but `typescript-eslint` supports
   `<6.1` and `openapi-typescript` requires `^5`. Revisit when both support a newer major.
6. **One strict base config** (`tsconfig.base.json`): `strict`, `noUncheckedIndexedAccess`,
   `exactOptionalPropertyTypes`, `verbatimModuleSyntax`. Apps extend it and may only add
   framework options, never relax strictness without an ADR.
7. **One ESLint flat config at the root** (`typescript-eslint` strict + stylistic, type-aware).
   Root `npm run lint` lints the whole repo in one pass. Apps add framework plugins in their
   own config.

## Consequences

- Changing a package is immediately visible in every app with no rebuild.
- Each app's type check also type-checks the package sources it imports.
- Any backend API change must be followed by `npm run api:generate` and a commit, or CI fails.
- Shared tooling (TypeScript, ESLint, Vitest) is declared once in the root `package.json`.
