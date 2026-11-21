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
- Resolved in 0.4: root `npm test`/`typecheck` previously failed with "No workspaces found".

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

- [x] Root `tsconfig.base.json` (strict + `noUncheckedIndexedAccess`,
      `exactOptionalPropertyTypes`); TypeScript pinned 5.9.3 (ADR 0002)
- [x] Root ESLint 10 flat config (typescript-eslint strict/stylistic, type-aware, Prettier);
      root `npm run lint` covers the whole repo; verified it catches errors
- [x] Vitest 5 per package; root `npm test` / `typecheck` fan out to workspaces
- [x] `packages/design-tokens`: semantic light/dark themes, spacing, Devanagari-friendly
      typography, 48px touch target, motion + reduced motion, CSS-variable helper.
      109 tests incl. WCAG AA contrast for every text (4.5:1) and UI (3:1) pairing;
      mutation-checked (a too-light grey fails 3 tests)
- [x] `packages/shared-types`: locales (mr/en/hi), `resolveLocale`, translation fallback
      (24 tests)
- [x] `packages/api-client`: OpenAPI → `openapi-typescript` types + `openapi-fetch` client
      with Accept-Language / bearer token middleware and base-URL validation (15 tests,
      type-level assertions)
- [x] `npm run api:generate` / `api:check`; drift detection verified (fails on stale client)
- [x] Backend operation IDs = handler names (`get_health`, `get_readiness_status`)
- [x] Public client env vars renamed to origin-only `*_API_URL`
- Fixed during sprint: ESLint JS-file override dropped `projectService: false`; first
  `npm install -w <name>` silently installed nothing (use `-w <path>` for new workspaces)

### 0.5 Admin app (`apps/admin`)

- [x] Vite 8 + React 19 + TS strict (project references; CSS-module exception per ADR 0002)
- [x] ESLint: root rules + react-hooks + react-refresh + jsx-a11y-x (strict); canary-verified
- [x] App shell: skip link, banner/nav/main landmarks, labelled language picker (mr/en/hi,
      native names), `<html lang>` sync, design-token CSS variables (light/dark), visible
      focus, reduced motion, rem sizing, 48px targets
- [x] API status card via `@konkan/api-client`: loading / ready / not ready (503) /
      unreachable; runtime-validated error bodies (proxy 502 HTML no longer crashes;
      mutation-verified); retry keeps keyboard focus (`aria-disabled`)
- [x] Fail-fast config (`VITE_API_URL` must be an origin)
- [x] Vitest + RTL + axe: 33 tests
- [x] Playwright (Chromium 159, desktop + Pixel 7): 24 e2e tests incl. axe WCAG 2.2 AA in
      light/dark x en/mr/hi, 200% text, keyboard skip link, no horizontal scroll
- [x] Verified against the real stack in a browser: ready state, DB-down (503) state and
      recovery
- [x] CORS dev origins now include `127.0.0.1` (Vite serves on 127.0.0.1)
- [x] `npm audit` clean (minimatch override for jsx-a11y-x)
- [ ] Marathi/Hindi UI strings need native-speaker review
- [ ] Choose a shared i18n library for web/admin/mobile (Sprint 4); admin uses a typed
      message catalog until then

### 0.6 Web app (`apps/web`)

- [x] Next.js 16.4.6 (App Router, Turbopack) + React 19 + TS strict; shared packages via
      `transpilePackages`; Turbopack/tracing root set to the monorepo root
- [x] Locale routing: `/mr`, `/en`, `/hi` statically pre-rendered; unknown locales 404;
      `src/proxy.ts` redirects `/` (307 + `Vary: Accept-Language`) using weighted
      `Accept-Language` (new `parseAcceptLanguage` in shared-types, 7 tests)
- [x] SEO: per-locale title/description, `<html lang>`, canonical + hreflang (+ x-default),
      Open Graph locale, `robots.txt`, `sitemap.xml` with alternates; `SITE_URL` required
      for production builds
- [x] Security headers (nosniff, frame DENY, referrer, permissions, COOP); no `X-Powered-By`.
      CSP deferred to Sprint 9
- [x] Accessibility: skip link, crawlable language links (`hrefLang`, `lang`,
      `aria-current`), design-token theme, focus ring, reduced motion, 48px targets
- [x] ESLint: `@next/eslint-plugin-next` (recommended + core-web-vitals), react-hooks,
      jsx-a11y-x
- [x] Vitest: 31 tests (site URL validation, alternates, messages, header, proxy redirect,
      robots/sitemap)
- [x] Playwright: 38 tests (desktop + mobile) incl. redirects, 404, SEO tags, security
      headers, robots/sitemap, skip link, axe WCAG 2.2 AA in light/dark × en/mr/hi, 200% text
- [x] Production build verified; dev server verified in browser (lang, canonical, hreflang,
      theme, no console errors)
- [x] Theme stylesheet moved into design-tokens (`toThemeStylesheet`), shared by web + admin
- [x] `minimatch` override widened to the vulnerable range; `npm ci` verified clean
- [ ] Self-hosted Noto Sans / Noto Sans Devanagari fonts (currently system fallback)
- [ ] Web Dockerfile (planned with production deployment, Sprint 10)

### 0.7 Mobile app (`apps/mobile`)

- [x] Expo SDK 58 (expo 58.0.26, RN 0.88.1, Expo Router 58) + TS strict; versions taken from
      Expo's `bundledNativeModules.json`; `expo-doctor` 20/20 checks pass
- [x] React aligned repo-wide to 19.3.0 (Expo requirement) with one hoisted copy; web and
      admin re-verified
- [x] App shell: Expo Router stack, localized title, design-token theme (light/dark), device
      language detection (expo-localization), accessible language radio group
      (`accessibilityLanguage`), connection status with live region and busy state, 48dp
      targets, localized config-error screen instead of crash
- [x] Readiness logic moved to `@konkan/api-client` (`fetchReadiness`, 11 tests) and shared by
      admin and mobile
- [x] Jest 30 + jest-expo + RNTL 14: 23 tests (roles/states/names, language switch, status
      states, retry, touch targets, config validation, messages)
- [x] Metro bundles Android and iOS (`expo export`), with workspace packages resolved and
      `EXPO_PUBLIC_API_URL` inlined
- [x] `glob` override (GHSA-3g3m-2fjr-6pw4); `npm audit` 0 vulnerabilities after clean
      `npm ci`
- [x] Maestro smoke flow written (`.maestro/smoke.yaml`)
- [ ] **Run Maestro smoke flow**: needs Java 17+ (machine has Java 8), Maestro CLI, a dev
      build (`npx expo run:android`, Gradle also needs Java 17+) and an emulator/device
- [ ] Persist language choice (Sprint 4, with onboarding)

### 0.8 CI/CD

- [x] `.github/workflows/ci.yml`: js (audit, single-React check, format, lint, typecheck,
      tests), backend (hash-locked install, Ruff, Mypy, unit coverage ≥ 90%, pip-audit,
      Compose stack, integration tests, alembic check, readiness), api-contract, e2e matrix
      (admin, web), mobile (expo-doctor, Metro bundle), hygiene (gitleaks, actionlint)
- [x] All actions pinned to verified commit SHAs; `permissions: contents: read`
- [x] `codeql.yml` (JS/TS, Python, Actions; security-extended). Repository will be
      **public** (decided 2026-11-21), so CodeQL is free and runs automatically
- [x] `dependabot.yml`: npm, pip, Docker, Compose, Actions; React/Expo/TS majors held back
- [x] `scripts/create-dev-env.py`: `.env` with generated secrets, refuses to overwrite
- [x] Validated locally: actionlint clean; gitleaks on full history clean (7 commits);
      `npm audit --audit-level=moderate` clean; single React copy
- [ ] **Workflows have not run on GitHub yet**: no remote, no `gh` CLI. First push will be
      the real validation
- [ ] Branch protection + required checks (after the repo exists on GitHub)

### 0.9 Environment validation

- [x] Clean-clone validation (2026-11-21): fresh `git clone`, documented setup only,
      separate Compose project on ports 15432/18000. **27/27 steps pass**: env script, `npm ci`,
      npm audit, single React, format, lint, typecheck, JS tests (256), backend venv + install,
      Ruff, Mypy, backend unit (coverage ≥ 90%), pip-audit, API contract, Compose up (healthy),
      integration tests (14), `alembic check`, readiness, admin e2e (24), web e2e (38),
      expo-doctor, Metro export, gitleaks, actionlint, Compose down
- [x] Found and fixed: CI `pip-audit --strict` failed on the editable package (now audits the
      lock file); mobile Jest timed out on a cold cache (testTimeout 30 s); README setup steps
      were incomplete (rewritten)

## Sprint 0 summary

**Done and verified:** monorepo (npm workspaces + Python backend), Docker Compose with
PostgreSQL 17 + PostGIS 3.7 and least-privilege roles, FastAPI scaffold with health/readiness,
Alembic, shared design tokens / locale types / typed API client, admin (Vite), web (Next.js),
mobile (Expo) shells with en/mr/hi and WCAG 2.2 AA checks, CI (GitHub Actions, CodeQL,
Dependabot), clean-clone reproducibility.

**Open items carried forward:**

- [ ] Push to GitHub (public repo; needs the repository URL) and see CI run there
- [ ] Branch protection with required checks, secret-scanning push protection
- [ ] Maestro smoke flow: install Java 17+ and the Maestro CLI, build an Android dev build
- [ ] Native-speaker review of Marathi and Hindi UI strings
- [ ] Self-hosted Noto fonts; nonce-based CSP (Sprint 9); web Dockerfile (Sprint 10)

## Sprint 1: Database architecture and regional hierarchy

- [x] ADR 0003 (UUID PKs, timestamps + trigger, constraint naming, soft-delete policy,
      per-level region tables, localized name columns, seed strategy)
- [x] `docs/database/schema.md`: region ER diagram + planned entities per sprint
- [x] Models: `countries`, `states`, `districts`, `talukas`, `villages` (village/town/city);
      slugs unique per parent; nullable unique `lgd_code`; `centroid geography(Point,4326)`
      with GiST indexes; `ON DELETE RESTRICT`
- [x] Migration `0002` (autogenerated, reviewed) + `set_updated_at()` triggers;
      `alembic check` clean; downgrade/upgrade round trip tested
- [x] Seed: validated JSON (Pydantic) + idempotent `python -m app.seed [--dry-run]`;
      India → Maharashtra → Ratnagiri (9 talukas) + Raigad (15 talukas), 34 places;
      verified in Docker (62 created, then 62 unchanged)
- [x] Readiness now also checks schema is at the shipped migration head (`migrations`);
      API client regenerated; admin shows "Database schema" row (en/mr/hi)
- [x] Tests: 16 seed-validation unit tests; 18 region integration tests (all check
      constraints, per-parent uniqueness, RESTRICT, trigger, spatial index used by
      `ST_DWithin`, seed idempotence + preservation of unmanaged columns, app-role read,
      migration round trip); all run in rolled-back transactions
- [ ] Verify seed names against the Local Government Directory (LGD) before production
- [ ] Import authoritative LGD codes, centroids (and later boundaries)
- [ ] Hindi place names from a verified source

## Sprint 2 to Sprint 10

Not started. See project brief in `CLAUDE.md`.
