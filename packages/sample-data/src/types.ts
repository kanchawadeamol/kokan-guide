import type { Locale } from '@konkan/shared-types';

/** Text in every supported language (sample data is fully translated). */
export type Translations = Readonly<Record<Locale, string>>;

export type CategoryGroup =
  'health' | 'stay' | 'food' | 'transport' | 'tourism' | 'shopping' | 'services' | 'emergency';

export interface SampleCategory {
  slug: string;
  group: CategoryGroup;
  /** Ionicons name, used by the mobile app. */
  icon: string;
  /** Decorative emoji for the web preview (always rendered `aria-hidden`). */
  emoji: string;
  name: Translations;
  description: Translations;
}

export interface SamplePlace {
  slug: string;
  district: string;
  taluka: string;
  name: Translations;
  districtName: Translations;
}

/** 0 = Sunday … 6 = Saturday; times are local "HH:MM" (24h). */
export interface OpeningPeriod {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  open: string;
  close: string;
}

export type VerificationStatus = 'verified' | 'pending' | 'unverified';

export type SampleListingKind =
  /** Invented business: name ends in "(Sample)", placeholder phone, sample hours. */
  | 'fictional-business'
  /** Real public landmark: generic description only; no phone, no hours. */
  | 'public-landmark';

export interface SampleListing {
  slug: string;
  kind: SampleListingKind;
  categorySlug: string;
  placeSlug: string;
  name: Translations;
  description: Translations;
  addressLine: Translations | null;
  /** Placeholder only (invalid +91 0… number); never a real number. Null for landmarks. */
  phone: string | null;
  hasWhatsApp: boolean;
  /** Null = hours not available. Never invented for real places. */
  hours: readonly OpeningPeriod[] | null;
  verification: VerificationStatus;
  popular: boolean;
}
