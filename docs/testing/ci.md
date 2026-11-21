# Continuous integration

Workflows live in `.github/workflows/`. All third-party actions are pinned to full commit
SHAs (version in a trailing comment); Dependabot proposes updates weekly.

## `ci.yml`: runs on every push to `main` and every pull request

| Job            | What it checks                                                                                                                                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `js`           | `npm ci`, `npm audit --audit-level=moderate`, exactly one React copy, Prettier, ESLint, TypeScript, Vitest/Jest in every workspace                                                                                          |
| `backend`      | Hash-verified install from `requirements-dev.lock`; Ruff, Mypy, unit tests (coverage ≥ 90%), `pip-audit`; then Docker Compose (PostGIS + migrations + API), integration tests (role privileges), `alembic check`, readiness |
| `api-contract` | `npm run api:check`: the committed TypeScript API client matches the backend OpenAPI schema                                                                                                                                 |
| `e2e`          | Playwright against production builds of `admin` and `web` (matrix), including axe WCAG 2.2 AA scans; report uploaded on failure                                                                                             |
| `mobile`       | `expo-doctor` and a Metro bundle for Android and iOS                                                                                                                                                                        |
| `hygiene`      | gitleaks over the full git history; actionlint (+ shellcheck) on workflows                                                                                                                                                  |

The backend job creates its `.env` with `scripts/create-dev-env.py` (random secrets, never
printed) and always tears the stack down with `docker compose down -v`.

Not in CI yet: Maestro mobile end-to-end tests (need an emulator; planned once a dev build
exists), container image vulnerability scanning (Sprint 9), deployment (Sprint 10).

## `codeql.yml`: SAST for TypeScript, Python and workflow files

Runs on pushes, pull requests and weekly. The repository is **public** (decided 2026-11-21),
so CodeQL is free. If the repository ever becomes private, CodeQL needs GitHub Advanced
Security (paid): switch this workflow to `workflow_dispatch` only before changing visibility.

## `dependabot.yml`

Weekly updates for npm, pip (`apps/backend`), the backend Dockerfile, Compose images and
GitHub Actions. Minor/patch updates are grouped. Deliberately ignored:

- `react`, `react-dom`, `react-native`, and `expo` majors: upgrade together with the Expo SDK
  (Expo pins React exactly).
- `typescript` majors: blocked by `typescript-eslint` / `openapi-typescript` peer ranges
  (ADR 0002).

After merging an npm update, CI's audit and single-React checks catch npm re-resolving around
the root `overrides`.

## Running the same checks locally

```bash
npm ci && npm audit --audit-level=moderate
npm run format:check && npm run lint && npm run typecheck && npm test
npm run api:check
python scripts/create-dev-env.py        # only if you have no .env yet
docker compose up -d --build --wait
cd apps/backend && .venv/Scripts/python -m pytest -m integration && .venv/Scripts/alembic check
npm run test:e2e -w apps/admin && npm run test:e2e -w apps/web
docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:1.7.12
docker run --rm -v "$PWD:/repo" ghcr.io/gitleaks/gitleaks:v8.30.1 git /repo --redact
```

## Recommended repository settings (once pushed to GitHub)

- Protect `main`: require pull requests and these status checks: `js`, `backend`,
  `api-contract`, `e2e (admin)`, `e2e (web)`, `mobile`, `hygiene`.
- Enable secret scanning and **push protection** (free for public repos): blocks pushes that
  contain recognised credentials, in addition to gitleaks in CI.
- Enable Dependabot alerts and security updates.
- Enable private vulnerability reporting, so researchers can report issues without opening a
  public issue.

## Public repository rules

Everything committed is world-readable, including the full git history:

- Never commit `.env`, real credentials, production hostnames, or personal data (including
  real business owners' phone numbers in seed data: use clearly fake values).
- If a secret is ever committed, **rotate it immediately**. Deleting the commit is not enough.
- Seed data for Ratnagiri/Raigad must use public information only (region names, public
  landmarks), never scraped private listings.
