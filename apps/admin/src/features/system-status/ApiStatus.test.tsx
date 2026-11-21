import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { axeViolations, jsonResponse, renderWithProviders } from '../../test/render';
import { ApiStatus } from './ApiStatus';

const READY = { status: 'ready', checks: { database: 'ok', postgis: 'ok', migrations: 'ok' } };
const NOT_READY = {
  status: 'unavailable',
  checks: { database: 'ok', postgis: 'fail', migrations: 'fail' },
};

describe('ApiStatus', () => {
  it('announces loading, then shows a ready API with each check', async () => {
    renderWithProviders(<ApiStatus />, { fetch: () => jsonResponse(READY) });

    expect(screen.getByRole('status')).toHaveTextContent('Checking API status…');
    expect(await screen.findByText('API is available')).toBeInTheDocument();
    expect(screen.getByText('Database').nextElementSibling).toHaveTextContent('OK');
    expect(screen.getByText('Maps (PostGIS)').nextElementSibling).toHaveTextContent('OK');
    expect(screen.getByText('Database schema').nextElementSibling).toHaveTextContent('OK');
  });

  it('calls the readiness endpoint', async () => {
    const { fetch } = renderWithProviders(<ApiStatus />, { fetch: () => jsonResponse(READY) });

    await screen.findByText('API is available');
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0]![0].url).toBe('http://api.test/api/v1/health/ready');
  });

  it('shows which dependency failed when the API is not ready (503)', async () => {
    renderWithProviders(<ApiStatus />, { fetch: () => jsonResponse(NOT_READY, 503) });

    expect(await screen.findByText('API is running but not ready')).toBeInTheDocument();
    expect(screen.getByText('Database').nextElementSibling).toHaveTextContent('OK');
    expect(screen.getByText('Maps (PostGIS)').nextElementSibling).toHaveTextContent('Failed');
  });

  it.each([
    ['502 HTML from a proxy', () => new Response('<html>Bad Gateway</html>', { status: 502 })],
    ['503 with an unexpected body', () => jsonResponse({ detail: 'maintenance' }, 503)],
    ['500 JSON error', () => jsonResponse({ detail: 'boom' }, 500)],
  ])('treats %s as unreachable instead of crashing', async (_case, handler) => {
    renderWithProviders(<ApiStatus />, { fetch: handler });

    expect(await screen.findByText('Cannot reach the API')).toBeInTheDocument();
    expect(screen.queryByText('Database')).not.toBeInTheDocument();
  });

  it('shows an unreachable state on network failure and recovers on retry', async () => {
    let calls = 0;
    renderWithProviders(<ApiStatus />, {
      fetch: () => {
        calls += 1;
        if (calls === 1) throw new TypeError('Failed to fetch');
        return jsonResponse(READY);
      },
    });

    expect(await screen.findByText('Cannot reach the API')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Check again' }));
    expect(await screen.findByText('API is available')).toBeInTheDocument();
  });

  it('keeps the retry button focusable while a check is in progress', async () => {
    let release: (r: Response) => void = () => undefined;
    const { fetch } = renderWithProviders(<ApiStatus />, {
      fetch: () =>
        new Promise<Response>((resolve) => {
          release = resolve;
        }),
    });

    const button = screen.getByRole('button', { name: 'Check again' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toBeEnabled();
    button.focus();
    expect(button).toHaveFocus();

    // The client's async middleware runs before fetch is called; wait for the request.
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledOnce();
    });
    release(jsonResponse(READY));
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-disabled', 'false');
    });
  });

  it('renders in Marathi', async () => {
    renderWithProviders(<ApiStatus />, { fetch: () => jsonResponse(READY), locale: 'mr' });

    expect(await screen.findByText('API उपलब्ध आहे')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'प्रणाली स्थिती' })).toBeInTheDocument();
  });

  it.each([
    ['ready', () => jsonResponse(READY), 'API is available'],
    ['unavailable', () => jsonResponse(NOT_READY, 503), 'API is running but not ready'],
  ])('has no axe violations when %s', async (_name, handler, text) => {
    const { container } = renderWithProviders(<ApiStatus />, { fetch: handler });
    await screen.findByText(text);

    expect(await axeViolations(container)).toEqual([]);
  });
});
