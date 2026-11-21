import type { ApiClient } from '@konkan/api-client';
import type { Locale } from '@konkan/shared-types';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApiClientContext } from './api/context';
import { I18nProvider } from './i18n/I18nProvider';

interface AppProvidersProps {
  client: ApiClient;
  children: ReactNode;
  initialLocale?: Locale;
}

/** All app-wide providers. Tests render screens inside this with a mock API client. */
export function AppProviders({ client, children, initialLocale }: AppProvidersProps) {
  return (
    <SafeAreaProvider>
      <I18nProvider {...(initialLocale ? { initialLocale } : {})}>
        <ApiClientContext value={client}>{children}</ApiClientContext>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
