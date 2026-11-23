// Admin app ESLint config: root rules + React hooks, Fast Refresh and accessibility.
// ESLint 10 resolves the nearest config per file, so the root `npm run lint` uses this file
// for everything under apps/admin.
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import root from '../../eslint.config.mjs';

export default tseslint.config(
  ...root,
  { ignores: ['playwright-report/**', 'test-results/**'] },
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ...jsxA11y.configs.strict,
    languageOptions: {
      ...jsxA11y.configs.strict.languageOptions,
      globals: { ...globals.browser },
    },
    rules: {
      ...jsxA11y.configs.strict.rules,
      // Scrollable table wrappers are labelled regions with tabIndex=0 so keyboard users can
      // scroll them (axe scrollable-region-focusable, WCAG 2.1.1).
      'jsx-a11y-x/no-noninteractive-tabindex': [
        'error',
        { tags: [], roles: ['tabpanel', 'region'], allowExpressionValues: true },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
    },
  },
  {
    files: ['vite.config.ts', 'playwright.config.ts', 'e2e/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
);
