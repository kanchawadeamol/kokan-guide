import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { App } from './App';
import { axeViolations, jsonResponse, renderWithProviders } from './test/render';

const READY = { status: 'ready', checks: { database: 'ok', postgis: 'ok', migrations: 'ok' } };

function renderApp(locale: 'en' | 'mr' | 'hi' = 'en') {
  return renderWithProviders(<App />, { fetch: () => jsonResponse(READY), locale });
}

describe('App shell', () => {
  it('has banner, navigation and main landmarks with one h1', async () => {
    renderApp();
    await screen.findByText('API is available');

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('makes the skip link the first focusable element, targeting main content', async () => {
    renderApp();
    await screen.findByText('API is available');

    await userEvent.tab();
    const skip = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skip).toHaveFocus();
    expect(skip).toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
  });

  it('marks the current page in navigation', async () => {
    renderApp();
    await screen.findByText('API is available');

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(within(nav).getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('switches language via the labelled selector and updates <html lang>', async () => {
    renderApp();
    await screen.findByText('API is available');
    expect(document.documentElement.lang).toBe('en-IN');

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'mr');

    expect(document.documentElement.lang).toBe('mr-IN');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('डॅशबोर्ड');
    expect(screen.getByRole('combobox', { name: 'भाषा' })).toHaveValue('mr');
  });

  it('lists every language by its native name', async () => {
    renderApp();
    await screen.findByText('API is available');

    const options = within(screen.getByRole('combobox', { name: 'Language' })).getAllByRole(
      'option',
    );
    expect(options.map((o) => o.textContent)).toEqual(['मराठी', 'English', 'हिन्दी']);
  });

  it.each(['en', 'mr', 'hi'] as const)('has no axe violations in %s', async (locale) => {
    const { container } = renderApp(locale);
    await screen.findByRole('button');
    await screen.findAllByRole('definition');

    expect(await axeViolations(container)).toEqual([]);
  });
});
