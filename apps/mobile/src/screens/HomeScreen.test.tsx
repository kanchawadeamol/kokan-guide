import { fireEvent, screen, waitFor } from 'expo-router/testing-library';

import { renderApp } from '../test/router';

describe('home', () => {
  it('shows the sample notice, all 14 categories and popular places', async () => {
    await renderApp();

    expect(
      await screen.findByRole('header', { name: 'Discover the Konkan coast' }),
    ).toBeOnTheScreen();
    expect(screen.getByText(/Sample data for preview/)).toBeOnTheScreen();
    expect(screen.getAllByTestId(/^category-/)).toHaveLength(14);
    expect(screen.getByTestId('listing-kolaba-fort')).toBeOnTheScreen();
  });

  it('opens a category and then a listing', async () => {
    await renderApp();
    await screen.findByTestId('category-hospitals');

    await fireEvent.press(screen.getByTestId('category-hospitals'));
    expect(await screen.findByRole('header', { name: 'Hospitals' })).toBeOnTheScreen();
    expect(screen.getByText('2 listings')).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('listing-sample-care-hospital-chiplun'));
    expect(await screen.findByRole('header', { name: 'Care Hospital (Sample)' })).toBeOnTheScreen();
  });

  it('category tiles announce name and listing count', async () => {
    await renderApp();
    expect(await screen.findByRole('link', { name: 'Auto drivers, 1 listing' })).toBeOnTheScreen();
  });

  it('renders in Marathi', async () => {
    await renderApp({ locale: 'mr' });
    expect(await screen.findByRole('header', { name: 'कोकण किनारपट्टी शोधा' })).toBeOnTheScreen();
    expect(screen.getByRole('link', { name: /^रुग्णालये/ })).toBeOnTheScreen();
  });
});

describe('search', () => {
  it('finds listings in any language and announces the count', async () => {
    await renderApp({ initialUrl: '/search' });
    const input = await screen.findByTestId('search-input');

    await fireEvent.changeText(input, 'beach');
    expect(screen.getByTestId('search-summary')).toHaveTextContent(/results/);
    expect(screen.getByTestId('listing-kashid-beach')).toBeOnTheScreen();

    await fireEvent.changeText(input, 'zzzz');
    await waitFor(() => {
      expect(screen.getByTestId('search-summary')).toHaveTextContent('No results for “zzzz”.');
    });
  });
});

describe('listing details', () => {
  it('shows placeholder phone, hours and disabled contact actions', async () => {
    await renderApp({ initialUrl: '/listing/sample-family-clinic-dapoli' });

    expect(await screen.findByText('+91 00000 00003')).toBeOnTheScreen();
    expect(screen.getByLabelText(/Sunday: Closed/)).toBeOnTheScreen();
    const call = screen.getByRole('button', { name: 'Call' });
    expect(call).toBeDisabled();
    expect(call.props['accessibilityHint']).toBe('Disabled for sample data');
  });

  it('never shows invented phone numbers or hours for landmarks', async () => {
    await renderApp({ initialUrl: '/listing/murud-janjira-fort' });

    expect(await screen.findByText('No contact details for this place.')).toBeOnTheScreen();
    expect(screen.getByText('Opening hours not available')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Call' })).not.toBeOnTheScreen();
  });
});
