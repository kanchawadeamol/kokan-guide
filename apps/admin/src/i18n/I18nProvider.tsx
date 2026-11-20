import { LOCALE_INFO, resolveLocale } from '@konkan/shared-types';
import type { Locale } from '@konkan/shared-types';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { I18nContext } from './context';
import { messages } from './messages';

interface I18nProviderProps {
  children: ReactNode;
  /** Defaults to the browser's preferred languages. */
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(
    () => initialLocale ?? resolveLocale(navigator.languages),
  );

  // Keep <html lang> in sync so screen readers pronounce content in the right language.
  useEffect(() => {
    document.documentElement.lang = LOCALE_INFO[locale].bcp47;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t: messages[locale] }), [locale]);
  return <I18nContext value={value}>{children}</I18nContext>;
}
