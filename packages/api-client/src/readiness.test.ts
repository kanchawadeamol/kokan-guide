import { describe, expect, it, vi } from 'vitest';

import { createApiClient } from './client';
import { fetchReadiness, isReadinessBody } from './readiness';

const READY = { status: 'ready', checks: { database: 'ok', postgis: 'ok' } };
const NOT_READY = { status: 'unavailable', checks: { database: 'ok', postgis: 'fail' } };

function clientReturning(make: () => Response | Promise<Response>) {
  const fetch = vi.fn(() => Promise.resolve(make()));
  return createApiClient({
    baseUrl: 'http://api.test',
    fetch,
  });
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('fetchReadiness', () => {
  it('returns ready with checks on 200', async () => {
    expect(await fetchReadiness(clientReturning(() => json(READY)))).toEqual({
      kind: 'ready',
      checks: READY.checks,
    });
  });

  it('returns unavailable with the failing checks on a valid 503', async () => {
    expect(await fetchReadiness(clientReturning(() => json(NOT_READY, 503)))).toEqual({
      kind: 'unavailable',
      checks: NOT_READY.checks,
    });
  });

  it.each([
    ['502 HTML from a proxy', () => new Response('<html>Bad Gateway</html>', { status: 502 })],
    ['503 with an unexpected body', () => json({ detail: 'maintenance' }, 503)],
    ['500 JSON', () => json({ detail: 'boom' }, 500)],
    ['200 with an unexpected body', () => json({ hello: 'world' })],
  ])('treats %s as unreachable', async (_case, make) => {
    expect(await fetchReadiness(clientReturning(make))).toEqual({ kind: 'unreachable' });
  });

  it('treats network failures as unreachable', async () => {
    const client = clientReturning(() => {
      throw new TypeError('Failed to fetch');
    });
    expect(await fetchReadiness(client)).toEqual({ kind: 'unreachable' });
  });

  it('rethrows when the caller aborted the request', async () => {
    const controller = new AbortController();
    const client = clientReturning(() => {
      controller.abort();
      throw new DOMException('Aborted', 'AbortError');
    });

    await expect(fetchReadiness(client, { signal: controller.signal })).rejects.toThrow();
  });
});

describe('isReadinessBody', () => {
  it.each([
    [{ checks: { database: 'ok', postgis: 'fail' } }, true],
    [{ checks: { database: 'ok' } }, false],
    [{ checks: { database: 'yes', postgis: 'ok' } }, false],
    [{ checks: null }, false],
    ['<html>', false],
    [null, false],
  ])('%j -> %s', (value, expected) => {
    expect(isReadinessBody(value)).toBe(expected);
  });
});
