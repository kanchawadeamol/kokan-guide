import { createApiClient } from '@konkan/api-client';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';

import { AppProviders } from '../src/AppProviders';
import { readAppConfig } from '../src/config';
import { ConfigErrorScreen } from '../src/screens/ConfigErrorScreen';
import { useTheme } from '../src/theme/useTheme';

export default function RootLayout() {
  const theme = useTheme();
  const config = useMemo(() => readAppConfig(), []);
  const client = useMemo(
    () => (config.ok ? createApiClient({ baseUrl: config.apiUrl }) : null),
    [config],
  );

  if (!config.ok || !client) {
    return <ConfigErrorScreen reason={config.ok ? 'API client unavailable' : config.reason} />;
  }

  return (
    <AppProviders client={client}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          contentStyle: { backgroundColor: theme.background },
        }}
      />
    </AppProviders>
  );
}
