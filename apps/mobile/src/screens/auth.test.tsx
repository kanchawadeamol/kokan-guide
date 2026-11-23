import { fireEvent, screen, waitFor } from 'expo-router/testing-library';

import { renderApp, TEST_USER } from '../test/router';

describe('guest login flow', () => {
  it('saving as a guest goes through login, OTP and register, then back to the listing', async () => {
    await renderApp({ initialUrl: '/listing/kolaba-fort' });
    await fireEvent.press(await screen.findByTestId('save-button'));

    // Login: invalid number is rejected with an announced error.
    await fireEvent.changeText(await screen.findByTestId('login-phone'), '12345');
    await fireEvent.press(screen.getByTestId('login-send'));
    expect(screen.getByText('Enter a valid 10-digit mobile number.')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByTestId('login-phone'), '98765 43210');
    await fireEvent.press(screen.getByTestId('login-send'));

    // OTP: wrong code, then the preview code.
    expect(
      await screen.findByText('Enter the 6-digit code sent to +919876543210.'),
    ).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByTestId('otp-code'), '111111');
    await fireEvent.press(screen.getByTestId('otp-verify'));
    expect(screen.getByText('Incorrect code. Try again.')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByTestId('otp-code'), '123456');
    await fireEvent.press(screen.getByTestId('otp-verify'));

    // Register: validation, then success.
    await fireEvent.press(await screen.findByTestId('register-submit'));
    expect(screen.getByRole('alert')).toHaveTextContent('Please fix the highlighted fields.');
    await fireEvent.changeText(screen.getByTestId('register-name'), 'Asha Patil');
    await fireEvent.press(screen.getByTestId('register-district'));
    await fireEvent.press(await screen.findByTestId('register-district-raigad'));
    await fireEvent.press(screen.getByTestId('register-taluka'));
    await fireEvent.press(await screen.findByTestId('register-taluka-alibag'));
    await fireEvent.press(screen.getByTestId('register-terms'));
    await fireEvent.press(screen.getByTestId('register-submit'));

    // Back on the listing, now logged in.
    expect(await screen.findByRole('header', { name: 'Kolaba Fort' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('save-button'));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Saved' })).toBeOnTheScreen();
    });
  });

  it('Google sign-in is shown but disabled with a reason', async () => {
    await renderApp({ initialUrl: '/auth/login' });
    const google = await screen.findByTestId('login-google');
    expect(google).toBeDisabled();
    expect(google.props['accessibilityHint']).toBe('Google sign-in will be available after setup.');
  });

  it('resend is disabled during the countdown', async () => {
    await renderApp({ initialUrl: '/auth/otp?phone=%2B919876543210' });
    const resend = await screen.findByTestId('otp-resend');
    expect(resend).toBeDisabled();
    expect(resend).toHaveTextContent(/Resend code in \d+s/);
  });
});

describe('profile', () => {
  it('guests see a login prompt', async () => {
    await renderApp({ initialUrl: '/profile' });
    expect(await screen.findByText('You are browsing as a guest')).toBeOnTheScreen();
  });

  it('logged-in users can edit their profile', async () => {
    await renderApp({ initialUrl: '/profile', user: TEST_USER });
    expect(await screen.findByRole('header', { name: 'Asha Patil' })).toBeOnTheScreen();
    expect(screen.getByText('Dapoli, Ratnagiri')).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('profile-edit'));
    await fireEvent.changeText(await screen.findByTestId('edit-name'), 'A');
    await fireEvent.press(screen.getByTestId('edit-save'));
    expect(
      screen.getByText('Enter a name using letters only (2–80 characters).'),
    ).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByTestId('edit-name'), 'Asha Naik');
    await fireEvent.press(screen.getByTestId('edit-save'));
    expect(screen.getByRole('alert')).toHaveTextContent('Changes saved (preview only).');
  });

  it('logout returns to guest mode', async () => {
    await renderApp({ initialUrl: '/profile', user: TEST_USER });
    await fireEvent.press(await screen.findByTestId('profile-logout'));
    expect(await screen.findByText('You are browsing as a guest')).toBeOnTheScreen();
  });
});
