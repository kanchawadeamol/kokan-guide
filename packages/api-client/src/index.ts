export { createApiClient, normalizeBaseUrl } from './client';
export type { ApiClient, ApiClientOptions } from './client';
export type { components, operations, paths } from './schema.generated';

import type { components } from './schema.generated';

/** Convenience alias: `Schema<'HealthResponse'>`. */
export type Schema<Name extends keyof components['schemas']> = components['schemas'][Name];
