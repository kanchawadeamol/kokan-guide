import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { App } from './App';
import { parseRoute } from './navigation/route';
import { axeViolations, jsonResponse, renderWithProviders } from './test/render';

const READY = { status: 'ready', checks: { database: 'ok', postgis: 'ok', migrations: 'ok' } };

function renderAt(hash: string) {
  window.location.hash = hash;
  return renderWithProviders(<App />, { fetch: () => jsonResponse(READY) });
}

afterEach(() => {
  window.location.hash = '';
});

describe('parseRoute', () => {
  it.each([
    ['', 'dashboard'],
    ['#/', 'dashboard'],
    ['#/listings', 'listings'],
    ['#/approvals', 'approvals'],
    ['#/approvals?x=1', 'approvals'],
    ['#/unknown', 'dashboard'],
    ['#main-content', 'dashboard'],
  ] as const)('%j -> %s', (hash, route) => {
    expect(parseRoute(hash)).toBe(route);
  });
});

describe('dashboard', () => {
  it('shows sample notice, stats and district breakdown', async () => {
    renderAt('#/');
    await screen.findByText('API is available');

    expect(screen.getByRole('note')).toHaveTextContent(/Sample data/);
    const stats = screen.getByRole('heading', { name: 'Overview' }).parentElement!;
    expect(within(stats).getByText('Total listings').previousElementSibling).toHaveTextContent(
      '24',
    );
    expect(within(stats).getByText('Categories').previousElementSibling).toHaveTextContent('14');
    expect(screen.getByRole('rowheader', { name: 'Ratnagiri' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Raigad' })).toBeInTheDocument();
  });
});

describe('listings', () => {
  it('filters by category and status, announcing the count', async () => {
    renderAt('#/listings');
    await screen.findByRole('heading', { level: 1, name: 'Listings' });
    expect(screen.getByRole('status')).toHaveTextContent('24 of 24 listings');

    await userEvent.selectOptions(screen.getByLabelText('Category'), 'forts');
    expect(screen.getByRole('status')).toHaveTextContent('3 of 24 listings');
    expect(screen.getByRole('rowheader', { name: 'Kolaba Fort' })).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Category'), '');
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'pending');
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(row).toHaveTextContent('Pending approval');
  });

  it('searches names in any language', async () => {
    renderAt('#/listings');
    await screen.findByRole('heading', { level: 1, name: 'Listings' });

    await userEvent.type(screen.getByLabelText('Search by name'), 'किल्ला');
    expect(screen.getByRole('status')).toHaveTextContent('3 of 24 listings');
  });
});

describe('approvals', () => {
  it('approves a pending listing in memory and announces it', async () => {
    renderAt('#/approvals');
    await screen.findByRole('heading', { level: 1, name: 'Approvals' });
    const before = screen.getAllByRole('button', { name: /^Approve:/ }).length;
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(within(nav).getByRole('link', { name: /Approvals/ })).toHaveTextContent(
      `${before} waiting`,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Approve: Coastal Hospital (Sample)' }),
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Coastal Hospital (Sample) approved (sample only, not saved).',
    );
    expect(screen.getAllByRole('button', { name: /^Approve:/ })).toHaveLength(before - 1);
    expect(within(nav).getByRole('link', { name: /Approvals/ })).toHaveTextContent(
      `${before - 1} waiting`,
    );
  });

  it('shows an empty state once every listing is decided', async () => {
    renderAt('#/approvals');
    await screen.findByRole('heading', { level: 1, name: 'Approvals' });

    for (const button of screen.getAllByRole('button', { name: /^Reject:/ })) {
      await userEvent.click(button);
    }
    expect(screen.getByText('No listings are waiting for approval.')).toBeInTheDocument();
  });
});

describe('navigation', () => {
  it('marks the current page and keeps the route when using the skip link', async () => {
    renderAt('#/listings');
    await screen.findByRole('heading', { level: 1, name: 'Listings' });
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(within(nav).getByRole('link', { name: 'Listings' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    await userEvent.click(screen.getByRole('link', { name: 'Skip to main content' }));

    expect(window.location.hash).toBe('#/listings');
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it.each(['#/', '#/listings', '#/approvals'])('%s has no axe violations', async (hash) => {
    const { container } = renderAt(hash);
    await screen.findByRole('heading', { level: 1 });
    expect(await axeViolations(container)).toEqual([]);
  });
});
