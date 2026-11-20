import type { Locale } from '@konkan/shared-types';
import createClient from 'openapi-fetch';
import type { Client, Middleware } from 'openapi-fetch';

import type { paths } from './schema.generated';

type MaybePromise<T> = T | Promise<T>;

export interface ApiClientOptions {
  /** API origin, e.g. `https://api.example.com`. Paths already include `/api/v1`. */
  baseUrl: string;
  /** Sent as `Accept-Language` so the API returns localized content. */
  locale?: Locale | (() => Locale);
  /**
   * Returns the current access token, or nothing when signed out. Called per request so
   * refreshed tokens are picked up. Tokens are never persisted by this client.
   */
  getAccessToken?: () => MaybePromise<string | null | undefined>;
  /** Custom fetch (tests, React Native polyfills). Defaults to the global fetch. */
  fetch?: typeof globalThis.fetch;
}

export type ApiClient = Client<paths>;

/**
 * Validate and normalise the API origin. Rejects relative URLs, non-HTTP schemes, embedded
 * credentials, and paths/query strings (which would silently break every request path).
 */
export function normalizeBaseUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new TypeError(`API base URL must be absolute, got ${JSON.stringify(raw)}`);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new TypeError(`API base URL must use http(s), got ${url.protocol}`);
  }
  if (url.username || url.password) {
    throw new TypeError('API base URL must not contain credentials');
  }
  if (url.pathname !== '/' || url.search || url.hash) {
    throw new TypeError(
      `API base URL must be an origin only (paths include /api/v1), got ${JSON.stringify(raw)}`,
    );
  }
  return url.origin;
}

function headersMiddleware(options: ApiClientOptions): Middleware {
  return {
    async onRequest({ request }) {
      const { locale, getAccessToken } = options;
      if (locale !== undefined) {
        request.headers.set('Accept-Language', typeof locale === 'function' ? locale() : locale);
      }
      const token = getAccessToken ? await getAccessToken() : undefined;
      if (token) {
        request.headers.set('Authorization', `Bearer ${token}`);
      }
      return request;
    },
  };
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const client = createClient<paths>({
    baseUrl: normalizeBaseUrl(options.baseUrl),
    headers: { Accept: 'application/json' },
    ...(options.fetch ? { fetch: options.fetch } : {}),
  });
  client.use(headersMiddleware(options));
  return client;
}
