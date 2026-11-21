import { createApiClient } from '@konkan/api-client';
import type { Locale } from '@konkan/shared-types';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { AppProviders } from '../AppProviders';

export type FetchHandler = (request: Request) => Response | Promise<Response>;

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Render inside real app providers with an API client backed by a mock fetch. */
export async function renderWithProviders(
  ui: ReactElement,
  { fetch: handler, locale = 'en' }: { fetch?: FetchHandler; locale?: Locale } = {},
) {
  const fetch = jest.fn((input: Request) =>
    Promise.resolve(handler ? handler(input) : jsonResponse({})),
  );
  const client = createApiClient({
    baseUrl: 'http://api.test',
    fetch: fetch as unknown as typeof globalThis.fetch,
  });
  const result = await render(
    <AppProviders client={client} initialLocale={locale}>
      {ui}
    </AppProviders>,
  );
  return { ...result, fetch };
}
