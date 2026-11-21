import { minTouchTarget } from '@konkan/design-tokens';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { jsonResponse, renderWithProviders } from '../test/render';
import { HomeScreen } from './HomeScreen';

const READY = { status: 'ready', checks: { database: 'ok', postgis: 'ok', migrations: 'ok' } };
const NOT_READY = {
  status: 'unavailable',
  checks: { database: 'fail', postgis: 'fail', migrations: 'fail' },
};

describe('HomeScreen', () => {
  it('shows a heading and announces connection status', async () => {
    await renderWithProviders(<HomeScreen />, { fetch: () => jsonResponse(READY) });

    expect(screen.getByRole('header', { name: 'Discover the Konkan coast' })).toBeOnTheScreen();
    await waitFor(() => {
      expect(screen.getByTestId('api-status')).toHaveTextContent(/Connected/);
    });
    expect(screen.getByTestId('api-status').props['accessibilityLiveRegion']).toBe('polite');
  });

  it('calls the readiness endpoint', async () => {
    const { fetch } = await renderWithProviders(<HomeScreen />, {
      fetch: () => jsonResponse(READY),
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    expect(fetch.mock.calls[0]?.[0].url).toBe('http://api.test/api/v1/health/ready');
  });

  it('shows a friendly message when the service is not ready', async () => {
    await renderWithProviders(<HomeScreen />, { fetch: () => jsonResponse(NOT_READY, 503) });

    await waitFor(() => {
      expect(screen.getByTestId('api-status')).toHaveTextContent(
        /Service is temporarily unavailable/,
      );
    });
  });

  it('recovers via "Try again" after a network failure', async () => {
    let calls = 0;
    await renderWithProviders(<HomeScreen />, {
      fetch: () => {
        calls += 1;
        if (calls === 1) throw new TypeError('Network request failed');
        return jsonResponse(READY);
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('api-status')).toHaveTextContent(/Cannot connect/);
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => {
      expect(screen.getByTestId('api-status')).toHaveTextContent(/Connected/);
    });
  });

  it('shows a checking state and marks the retry button busy while the request is pending', async () => {
    // RNTL 14's async render flushes resolved requests, so use one that never settles.
    await renderWithProviders(<HomeScreen />, {
      fetch: () => new Promise<Response>(() => undefined),
    });

    expect(screen.getByTestId('api-status')).toHaveTextContent(/Checking connection/);
    expect(screen.getByRole('button', { name: 'Try again' })).toBeBusy();
  });

  it('offers languages as a radio group named in their own scripts', async () => {
    await renderWithProviders(<HomeScreen />, { fetch: () => jsonResponse(READY) });

    const radios = screen.getAllByRole('radio');
    expect(radios.map((r) => String(r.props['accessibilityLanguage']))).toEqual([
      'mr-IN',
      'en-IN',
      'hi-IN',
    ]);
    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'मराठी' })).not.toBeChecked();
  });

  it('switches the UI to Marathi', async () => {
    await renderWithProviders(<HomeScreen />, { fetch: () => jsonResponse(READY) });

    await fireEvent.press(screen.getByRole('radio', { name: 'मराठी' }));

    expect(screen.getByRole('radio', { name: 'मराठी' })).toBeChecked();
    expect(screen.getByRole('header', { name: 'कोकण किनारपट्टी शोधा' })).toBeOnTheScreen();
    await waitFor(() => {
      expect(screen.getByTestId('api-status')).toHaveTextContent(/जोडलेले/);
    });
  });

  it('gives every interactive control a role, a name and a 48dp touch target', async () => {
    await renderWithProviders(<HomeScreen />, { fetch: () => jsonResponse(READY) });

    const controls = [...screen.getAllByRole('button'), ...screen.getAllByRole('radio')];
    expect(controls).toHaveLength(4);
    for (const control of controls) {
      expect(control).toHaveAccessibleName();
      const style = StyleSheet.flatten(control.props['style'] as StyleProp<ViewStyle>);
      expect(style?.minHeight).toBeGreaterThanOrEqual(minTouchTarget);
    }
  });
});
