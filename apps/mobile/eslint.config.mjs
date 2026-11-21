// Mobile ESLint config: root rules + React hooks. (jsx-a11y rules target DOM elements and do
// not apply to React Native; accessibility is enforced with RNTL role/label tests instead.)
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import root from '../../eslint.config.mjs';

export default tseslint.config(
  ...root,
  { ignores: ['.expo/**', 'expo-env.d.ts', 'android/**', 'ios/**'] },
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    languageOptions: { globals: { ...globals.jest } },
  },
  {
    files: ['*.js'],
    languageOptions: { sourceType: 'commonjs', globals: { ...globals.node } },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['jest.setup.js'],
    languageOptions: { globals: { ...globals.jest } },
  },
);
