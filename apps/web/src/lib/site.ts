import { LOCALE_INFO, SUPPORTED_LOCALES } from '@konkan/shared-types';
import type { Locale } from '@konkan/shared-types';

const DEV_SITE_URL = 'http://127.0.0.1:3000';

/**
 * Public origin of the website, used for canonical URLs, hreflang links and the sitemap.
 * Required in production builds: wrong canonical URLs silently damage search ranking.
 */
export function getSiteUrl(env: NodeJS.ProcessEnv = process.env): URL {
  const raw = env.SITE_URL?.trim();
  if (!raw) {
    if (env.NODE_ENV === 'production') {
      throw new Error('SITE_URL must be set for production builds (canonical URLs, sitemap).');
    }
    return new URL(DEV_SITE_URL);
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`SITE_URL must be an absolute URL, got ${JSON.stringify(raw)}`);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`SITE_URL must use http(s), got ${url.protocol}`);
  }
  if (url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    throw new Error(`SITE_URL must be an origin only, got ${JSON.stringify(raw)}`);
  }
  return new URL(url.origin);
}

/** Absolute URL of a page in a given locale, e.g. `https://site/mr/places`. */
export function localeUrl(site: URL, locale: Locale, path = ''): string {
  const suffix = path && !path.startsWith('/') ? `/${path}` : path;
  return new URL(`/${locale}${suffix === '/' ? '' : suffix}`, site).toString();
}

/**
 * Canonical URL plus hreflang alternates for every locale. `x-default` points at English,
 * the fallback language for visitors whose language we do not support.
 */
export function buildAlternates(site: URL, locale: Locale, path = '') {
  const languages: Record<string, string> = {};
  for (const code of SUPPORTED_LOCALES) {
    languages[LOCALE_INFO[code].bcp47] = localeUrl(site, code, path);
  }
  languages['x-default'] = localeUrl(site, 'en', path);
  return { canonical: localeUrl(site, locale, path), languages };
}
