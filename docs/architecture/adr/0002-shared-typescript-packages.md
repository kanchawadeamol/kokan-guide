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

### Amendments

- **2026-11-21, CSS modules exception.** Apps that use CSS modules may set
  `noPropertyAccessFromIndexSignature: false` in their app tsconfig. That flag only forces
  `styles['header']` instead of `styles.header`; `noUncheckedIndexedAccess` stays on, so class
  lookups are still typed `string | undefined`. No other strictness flag may be relaxed.
- **2026-11-21, accessibility lint plugin.** `eslint-plugin-jsx-a11y` declares ESLint ≤ 9 only.
  We use the drop-in fork `eslint-plugin-jsx-a11y-x` (es-tooling), which supports ESLint 10.
  Its `minimatch` dependency is overridden to 11.0.9 in the root `package.json` to fix
  GHSA-g3hv-75wg-m249. Remove the override once the fork depends on a patched version.
- **2026-11-21, override scope and npm caveat.** The override now targets the vulnerable range
  (`"minimatch@>=7.0.0 <11.0.1": "11.0.9"`), so it applies whichever package pulls it in.
  `npm install <pkg>` can bypass overrides and write a vulnerable nested copy into the lock
  file; `npm install` / `npm ci` honour them. After adding packages, run `npm audit`. CI runs
  it on every change.
- **2026-11-21, React version and overrides (Sprint 0.7).** Expo SDK 58 requires React
  exactly `19.3.0` (React Native compares `react` with its renderer at runtime). All apps use
  19.3.0, enforced by root `overrides` (`react`, `react-dom`) with a single hoisted copy.
  `glob@>=9.0.0 <=14.0.1` is overridden to 14.0.6 (GHSA-3g3m-2fjr-6pw4) alongside the
  `minimatch` range override; Jest was verified working with the newer `glob`. npm 11 does
  not apply these transitive overrides during `npm install <pkg>` or `npm dedupe`. They take
  effect on a plain `npm install` after stale nested lock entries are removed, and a clean
  `npm ci` from the committed lock file was verified to have 0 vulnerabilities.
- **2026-11-21, Next.js lint.** The web app uses `@next/eslint-plugin-next` directly instead of
  `eslint-config-next`, which bundles the original `eslint-plugin-jsx-a11y`.

## Consequences

- Changing a package is immediately visible in every app with no rebuild.
- Each app's type check also type-checks the package sources it imports.
- Any backend API change must be followed by `npm run api:generate` and a commit, or CI fails.
- Shared tooling (TypeScript, ESLint, Vitest) is declared once in the root `package.json`.
