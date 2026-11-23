import { createApiClient } from '@konkan/api-client';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';

import { AppProviders } from '../src/AppProviders';
import { readAppConfig } from '../src/config';
import { useI18n } from '../src/i18n/context';
import { ConfigErrorScreen } from '../src/screens/ConfigErrorScreen';
import { useTheme } from '../src/theme/useTheme';

function RootStack() {
  const theme = useTheme();
  const { t } = useI18n();
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          contentStyle: { backgroundColor: theme.background },
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: t.appName }} />
        <Stack.Screen name="auth/login" options={{ title: t.loginTitle }} />
        <Stack.Screen name="auth/otp" options={{ title: t.otpTitle }} />
        <Stack.Screen name="auth/register" options={{ title: t.registerTitle }} />
        <Stack.Screen name="business/new" options={{ title: t.bizTitle }} />
        <Stack.Screen name="report/[slug]" options={{ title: t.reportTitle }} />
        <Stack.Screen name="review/[slug]" options={{ title: t.reviewTitle }} />
        <Stack.Screen name="profile/edit" options={{ title: t.editProfile }} />
        <Stack.Screen name="settings" options={{ title: t.settingsTitle }} />
        <Stack.Screen name="owner" options={{ title: t.ownerTitle }} />
        <Stack.Screen name="feature/[id]" options={{ title: t.badgeSoon }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
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
      <RootStack />
    </AppProviders>
  );
}
