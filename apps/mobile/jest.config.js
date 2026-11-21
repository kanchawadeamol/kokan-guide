/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}', '<rootDir>/app/**/*.test.{ts,tsx}'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}', '!**/*.test.{ts,tsx}'],
  // React Native component tests transform RN + workspace packages on a cold cache (fresh clone,
  // CI runner); the first test can exceed Jest's 5 s default. Measured cold: ~62 s suite.
  testTimeout: 30_000,
  clearMocks: true,
  restoreMocks: true,
};
