import { isLocale, LOCALE_INFO, SUPPORTED_LOCALES } from '@konkan/shared-types';
import { useId } from 'react';
import type { ReactNode } from 'react';

import { format } from '../i18n/messages';
import { useI18n } from '../i18n/context';
import { ROUTE_HREF } from '../navigation/route';
import type { Route } from '../navigation/route';
import { useSampleListings } from '../sample/context';
import styles from './AppShell.module.css';

export const MAIN_CONTENT_ID = 'main-content';

export function AppShell({ route, children }: { route: Route; children: ReactNode }) {
  const { locale, setLocale, t } = useI18n();
  const { listings } = useSampleListings();
  const languageId = useId();
  const pending = listings.filter((l) => l.verification === 'pending').length;

  const navItems: readonly { route: Route; label: string; badge?: string }[] = [
    { route: 'dashboard', label: t.navDashboard },
    { route: 'listings', label: t.navListings },
    {
      route: 'approvals',
      label: t.navApprovals,
      ...(pending > 0 ? { badge: format(t.pendingCount, { count: pending }) } : {}),
    },
  ];

  return (
    <>
      <a
        className="skip-link"
        href={`#${MAIN_CONTENT_ID}`}
        onClick={(event) => {
          // Hash routing owns the URL fragment: move focus without changing the route.
          event.preventDefault();
          document.getElementById(MAIN_CONTENT_ID)?.focus();
        }}
      >
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
            {navItems.map((item) => (
              <li key={item.route}>
                <a
                  className={styles.navLink}
                  href={ROUTE_HREF[item.route]}
                  aria-current={item.route === route ? 'page' : undefined}
                >
                  <span>{item.label}</span>
                  {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
                </a>
              </li>
            ))}
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
