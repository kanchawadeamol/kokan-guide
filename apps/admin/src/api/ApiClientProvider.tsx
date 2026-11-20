import type { ApiClient } from '@konkan/api-client';
import type { ReactNode } from 'react';

import { ApiClientContext } from './context';

/** Provides the API client; tests inject a client backed by a mock fetch. */
export function ApiClientProvider({
  client,
  children,
}: {
  client: ApiClient;
  children: ReactNode;
}) {
  return <ApiClientContext value={client}>{children}</ApiClientContext>;
}
