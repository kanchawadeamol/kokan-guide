import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import { createApiClient, normalizeBaseUrl } from './client';
import type { Schema } from './index';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockFetch(response: () => Response) {
  const calls: Request[] = [];
  const fetch = vi.fn((input: Request) => {
    calls.push(input);
    return Promise.resolve(response());
  });
  return { fetch: fetch as unknown as typeof globalThis.fetch, calls };
}

describe('createApiClient', () => {
  it('calls the versioned endpoint and returns typed data', async () => {
    const { fetch, calls } = mockFetch(() => jsonResponse({ status: 'ok', version: '0.1.0' }));
    const client = createApiClient({ baseUrl: 'http://127.0.0.1:8000', fetch });

    const { data, error } = await client.GET('/api/v1/health');

    expect(error).toBeUndefined();
    expect(data).toEqual({ status: 'ok', version: '0.1.0' });
    expect(calls[0]!.url).toBe('http://127.0.0.1:8000/api/v1/health');
    expect(calls[0]!.headers.get('Accept')).toBe('application/json');
    expectTypeOf(data).toEqualTypeOf<Schema<'HealthResponse'> | undefined>();
  });

  it('exposes error bodies for non-2xx responses', async () => {
    const unavailable = { status: 'unavailable', checks: { database: 'fail', postgis: 'fail' } };
    const { fetch } = mockFetch(() => jsonResponse(unavailable, 503));
    const client = createApiClient({ baseUrl: 'http://127.0.0.1:8000', fetch });

    const { data, error, response } = await client.GET('/api/v1/health/ready');

    expect(response.status).toBe(503);
    expect(data).toBeUndefined();
    expect(error).toEqual(unavailable);
  });

  it('sends Accept-Language from a fixed or dynamic locale', async () => {
    const { fetch, calls } = mockFetch(() => jsonResponse({}));
    let current: 'mr' | 'hi' = 'mr';
    const client = createApiClient({ baseUrl: 'http://api.test', fetch, locale: () => current });

    await client.GET('/api/v1/health');
    current = 'hi';
    await client.GET('/api/v1/health');

    expect(calls.map((r) => r.headers.get('Accept-Language'))).toEqual(['mr', 'hi']);
  });

  it('adds a bearer token only when one is available', async () => {
    const { fetch, calls } = mockFetch(() => jsonResponse({}));
    const tokens: (string | null)[] = ['abc.def', null];
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetch,
      getAccessToken: () => Promise.resolve(tokens.shift() ?? null),
    });

    await client.GET('/api/v1/health');
    await client.GET('/api/v1/health');

    expect(calls[0]!.headers.get('Authorization')).toBe('Bearer abc.def');
    expect(calls[1]!.headers.has('Authorization')).toBe(false);
  });

  it('sends no locale or auth headers when not configured', async () => {
    const { fetch, calls } = mockFetch(() => jsonResponse({}));
    const client = createApiClient({ baseUrl: 'http://api.test', fetch });

    await client.GET('/api/v1/health');

    expect(calls[0]!.headers.has('Accept-Language')).toBe(false);
    expect(calls[0]!.headers.has('Authorization')).toBe(false);
  });
});

describe('normalizeBaseUrl', () => {
  it.each([
    ['https://api.example.com', 'https://api.example.com'],
    ['https://api.example.com/', 'https://api.example.com'],
    ['http://127.0.0.1:8000', 'http://127.0.0.1:8000'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizeBaseUrl(input)).toBe(expected);
  });

  it.each([
    ['relative', '/api'],
    ['empty', ''],
    ['non-http scheme', 'ftp://api.example.com'],
    ['javascript scheme', 'javascript:alert(1)'],
    ['embedded credentials', 'https://user:pass@api.example.com'],
    ['path (would double /api/v1)', 'https://api.example.com/api/v1'],
    ['query string', 'https://api.example.com?x=1'],
  ])('rejects %s', (_case, input) => {
    expect(() => normalizeBaseUrl(input)).toThrow(TypeError);
  });
});
