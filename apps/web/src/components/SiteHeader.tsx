import { LOCALE_INFO, SUPPORTED_LOCALES } from '@konkan/shared-types';
import type { Locale } from '@konkan/shared-types';
import Link from 'next/link';

import { messages } from '../i18n/messages';
import styles from './SiteHeader.module.css';

/**
 * Site header with crawlable language links (not a <select>): search engines follow them,
 * and each link declares its language for screen readers via `lang` / `hrefLang`.
 */
export function SiteHeader({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return (
    <header className={styles.header}>
      <Link href={`/${locale}`} className={styles.brand}>
        {t.siteName}
      </Link>
      <nav aria-label={t.languageNavLabel}>
        <ul className={styles.languages}>
          {SUPPORTED_LOCALES.map((code) => {
            const info = LOCALE_INFO[code];
            const current = code === locale;
            return (
              <li key={code}>
                <Link
                  href={`/${code}`}
                  hrefLang={info.bcp47}
                  lang={info.bcp47}
                  className={styles.languageLink}
                  aria-current={current ? 'page' : undefined}
                >
                  {info.nativeName}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
