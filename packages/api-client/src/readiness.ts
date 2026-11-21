import type { ApiClient } from './client';
import type { components } from './schema.generated';

export type ReadinessChecks = components['schemas']['ReadinessChecks'];

export type ReadinessResult =
  | { kind: 'ready'; checks: ReadinessChecks }
  | { kind: 'unavailable'; checks: ReadinessChecks }
  | { kind: 'unreachable' };

const CHECK_VALUES: readonly unknown[] = ['ok', 'fail'];

/**
 * Runtime guard for the readiness body. Generated types describe only what the API itself
 * returns; a proxy or gateway error (502 HTML page, 500 text) must not be trusted as this shape.
 */
export function isReadinessBody(value: unknown): value is { checks: ReadinessChecks } {
  if (typeof value !== 'object' || value === null || !('checks' in value)) return false;
  const { checks } = value;
  return (
    typeof checks === 'object' &&
    checks !== null &&
    'database' in checks &&
    'postgis' in checks &&
    CHECK_VALUES.includes(checks.database) &&
    CHECK_VALUES.includes(checks.postgis)
  );
}

/**
 * Query `GET /api/v1/health/ready` and classify the outcome. Never throws for HTTP or network
 * failures (they become `unreachable`); rethrows only `AbortError` so callers can ignore
 * requests they cancelled.
 */
export async function fetchReadiness(
  client: ApiClient,
  options: { signal?: AbortSignal } = {},
): Promise<ReadinessResult> {
  try {
    const { data, error, response } = await client.GET(
      '/api/v1/health/ready',
      options.signal ? { signal: options.signal } : {},
    );
    if (data && isReadinessBody(data)) return { kind: 'ready', checks: data.checks };
    if (response.status === 503 && isReadinessBody(error)) {
      return { kind: 'unavailable', checks: error.checks };
    }
    return { kind: 'unreachable' };
  } catch (cause) {
    if (options.signal?.aborted) throw cause;
    return { kind: 'unreachable' };
  }
}
