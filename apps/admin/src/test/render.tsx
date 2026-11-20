import { createApiClient } from '@konkan/api-client';
import type { Locale } from '@konkan/shared-types';
import { render } from '@testing-library/react';
import axe from 'axe-core';
import type { ReactElement } from 'react';
import { vi } from 'vitest';

import { ApiClientProvider } from '../api/ApiClientProvider';
import { I18nProvider } from '../i18n/I18nProvider';

export type FetchHandler = (request: Request) => Response | Promise<Response>;

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Render with real providers and an API client backed by a mock fetch. */
export function renderWithProviders(
  ui: ReactElement,
  { fetch: handler, locale = 'en' }: { fetch?: FetchHandler; locale?: Locale } = {},
) {
  const fetch = vi.fn((input: Request) =>
    Promise.resolve(handler ? handler(input) : jsonResponse({})),
  );
  const client = createApiClient({
    baseUrl: 'http://api.test',
    fetch: fetch as unknown as typeof globalThis.fetch,
  });
  const result = render(
    <I18nProvider initialLocale={locale}>
      <ApiClientProvider client={client}>{ui}</ApiClientProvider>
    </I18nProvider>,
  );
  return { ...result, fetch };
}

/**
 * Run axe on a container. Colour contrast is disabled because jsdom has no layout or
 * computed colours; contrast is covered by design-token tests and Playwright axe scans.
 */
export async function axeViolations(container: Element): Promise<axe.Result[]> {
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    rules: { 'color-contrast': { enabled: false } },
  });
  return results.violations;
}
