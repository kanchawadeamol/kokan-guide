import type { Locale } from '@konkan/shared-types';

import { messages } from '../i18n/messages';
import { routes } from '../lib/listing';
import styles from './ui.module.css';

/** Plain GET form: works without JavaScript and produces shareable `?q=` URLs. */
export function SearchForm({
  locale,
  defaultValue = '',
  variant = 'hero',
}: {
  locale: Locale;
  defaultValue?: string;
  variant?: 'hero' | 'inline';
}) {
  const t = messages[locale];
  return (
    <form role="search" action={routes.search(locale)} method="get" className={styles.searchForm}>
      <label htmlFor="q" className={styles.searchLabel}>
        {t.searchLabel}
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={t.searchPlaceholder}
        className={styles.searchInput}
        autoComplete="off"
        enterKeyHint="search"
      />
      <button
        type="submit"
        className={variant === 'hero' ? styles.searchButton : styles.searchButtonInline}
      >
        {t.searchButton}
      </button>
    </form>
  );
}
