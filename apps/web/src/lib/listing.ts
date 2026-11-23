import { getCategory, getPlace } from '@konkan/sample-data';
import type { SampleListing, VerificationStatus } from '@konkan/sample-data';
import type { Locale } from '@konkan/shared-types';

import type { MessageKey } from '../i18n/messages';

export const routes = {
  home: (locale: Locale) => `/${locale}`,
  category: (locale: Locale, slug: string) => `/${locale}/category/${slug}`,
  listing: (locale: Locale, slug: string) => `/${locale}/listing/${slug}`,
  search: (locale: Locale) => `/${locale}/search`,
};

/** "Dapoli, Ratnagiri" in the requested language. */
export function placeLine(listing: SampleListing, locale: Locale): string {
  const place = getPlace(listing.placeSlug);
  return place ? `${place.name[locale]}, ${place.districtName[locale]}` : '';
}

export function categoryName(listing: SampleListing, locale: Locale): string {
  return getCategory(listing.categorySlug)?.name[locale] ?? '';
}

export const verificationLabel: Readonly<Record<VerificationStatus, MessageKey>> = {
  verified: 'verified',
  pending: 'pending',
  unverified: 'unverified',
};

/** Robots policy for pages that show sample data: never index fake listings. */
export const SAMPLE_ROBOTS = { index: false, follow: true } as const;
