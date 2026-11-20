import type { Schema } from '@konkan/api-client';
import { useCallback, useEffect, useState } from 'react';

import { useApiClient } from '../../api/context';

type Checks = Schema<'ReadinessChecks'>;

export type ReadinessState =
  | { kind: 'loading' }
  | { kind: 'ready'; checks: Checks }
  | { kind: 'unavailable'; checks: Checks }
  | { kind: 'unreachable' };

const CHECK_VALUES: readonly unknown[] = ['ok', 'fail'];

/**
 * Runtime guard for the 503 body. Generated types describe only what the API itself returns;
 * a proxy or gateway error (502 HTML page, 500 text) must not be trusted as this shape.
 */
function isReadinessBody(value: unknown): value is { checks: Checks } {
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

/** Fetches readiness on mount and whenever `refresh` is called. Never polls. */
export function useReadiness(): { state: ReadinessState; refresh: () => void } {
  const client = useApiClient();
  const [state, setState] = useState<ReadinessState>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    client
      .GET('/api/v1/health/ready', { signal: controller.signal })
      .then(({ data, error, response }) => {
        if (data) {
          setState({ kind: 'ready', checks: data.checks });
        } else if (response.status === 503 && isReadinessBody(error)) {
          setState({ kind: 'unavailable', checks: error.checks });
        } else {
          setState({ kind: 'unreachable' });
        }
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        console.warn('Readiness request failed', cause);
        setState({ kind: 'unreachable' });
      });

    return () => {
      controller.abort();
    };
  }, [client, attempt]);

  const refresh = useCallback(() => {
    setState({ kind: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { state, refresh };
}
