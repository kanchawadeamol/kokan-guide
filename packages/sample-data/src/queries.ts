import { SUPPORTED_LOCALES } from '@konkan/shared-types';

import { categories } from './categories';
import { listings } from './listings';
import { places } from './places';
import type {
  OpeningPeriod,
  SampleCategory,
  SampleListing,
  SamplePlace,
  Translations,
} from './types';

/** Shown on every screen that displays sample data. */
export const SAMPLE_NOTICE: Translations = {
  en: 'Sample data for preview. These are not real listings.',
  mr: 'पूर्वावलोकनासाठी नमुना माहिती. या खऱ्या नोंदी नाहीत.',
  hi: 'पूर्वावलोकन के लिए नमूना डेटा। ये असली सूचियाँ नहीं हैं।',
};

/** Region the listings belong to: opening hours are interpreted in Indian Standard Time. */
export const LISTING_TIME_ZONE = 'Asia/Kolkata';

export function listCategories(): readonly SampleCategory[] {
  return categories;
}

export function getCategory(slug: string): SampleCategory | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getPlace(slug: string): SamplePlace | undefined {
  return places.find((p) => p.slug === slug);
}

export function getListing(slug: string): SampleListing | undefined {
  return listings.find((l) => l.slug === slug);
}

export function listListings(): readonly SampleListing[] {
  return listings;
}

export function listingsByCategory(categorySlug: string): SampleListing[] {
  return listings.filter((l) => l.categorySlug === categorySlug);
}

export function popularListings(): SampleListing[] {
  return listings.filter((l) => l.popular);
}

function normalize(value: string): string {
  return value.normalize('NFC').toLocaleLowerCase('en-IN').trim();
}

function allTranslations(t: Translations): string[] {
  return SUPPORTED_LOCALES.map((locale) => t[locale]);
}

/**
 * Case-insensitive search across listing, category and place names in every language, so
 * "dapoli", "दापोली" and "hotel" all work regardless of the UI language.
 */
export function searchListings(query: string): SampleListing[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return listings.filter((listing) => {
    const category = getCategory(listing.categorySlug);
    const place = getPlace(listing.placeSlug);
    const haystack = normalize(
      [
        ...allTranslations(listing.name),
        ...allTranslations(listing.description),
        ...(category ? allTranslations(category.name) : []),
        ...(place ? [...allTranslations(place.name), ...allTranslations(place.districtName)] : []),
      ].join(' '),
    );
    return terms.every((term) => haystack.includes(term));
  });
}

export type OpenStatus = 'open' | 'closed' | 'unknown';

function minutes(hhmm: string): number {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Weekday (0 = Sunday) and minutes since midnight in the listing's time zone. */
function localTime(date: Date): { day: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: LISTING_TIME_ZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, minute: Number(get('hour')) * 60 + Number(get('minute')) };
}

/**
 * Whether a listing is open at `date`, evaluated in Indian Standard Time regardless of the
 * device's own time zone. `unknown` when hours are not available; never guessed.
 */
export function openStatus(hours: readonly OpeningPeriod[] | null, date: Date): OpenStatus {
  if (!hours || hours.length === 0) return 'unknown';
  const { day, minute } = localTime(date);
  const open = hours.some(
    (p) => p.day === day && minute >= minutes(p.open) && minute <= minutes(p.close),
  );
  return open ? 'open' : 'closed';
}

/** True for a period covering the whole day (shown as "Open 24 hours"). */
export function isAllDay(period: OpeningPeriod): boolean {
  return period.open === '00:00' && period.close === '23:59';
}
