import { parseAcceptLanguage, resolveLocale } from '@konkan/shared-types';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * `/` -> `/{locale}`, chosen from the browser's weighted Accept-Language preferences.
 * Temporary (307) because the target depends on the visitor; `Vary` keeps caches correct.
 * Every content page lives under an explicit locale prefix so search engines index each
 * language separately (with hreflang alternates).
 */
export function proxy(request: NextRequest): NextResponse {
  const locale = resolveLocale(parseAcceptLanguage(request.headers.get('accept-language')));
  const response = NextResponse.redirect(new URL(`/${locale}`, request.url), 307);
  response.headers.set('Vary', 'Accept-Language');
  return response;
}

export const config = { matcher: ['/'] };
