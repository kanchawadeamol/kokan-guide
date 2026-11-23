// Web app ESLint config: root rules + Next.js, React hooks and accessibility.
// We use @next/eslint-plugin-next directly instead of eslint-config-next, because the latter
// bundles eslint-plugin-jsx-a11y, which does not support ESLint 10 (see ADR 0002).
import nextPlugin from '@next/eslint-plugin-next';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import root from '../../eslint.config.mjs';

export default tseslint.config(
  ...root,
  { ignores: ['.next/**', 'next-env.d.ts', 'playwright-report/**', 'test-results/**'] },
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
      globals: { ...globals.node },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ...jsxA11y.configs.strict,
    languageOptions: {
      ...jsxA11y.configs.strict.languageOptions,
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { '@next/next': nextPlugin, 'react-hooks': reactHooks },
    // Lets the Next.js rules find this app when ESLint runs from the repository root.
    settings: { next: { rootDir: import.meta.dirname } },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
);
