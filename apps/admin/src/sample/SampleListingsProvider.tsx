import { listListings } from '@konkan/sample-data';
import type { VerificationStatus } from '@konkan/sample-data';
import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { SampleListingsContext } from './context';

/** Holds sample listings plus in-memory approval decisions (lost on reload, by design). */
export function SampleListingsProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Readonly<Record<string, VerificationStatus>>>({});

  const setStatus = useCallback((slug: string, status: VerificationStatus) => {
    setOverrides((current) => ({ ...current, [slug]: status }));
  }, []);

  const value = useMemo(
    () => ({
      listings: listListings().map((listing) => {
        const verification = overrides[listing.slug];
        return verification ? { ...listing, verification } : listing;
      }),
      setStatus,
    }),
    [overrides, setStatus],
  );

  return <SampleListingsContext value={value}>{children}</SampleListingsContext>;
}
