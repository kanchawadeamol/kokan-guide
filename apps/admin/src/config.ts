import { normalizeBaseUrl } from '@konkan/api-client';

export interface AppConfig {
  apiUrl: string;
}

/**
 * Read and validate build-time configuration. Fails fast with a clear message instead of
 * rendering a half-working app that calls `undefined/api/v1/...`.
 */
export function readConfig(env: Record<string, unknown>): AppConfig {
  const apiUrl = env.VITE_API_URL;
  if (typeof apiUrl !== 'string' || apiUrl.trim() === '') {
    throw new Error('VITE_API_URL is not set. Copy .env.example to .env at the repo root.');
  }
  return { apiUrl: normalizeBaseUrl(apiUrl.trim()) };
}
