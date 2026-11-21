# Public website

Next.js 16 (App Router) + React 19 + TypeScript (strict). Server-rendered, SEO-first,
WCAG 2.2 AA.

## Run

```bash
npm run dev -w apps/web                                  # http://127.0.0.1:3000
SITE_URL=https://example.org npm run build -w apps/web   # production build
npm run start -w apps/web
```

`SITE_URL` is the public origin used for canonical URLs, hreflang links, `robots.txt` and the
sitemap. It is **required for production builds** (the build fails without it) and defaults to
`http://127.0.0.1:3000` in development. It is a server-only variable. Next.js does not read the
repository-root `.env`, so set it in the shell, the CI job or the deployment environment.

## Routing and SEO

- Every page lives under a locale prefix: `/mr`, `/en`, `/hi`. Unsupported locales return 404
  (`dynamicParams = false`).
- `/` is redirected (307, `Vary: Accept-Language`) by `src/proxy.ts` to the visitor's
  preferred supported language, honouring `Accept-Language` quality weights. Falls back to
  English.
- Each page sets `<html lang>`, a self-referencing canonical URL and hreflang alternates for
  all locales plus `x-default` (English). See `src/lib/site.ts`.
- Language switching uses plain crawlable links (`hrefLang`, `lang`, `aria-current`), not a
  JavaScript-only control.
- `src/app/robots.ts` and `src/app/sitemap.ts` generate `robots.txt` and `sitemap.xml`.

## Security headers

Set in `next.config.ts` for every route: `X-Content-Type-Options`, `X-Frame-Options: DENY`,
`Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`; `X-Powered-By` is
removed. A nonce-based Content-Security-Policy is planned for the Sprint 9 security audit.

## Tests

```bash
npm run test -w apps/web       # Vitest: helpers, header, proxy redirect, robots/sitemap
npm run test:e2e -w apps/web   # Playwright: builds and serves on 127.0.0.1:3100
```

Playwright covers locale redirects, 404 for unknown locales, per-locale SEO metadata,
`robots.txt`/`sitemap.xml`, security headers, keyboard skip link, and axe WCAG 2.2 AA scans
in light/dark × en/mr/hi on desktop and mobile viewports.

## Linting

Uses `@next/eslint-plugin-next` directly rather than `eslint-config-next`, which bundles the
original `eslint-plugin-jsx-a11y` (ESLint ≤ 9 only). Accessibility rules come from
`eslint-plugin-jsx-a11y-x`, as in the admin app (ADR 0002).
