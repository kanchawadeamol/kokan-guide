import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

/**
 * Baseline security headers. A nonce-based Content-Security-Policy is deferred to the
 * Sprint 9 security audit, once third-party resources (maps, analytics) are known.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Shared workspace packages ship TypeScript source (ADR 0002).
  transpilePackages: [
    '@konkan/api-client',
    '@konkan/design-tokens',
    '@konkan/sample-data',
    '@konkan/shared-types',
  ],
  // npm workspaces hoist dependencies to the repository root.
  turbopack: { root: repoRoot },
  outputFileTracingRoot: repoRoot,
  headers() {
    return Promise.resolve([{ source: '/:path*', headers: securityHeaders }]);
  },
};

export default config;
