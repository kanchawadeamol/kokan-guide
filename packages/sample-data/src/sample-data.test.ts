import { SUPPORTED_LOCALES } from '@konkan/shared-types';
import { describe, expect, it } from 'vitest';

import {
  categories,
  districts,
  getDistrict,
  getCategory,
  getListing,
  getPlace,
  isAllDay,
  listings,
  listingsByCategory,
  openStatus,
  places,
  popularListings,
  searchListings,
} from './index';
import type { OpeningPeriod, Translations } from './types';

const DEVANAGARI = /[ऀ-ॿ]/;

function expectTranslated(t: Translations, label: string) {
  for (const locale of SUPPORTED_LOCALES) {
    expect(t[locale].trim(), `${label}.${locale}`).not.toBe('');
  }
  expect(t.mr, `${label}.mr`).toMatch(DEVANAGARI);
  expect(t.hi, `${label}.hi`).toMatch(DEVANAGARI);
}

describe('categories', () => {
  it('are the 14 home-screen categories from the brief, with unique slugs', () => {
    expect(categories).toHaveLength(14);
    expect(new Set(categories.map((c) => c.slug)).size).toBe(14);
    expect(categories.map((c) => c.slug)).toContain('emergency-contacts');
  });

  it('are fully translated', () => {
    for (const c of categories) {
      expectTranslated(c.name, c.slug);
      expectTranslated(c.description, `${c.slug}.description`);
    }
  });
});

describe('listing integrity', () => {
  it('has unique slugs and valid category/place references', () => {
    expect(new Set(listings.map((l) => l.slug)).size).toBe(listings.length);
    for (const l of listings) {
      expect(getCategory(l.categorySlug), l.slug).toBeDefined();
      expect(getPlace(l.placeSlug), l.slug).toBeDefined();
      expectTranslated(l.name, l.slug);
      expectTranslated(l.description, `${l.slug}.description`);
    }
  });

  it('marks every fictional business as a sample in all languages', () => {
    for (const l of listings.filter((x) => x.kind === 'fictional-business')) {
      expect(l.name.en).toMatch(/\(Sample\)$/);
      expect(l.name.mr).toMatch(/\(नमुना\)$/);
      expect(l.name.hi).toMatch(/\(नमूना\)$/);
    }
  });

  it('uses only invalid placeholder phone numbers, each unique', () => {
    const phones = listings.flatMap((l) => (l.phone ? [l.phone] : []));
    for (const phone of phones) {
      // Indian numbers never start with 0 after +91, so these cannot reach a real person.
      expect(phone).toMatch(/^\+91 00000 \d{5}$/);
    }
    expect(new Set(phones).size).toBe(phones.length);
  });

  it('never invents phone numbers or opening hours for real landmarks', () => {
    const landmarks = listings.filter((l) => l.kind === 'public-landmark');
    expect(landmarks.length).toBeGreaterThan(0);
    for (const l of landmarks) {
      expect(l.phone, l.slug).toBeNull();
      expect(l.hours, l.slug).toBeNull();
      expect(l.hasWhatsApp, l.slug).toBe(false);
      expect(l.verification, l.slug).toBe('unverified');
    }
  });

  it('has no listings under emergency contacts (official numbers only, later)', () => {
    expect(listingsByCategory('emergency-contacts')).toEqual([]);
  });

  it('uses place slugs that exist in the database seed', () => {
    expect(places.map((p) => p.slug)).toEqual(
      expect.arrayContaining(['dapoli', 'mandangad', 'alibag', 'ganpatipule', 'kashid']),
    );
    for (const p of places) expect(['ratnagiri', 'raigad']).toContain(p.district);
  });
});

describe('queries', () => {
  it('finds listings by category and slug', () => {
    expect(listingsByCategory('hospitals').map((l) => l.slug)).toEqual([
      'sample-care-hospital-chiplun',
      'sample-coastal-hospital-alibag',
    ]);
    expect(getListing('kolaba-fort')?.categorySlug).toBe('forts');
    expect(getListing('missing')).toBeUndefined();
  });

  it('lists popular listings', () => {
    expect(popularListings().length).toBeGreaterThanOrEqual(4);
  });

  it.each([
    ['dapoli', 'sample-konkan-kitchen-dapoli'],
    ['दापोली', 'sample-family-clinic-dapoli'],
    ['hospital', 'sample-care-hospital-chiplun'],
    ['रुग्णालय', 'sample-coastal-hospital-alibag'],
    ['fort raigad', 'murud-janjira-fort'],
    ['  KASHID  ', 'kashid-beach'],
  ])('search %j includes %s', (query, slug) => {
    expect(searchListings(query).map((l) => l.slug)).toContain(slug);
  });

  it('requires every search term to match', () => {
    expect(searchListings('beach mandangad')).toEqual([]);
    expect(searchListings('')).toEqual([]);
  });
});

describe('openStatus (Indian Standard Time)', () => {
  const weekdays: OpeningPeriod[] = [1, 2, 3, 4, 5, 6].map((d) => ({
    day: d as OpeningPeriod['day'],
    open: '09:00',
    close: '18:00',
  }));

  it.each([
    // 2026-11-23 is a Monday. 04:30 UTC = 10:00 IST.
    ['2026-11-23T04:30:00Z', 'open'],
    // 02:00 UTC = 07:30 IST, before opening.
    ['2026-11-23T02:00:00Z', 'closed'],
    // Sunday 2026-11-22, 10:00 IST: closed on Sundays.
    ['2026-11-22T04:30:00Z', 'closed'],
    // Monday 18:00 IST exactly (closing minute) still open.
    ['2026-11-23T12:30:00Z', 'open'],
  ])('%s -> %s', (iso, expected) => {
    expect(openStatus(weekdays, new Date(iso))).toBe(expected);
  });

  it('uses IST even near the UTC day boundary', () => {
    // Sunday 20:00 UTC is Monday 01:30 IST: closed because before 09:00 Monday.
    expect(openStatus(weekdays, new Date('2026-11-22T20:00:00Z'))).toBe('closed');
  });

  it('is unknown when hours are not available', () => {
    expect(openStatus(null, new Date())).toBe('unknown');
    expect(openStatus([], new Date())).toBe('unknown');
  });

  it('recognises all-day periods', () => {
    expect(isAllDay({ day: 1, open: '00:00', close: '23:59' })).toBe(true);
    expect(isAllDay({ day: 1, open: '09:00', close: '18:00' })).toBe(false);
  });
});

describe('districts for form pickers', () => {
  it('mirror the database seed: Ratnagiri 9 talukas, Raigad 15', () => {
    expect(districts.map((d) => d.slug)).toEqual(['ratnagiri', 'raigad']);
    expect(getDistrict('ratnagiri')?.talukas).toHaveLength(9);
    expect(getDistrict('raigad')?.talukas).toHaveLength(15);
  });

  it('cover every place used by sample listings', () => {
    for (const p of places) {
      const district = getDistrict(p.district);
      expect(
        district?.talukas.map((t) => t.slug),
        p.slug,
      ).toContain(p.taluka);
    }
  });

  it('fall back to the Marathi spelling for Hindi place names', () => {
    for (const d of districts) {
      for (const t of d.talukas) expect(t.name.hi).toBe(t.name.mr);
    }
  });
});
