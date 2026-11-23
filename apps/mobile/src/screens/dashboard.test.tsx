import { fireEvent, screen } from 'expo-router/testing-library';

import { FEATURES } from '../features/catalogue';
import { renderApp, TEST_USER } from '../test/router';

describe('home dashboard', () => {
  it('lists every feature with its description', async () => {
    await renderApp();
    for (const feature of FEATURES) {
      expect(await screen.findByTestId(`feature-${feature.id}`)).toBeOnTheScreen();
    }
    expect(
      screen.getByText('Official emergency numbers. Always available, no login needed.'),
    ).toBeOnTheScreen();
  });

  it('announces "Login required" and "Coming soon" badges for guests', async () => {
    await renderApp();
    expect(
      await screen.findByRole('button', { name: 'Favourites, Login required' }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Register business, Login required' }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Business dashboard, Login required' }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Map view, Coming soon' })).toBeOnTheScreen();
    // Emergency is never gated.
    expect(screen.getByRole('button', { name: 'Emergency' })).toBeOnTheScreen();
  });

  it('hides the login badge once logged in', async () => {
    await renderApp({ user: TEST_USER });
    expect(await screen.findByRole('button', { name: 'Favourites' })).toBeOnTheScreen();
    expect(screen.queryByText('Login required')).not.toBeOnTheScreen();
  });

  it('a login-only feature sends guests to login', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByTestId('feature-register'));
    expect(await screen.findByTestId('login-phone')).toBeOnTheScreen();
  });

  it('opens the owner dashboard with clearly-labelled sample numbers', async () => {
    await renderApp({ user: TEST_USER });
    await fireEvent.press(await screen.findByTestId('feature-owner'));
    expect(await screen.findByText('Last 30 days')).toBeOnTheScreen();
    expect(screen.getByLabelText('Call clicks: 23')).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Sample numbers for preview. Real statistics appear after your listing is verified.',
      ),
    ).toBeOnTheScreen();
  });

  it('explains coming-soon features', async () => {
    await renderApp();
    await fireEvent.press(await screen.findByTestId('feature-assistant'));
    expect(await screen.findByText(/never invented phone numbers or hours/)).toBeOnTheScreen();
    expect(screen.getByTestId('coming-soon-back')).toBeOnTheScreen();
  });
});

describe('login-only routes (deep links)', () => {
  it.each([
    '/owner',
    '/business/new',
    '/profile/edit',
    '/review/kolaba-fort',
    '/report/kolaba-fort',
  ])('%s shows a login prompt to guests', async (url) => {
    await renderApp({ initialUrl: url });
    expect(await screen.findByTestId('login-gate')).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('login-gate-login'));
    expect(await screen.findByTestId('login-phone')).toBeOnTheScreen();
  });

  it('profile shows the account section only when logged in', async () => {
    await renderApp({ initialUrl: '/profile' });
    expect(await screen.findByTestId('profile-login')).toBeOnTheScreen();
    expect(screen.queryByTestId('profile-account')).not.toBeOnTheScreen();
  });

  it('profile account section links to favourites and the business dashboard', async () => {
    await renderApp({ initialUrl: '/profile', user: TEST_USER });
    expect(await screen.findByRole('button', { name: 'Favourites (0)' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('profile-owner'));
    expect(await screen.findByText('Last 30 days')).toBeOnTheScreen();
  });
});
