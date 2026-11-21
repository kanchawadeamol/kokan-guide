import { resolveLocale } from '@konkan/shared-types';
import type { Locale } from '@konkan/shared-types';
import { getLocales } from 'expo-localization';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { I18nContext } from './context';
import { messages } from './messages';

/** Device languages in preference order, e.g. ['mr-IN', 'en-IN']. */
function deviceLanguageTags(): string[] {
  return getLocales().map((l) => l.languageTag);
}

interface I18nProviderProps {
  children: ReactNode;
  /** Defaults to the device's preferred languages. */
  initialLocale?: Locale;
}

/** Language selection is in memory for now; persistence arrives with Sprint 4 onboarding. */
export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(
    () => initialLocale ?? resolveLocale(deviceLanguageTags()),
  );
  const value = useMemo(() => ({ locale, setLocale, t: messages[locale] }), [locale]);
  return <I18nContext value={value}>{children}</I18nContext>;
}
