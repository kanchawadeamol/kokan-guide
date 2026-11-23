'use client';

import { LOCALE_INFO, SUPPORTED_LOCALES } from '@konkan/shared-types';
import type { Locale } from '@konkan/shared-types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import styles from './SiteHeader.module.css';

/** `/en/category/hotels` -> `/mr/category/hotels` (keeps the visitor on the same page). */
export function localizedPath(pathname: string, target: Locale): string {
  const segments = pathname.split('/');
  segments[1] = target;
  return segments.join('/') || `/${target}`;
}

/**
 * Crawlable language links (not a <select>). Each link declares its language for screen
 * readers (`lang`) and search engines (`hrefLang`), and points at the same page in that language.
 */
export function LanguageLinks({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() || `/${locale}`;

  return (
    <nav aria-label={label}>
      <ul className={styles.languages}>
        {SUPPORTED_LOCALES.map((code) => {
          const info = LOCALE_INFO[code];
          return (
            <li key={code}>
              <Link
                href={localizedPath(pathname, code)}
                hrefLang={info.bcp47}
                lang={info.bcp47}
                className={styles.languageLink}
                aria-current={code === locale ? 'page' : undefined}
              >
                {info.nativeName}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
