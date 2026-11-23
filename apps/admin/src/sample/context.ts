import type { SampleListing, VerificationStatus } from '@konkan/sample-data';
import { createContext, useContext } from 'react';

export interface SampleListingsValue {
  /** Sample listings with any in-memory status changes applied. */
  listings: readonly SampleListing[];
  /** Change a listing's verification status in memory only (never persisted). */
  setStatus: (slug: string, status: VerificationStatus) => void;
}

export const SampleListingsContext = createContext<SampleListingsValue | null>(null);

export function useSampleListings(): SampleListingsValue {
  const value = useContext(SampleListingsContext);
  if (!value) throw new Error('useSampleListings must be used inside <SampleListingsProvider>');
  return value;
}
