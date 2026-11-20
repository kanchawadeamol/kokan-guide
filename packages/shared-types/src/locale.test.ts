import { describe, expect, it } from 'vitest';

import {
  FALLBACK_LOCALE,
  getLocalizedText,
  isLocale,
  LOCALE_INFO,
  resolveLocale,
  SUPPORTED_LOCALES,
} from './locale';

describe('SUPPORTED_LOCALES', () => {
  it('are Marathi, English and Hindi, with metadata for each', () => {
    expect([...SUPPORTED_LOCALES].sort()).toEqual(['en', 'hi', 'mr']);
    for (const locale of SUPPORTED_LOCALES) {
      expect(LOCALE_INFO[locale].bcp47.startsWith(locale)).toBe(true);
    }
  });

  it('show language names in their own script', () => {
    expect(LOCALE_INFO.mr.nativeName).toBe('मराठी');
    expect(LOCALE_INFO.hi.nativeName).toBe('हिन्दी');
  });
});

describe('isLocale', () => {
  it.each(['mr', 'en', 'hi'])('accepts %s', (value) => {
    expect(isLocale(value)).toBe(true);
  });

  it.each(['MR', 'mr-IN', 'gu', '', null, undefined, 42, {}])('rejects %j', (value) => {
    expect(isLocale(value)).toBe(false);
  });
});

describe('resolveLocale', () => {
  it.each([
    [['mr-IN', 'en-US'], 'mr'],
    [['hi-Deva-IN'], 'hi'],
    [['en_GB'], 'en'],
    [['  HI  '], 'hi'],
    [['gu-IN', 'kn', 'hi-IN', 'en'], 'hi'],
  ] as const)('%j -> %s', (preferences, expected) => {
    expect(resolveLocale(preferences)).toBe(expected);
  });

  it('falls back to English when nothing matches', () => {
    expect(resolveLocale(['fr-FR', 'gu'])).toBe(FALLBACK_LOCALE);
    expect(resolveLocale([])).toBe('en');
  });
});

describe('getLocalizedText', () => {
  const full = { mr: 'दवाखाना', en: 'Clinic', hi: 'क्लिनिक' };

  it('returns the requested language', () => {
    expect(getLocalizedText(full, 'mr')).toBe('दवाखाना');
    expect(getLocalizedText(full, 'hi')).toBe('क्लिनिक');
  });

  it('falls back to English before other languages', () => {
    expect(getLocalizedText({ en: 'Clinic', hi: 'क्लिनिक' }, 'mr')).toBe('Clinic');
  });

  it('falls back to any available translation when English is missing', () => {
    expect(getLocalizedText({ hi: 'क्लिनिक' }, 'mr')).toBe('क्लिनिक');
  });

  it('treats blank strings as missing', () => {
    expect(getLocalizedText({ mr: '   ', en: 'Clinic' }, 'mr')).toBe('Clinic');
  });

  it('returns undefined when no translation exists', () => {
    expect(getLocalizedText({}, 'en')).toBeUndefined();
    expect(getLocalizedText({ en: '' }, 'en')).toBeUndefined();
  });
});
