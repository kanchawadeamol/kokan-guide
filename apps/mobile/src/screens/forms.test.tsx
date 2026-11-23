import { minTouchTarget } from '@konkan/design-tokens';
import { fireEvent, screen } from 'expo-router/testing-library';
import { StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { jsonResponse } from '../test/render';
import { renderApp, TEST_USER } from '../test/router';

const READY = { status: 'ready', checks: { database: 'ok', postgis: 'ok', migrations: 'ok' } };

describe('business registration (5 steps)', () => {
  it('validates each step and submits for approval', async () => {
    await renderApp({ initialUrl: '/business/new', user: TEST_USER });
    expect(await screen.findByTestId('business-step')).toHaveTextContent('Step 1 of 5: Details');

    // Step 1: errors, then valid.
    await fireEvent.press(screen.getByTestId('biz-next'));
    expect(screen.getByRole('alert')).toHaveTextContent('Please fix the highlighted fields.');
    await fireEvent.changeText(screen.getByTestId('biz-name'), 'Asha Clinic');
    await fireEvent.press(screen.getByTestId('biz-category'));
    await fireEvent.press(await screen.findByTestId('biz-category-clinics'));
    await fireEvent.press(screen.getByTestId('biz-next'));

    // Step 2: address.
    expect(screen.getByTestId('business-step')).toHaveTextContent('Step 2 of 5: Address');
    await fireEvent.press(screen.getByTestId('biz-district'));
    await fireEvent.press(await screen.findByTestId('biz-district-ratnagiri'));
    await fireEvent.press(screen.getByTestId('biz-taluka'));
    await fireEvent.press(await screen.findByTestId('biz-taluka-dapoli'));
    await fireEvent.changeText(screen.getByTestId('biz-village'), 'Dapoli');
    await fireEvent.press(screen.getByTestId('biz-next'));

    // Step 3: contacts.
    expect(screen.getByTestId('business-step')).toHaveTextContent('Step 3 of 5: Contacts');
    await fireEvent.changeText(screen.getByTestId('biz-phone'), '98765 43210');
    await fireEvent.press(screen.getByTestId('biz-next'));

    // Step 4: default hours are valid; step 5 is optional.
    expect(screen.getByTestId('business-step')).toHaveTextContent('Step 4 of 5: Opening hours');
    await fireEvent.press(screen.getByTestId('biz-next'));
    expect(screen.getByTestId('business-step')).toHaveTextContent(
      'Step 5 of 5: Photos and location',
    );
    await fireEvent.press(screen.getByTestId('biz-next'));

    // Review and submit.
    expect(screen.getByTestId('business-step')).toHaveTextContent('Check your details');
    expect(screen.getByText('Asha Clinic')).toBeOnTheScreen();
    expect(screen.getByText('Dapoli, Dapoli, Ratnagiri')).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('biz-submit'));
    expect(await screen.findByRole('header', { name: 'Submitted for approval' })).toBeOnTheScreen();
  });

  it('Back returns to the previous step keeping entered data', async () => {
    await renderApp({ initialUrl: '/business/new', user: TEST_USER });
    await fireEvent.changeText(await screen.findByTestId('biz-name'), 'Asha Clinic');
    await fireEvent.press(screen.getByTestId('biz-category'));
    await fireEvent.press(await screen.findByTestId('biz-category-clinics'));
    await fireEvent.press(screen.getByTestId('biz-next'));
    await fireEvent.press(screen.getByTestId('biz-back'));

    expect(screen.getByTestId('biz-name').props['value']).toBe('Asha Clinic');
  });
});

describe('report and review', () => {
  it('report requires a reason, then thanks the user', async () => {
    await renderApp({ initialUrl: '/report/kolaba-fort', user: TEST_USER });
    await fireEvent.press(await screen.findByTestId('report-submit'));
    expect(screen.getByText('This field is required.')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('radio', { name: 'Permanently closed' }));
    await fireEvent.press(screen.getByTestId('report-submit'));
    expect(screen.getByRole('alert')).toHaveTextContent(/Thank you. Our team will check this/);
  });

  it('review stars are radio buttons announced as N out of 5', async () => {
    await renderApp({ initialUrl: '/review/kolaba-fort', user: TEST_USER });
    await fireEvent.press(await screen.findByTestId('review-submit'));
    expect(screen.getByText('Choose a rating from 1 to 5.')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('radio', { name: '4 out of 5 stars' }));
    expect(screen.getByRole('radio', { name: '4 out of 5 stars' })).toBeChecked();
    await fireEvent.press(screen.getByTestId('review-submit'));
    expect(screen.getByRole('alert')).toHaveTextContent(/Thank you for your review/);
  });
});

describe('settings', () => {
  it('switches language and shows connection status', async () => {
    await renderApp({ initialUrl: '/settings', fetch: () => jsonResponse(READY) });

    expect(await screen.findByTestId('api-status')).toHaveTextContent(/Connected/);
    await fireEvent.press(screen.getByRole('radio', { name: 'मराठी' }));
    expect(await screen.findByRole('header', { name: 'सेटिंग्ज' })).toBeOnTheScreen();
  });
});

describe('accessibility', () => {
  it.each(['/', '/auth/login', '/business/new', '/review/kolaba-fort'])(
    '%s: every button and radio has a name and a 48dp touch target',
    async (url) => {
      await renderApp({ initialUrl: url, user: url === '/auth/login' ? null : TEST_USER });
      await screen.findAllByRole('button');

      const controls = [...screen.queryAllByRole('button'), ...screen.queryAllByRole('radio')];
      expect(controls.length).toBeGreaterThan(0);
      const minHeightOf = (node: { props: Record<string, unknown> } | null | undefined) => {
        const style = StyleSheet.flatten(node?.props['style'] as StyleProp<ViewStyle>);
        return { min: Number(style?.minHeight ?? style?.height ?? 0), fills: style?.flex === 1 };
      };
      for (const control of controls) {
        expect(control).toHaveAccessibleName();
        // Own minimum, or (e.g. navigation tabs) fills a parent that guarantees the minimum.
        const own = minHeightOf(control);
        const ok =
          own.min >= minTouchTarget ||
          (own.fills && minHeightOf(control.parent).min >= minTouchTarget);
        const name = String(control.props['accessibilityLabel'] ?? control.props['testID'] ?? '?');
        expect({ name, ok }).toEqual({ name, ok: true });
      }
    },
  );
});
