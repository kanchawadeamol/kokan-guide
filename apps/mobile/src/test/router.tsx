import { createApiClient } from '@konkan/api-client';
import type { Locale } from '@konkan/shared-types';
import { Stack } from 'expo-router';
import { renderRouter } from 'expo-router/testing-library';

import TabsLayout from '../../app/(tabs)/_layout';
import HomeRoute from '../../app/(tabs)/index';
import ProfileRoute from '../../app/(tabs)/profile';
import SavedRoute from '../../app/(tabs)/saved';
import SearchRoute from '../../app/(tabs)/search';
import LoginRoute from '../../app/auth/login';
import OtpRoute from '../../app/auth/otp';
import RegisterRoute from '../../app/auth/register';
import BusinessRoute from '../../app/business/new';
import CategoryRoute from '../../app/category/[slug]';
import ListingRoute from '../../app/listing/[slug]';
import EditProfileRoute from '../../app/profile/edit';
import ReportRoute from '../../app/report/[slug]';
import ReviewRoute from '../../app/review/[slug]';
import SettingsRoute from '../../app/settings';
import { AppProviders } from '../AppProviders';
import type { PreviewUser } from '../session/context';
import { jsonResponse } from './render';
import type { FetchHandler } from './render';

export const TEST_USER: PreviewUser = {
  name: 'Asha Patil',
  phone: '+919876543210',
  district: 'ratnagiri',
  taluka: 'dapoli',
};

/**
 * Render the real route components under a test root layout (providers + mock API client),
 * so navigation flows (guest -> login -> OTP -> register -> back) are exercised for real.
 */
export function renderApp({
  initialUrl = '/',
  user = null,
  locale = 'en',
  fetch: handler,
}: {
  initialUrl?: string;
  user?: PreviewUser | null;
  locale?: Locale;
  fetch?: FetchHandler;
} = {}) {
  const fetch = jest.fn((input: Request) =>
    Promise.resolve(handler ? handler(input) : jsonResponse({})),
  );
  const client = createApiClient({
    baseUrl: 'http://api.test',
    fetch: fetch as unknown as typeof globalThis.fetch,
  });

  function TestRootLayout() {
    return (
      <AppProviders client={client} initialLocale={locale} initialUser={user}>
        <Stack />
      </AppProviders>
    );
  }

  return renderRouter(
    {
      _layout: TestRootLayout,
      '(tabs)/_layout': TabsLayout,
      '(tabs)/index': HomeRoute,
      '(tabs)/search': SearchRoute,
      '(tabs)/saved': SavedRoute,
      '(tabs)/profile': ProfileRoute,
      'auth/login': LoginRoute,
      'auth/otp': OtpRoute,
      'auth/register': RegisterRoute,
      'business/new': BusinessRoute,
      'category/[slug]': CategoryRoute,
      'listing/[slug]': ListingRoute,
      'profile/edit': EditProfileRoute,
      'report/[slug]': ReportRoute,
      'review/[slug]': ReviewRoute,
      settings: SettingsRoute,
    },
    { initialUrl },
  );
}
