import type { ApiClient } from '@konkan/api-client';
import type { Locale } from '@konkan/shared-types';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApiClientContext } from './api/context';
import { I18nProvider } from './i18n/I18nProvider';
import type { PreviewUser } from './session/context';
import { SessionProvider } from './session/SessionProvider';

interface AppProvidersProps {
  client: ApiClient;
  children: ReactNode;
  initialLocale?: Locale;
  initialUser?: PreviewUser | null;
}

/** All app-wide providers. Tests render screens inside this with a mock API client. */
export function AppProviders({
  client,
  children,
  initialLocale,
  initialUser = null,
}: AppProvidersProps) {
  return (
    <SafeAreaProvider>
      <I18nProvider {...(initialLocale ? { initialLocale } : {})}>
        <SessionProvider initialUser={initialUser}>
          <ApiClientContext value={client}>{children}</ApiClientContext>
        </SessionProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
