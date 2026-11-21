import { fetchReadiness } from '@konkan/api-client';
import type { ReadinessResult } from '@konkan/api-client';
import { useCallback, useEffect, useState } from 'react';

import { useApiClient } from '../../api/context';

export type ReadinessState = { kind: 'loading' } | ReadinessResult;

/** Fetches readiness on mount and whenever `refresh` is called. Never polls. */
export function useReadiness(): { state: ReadinessState; refresh: () => void } {
  const client = useApiClient();
  const [state, setState] = useState<ReadinessState>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchReadiness(client, { signal: controller.signal })
      .then(setState)
      .catch(() => {
        // Only aborted requests reject; the component has unmounted or re-fetched.
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
