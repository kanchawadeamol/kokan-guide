import { isLocale, LOCALE_INFO, SUPPORTED_LOCALES } from '@konkan/shared-types';
import { useId } from 'react';
import type { ReactNode } from 'react';

import { useI18n } from '../i18n/context';
import styles from './AppShell.module.css';

export const MAIN_CONTENT_ID = 'main-content';

export function AppShell({ children }: { children: ReactNode }) {
  const { locale, setLocale, t } = useI18n();
  const languageId = useId();

  return (
    <>
      <a className="skip-link" href={`#${MAIN_CONTENT_ID}`}>
        {t.skipToContent}
      </a>
      <header className={styles.header}>
        <p className={styles.appName}>{t.appName}</p>
        <div className={styles.language}>
          <label htmlFor={languageId}>{t.languageLabel}</label>
          <select
            id={languageId}
            className={styles.select}
            value={locale}
            onChange={(event) => {
              if (isLocale(event.target.value)) setLocale(event.target.value);
            }}
          >
            {SUPPORTED_LOCALES.map((code) => (
              <option key={code} value={code} lang={LOCALE_INFO[code].bcp47}>
                {LOCALE_INFO[code].nativeName}
              </option>
            ))}
          </select>
        </div>
      </header>
      <div className={styles.layout}>
        <nav className={styles.nav} aria-label={t.mainNavigation}>
          <ul className={styles.navList}>
            <li>
              <a className={styles.navLink} href="/" aria-current="page">
                {t.navDashboard}
              </a>
            </li>
          </ul>
        </nav>
        {/* tabIndex -1 lets the skip link move keyboard focus into main content. */}
        <main id={MAIN_CONTENT_ID} className={styles.main} tabIndex={-1}>
          {children}
        </main>
      </div>
    </>
  );
}
