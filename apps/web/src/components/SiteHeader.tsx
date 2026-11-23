import type { Locale } from '@konkan/shared-types';
import Link from 'next/link';

import { messages } from '../i18n/messages';
import { LanguageLinks } from './LanguageLinks';
import styles from './SiteHeader.module.css';

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return (
    <header className={styles.header}>
      <Link href={`/${locale}`} className={styles.brand}>
        <span aria-hidden="true" className={styles.logo}>
          ⛵
        </span>
        {t.siteName}
      </Link>
      <LanguageLinks locale={locale} label={t.languageNavLabel} />
    </header>
  );
}
