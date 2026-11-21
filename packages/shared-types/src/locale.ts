/**
 * Supported UI/content languages and resolution rules.
 *
 * API data types (businesses, regions, roles) are NOT defined here: they are generated from
 * the backend OpenAPI schema in `@konkan/api-client`, the single source of truth.
 */

export const SUPPORTED_LOCALES = ['mr', 'en', 'hi'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Language used when a translation is missing. English content is written first and is
 * always complete; Marathi and Hindi may lag behind for user/owner-generated content.
 */
export const FALLBACK_LOCALE: Locale = 'en';

export interface LocaleInfo {
  /** Name in its own script, for the language picker (never translated). */
  nativeName: string;
  englishName: string;
  /** BCP 47 tag for `Intl` APIs and the HTML `lang` attribute. */
  bcp47: string;
  script: 'Deva' | 'Latn';
}

export const LOCALE_INFO: Readonly<Record<Locale, LocaleInfo>> = Object.freeze({
  mr: { nativeName: 'मराठी', englishName: 'Marathi', bcp47: 'mr-IN', script: 'Deva' },
  en: { nativeName: 'English', englishName: 'English', bcp47: 'en-IN', script: 'Latn' },
  hi: { nativeName: 'हिन्दी', englishName: 'Hindi', bcp47: 'hi-IN', script: 'Deva' },
});

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Pick the first supported locale from a preference list such as
 * `navigator.languages`, `expo-localization` tags, or a parsed `Accept-Language` header.
 * Region and script subtags are ignored (`mr-IN` -> `mr`, `hi-Deva-IN` -> `hi`).
 */
export function resolveLocale(preferences: readonly string[]): Locale {
  for (const tag of preferences) {
    const language = tag.trim().toLowerCase().split(/[-_]/)[0];
    if (isLocale(language)) return language;
  }
  return FALLBACK_LOCALE;
}

/** Text available in one or more supported languages. */
export type LocalizedText = Partial<Record<Locale, string>>;

/**
 * Return text in the requested locale, falling back to English, then any available
 * translation. Returns `undefined` when no non-empty translation exists, so callers can
 * render an explicit "not available" state instead of an empty string.
 */
export function getLocalizedText(text: LocalizedText, locale: Locale): string | undefined {
  const order: readonly Locale[] = [locale, FALLBACK_LOCALE, ...SUPPORTED_LOCALES];
  for (const candidate of order) {
    const value = text[candidate]?.trim();
    if (value) return value;
  }
  return undefined;
}

/**
 * Parse an HTTP `Accept-Language` header into language tags ordered by preference
 * (quality value, then original order). Invalid entries and `q=0` are dropped, so the result
 * can be passed straight to `resolveLocale`.
 *
 * @example parseAcceptLanguage('en-US;q=0.5, mr-IN, hi;q=0.8') // ['mr-IN', 'hi', 'en-US']
 */
export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) return [];
  return header
    .split(',')
    .map((part, index) => {
      const [rawTag = '', ...params] = part.trim().split(';');
      const tag = rawTag.trim();
      const qParam = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      const q = qParam === undefined ? 1 : Number(qParam.slice(2));
      return { tag, q, index };
    })
    .filter(({ tag, q }) => /^[A-Za-z]{1,8}(?:[-_][A-Za-z0-9]{1,8})*$/.test(tag) && q > 0 && q <= 1)
    .sort((a, b) => b.q - a.q || a.index - b.index)
    .map(({ tag }) => tag);
}
