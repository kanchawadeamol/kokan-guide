# Admin dashboard

React 19 + Vite 8 + TypeScript (strict). Desktop-first, responsive, WCAG 2.2 AA.

## Run

```bash
docker compose up -d --wait        # from repo root: backend API on 127.0.0.1:8000
npm run dev -w apps/admin          # http://127.0.0.1:5173
```

Configuration comes from the repository-root `.env` (`envDir` in `vite.config.ts`). Only
`VITE_`-prefixed variables reach the browser bundle. **Never put secrets in a `VITE_`
variable.** `VITE_API_URL` must be the API origin only (no `/api/v1`); the app fails fast if
it is missing or invalid.

## Structure

```
src/
  main.tsx                 # entry: theme, config, providers
  App.tsx
  api/                     # ApiClientProvider + useApiClient (context)
  i18n/                    # messages (en/mr/hi), I18nProvider, useI18n
  theme/themeCss.ts        # design tokens -> CSS variables (light + dark)
  styles/global.css        # focus ring, skip link, reduced motion, rem-based sizing
  components/AppShell.tsx  # skip link, banner, nav, main landmarks, language picker
  features/system-status/  # API readiness card
e2e/                       # Playwright specs (API mocked with page.route)
```

## Conventions

- Colours only via `var(--color-*)` from `@konkan/design-tokens`; styles in CSS modules, no
  inline styles.
- Every user-facing string goes in `src/i18n/messages.ts` for all three languages; a test
  enforces identical keys. Marathi/Hindi strings need native-speaker review before release.
- Hooks and context live in `context.ts` files, components in `.tsx` (React Fast Refresh).
- Validate API error bodies at runtime: proxies can return non-JSON errors that generated
  types do not describe.
- Status is never conveyed by colour alone (text + icon).

## Tests

```bash
npm run test -w apps/admin       # Vitest + React Testing Library + axe (jsdom)
npm run test:e2e -w apps/admin   # Playwright: builds, serves on 127.0.0.1:4173
npx playwright install chromium  # one-time browser download
```

Unit tests run axe with `color-contrast` disabled (jsdom has no layout). Playwright runs the
full axe WCAG 2.2 AA rule set, including contrast, in light and dark themes, in all three
languages, on desktop and mobile viewports, and at 200% text size.

`tsconfig.app.json` disables `noPropertyAccessFromIndexSignature` so CSS module classes can
be written as `styles.header` (ADR 0002). `noUncheckedIndexedAccess` stays on.
