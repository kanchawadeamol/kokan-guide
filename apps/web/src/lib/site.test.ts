import { describe, expect, it } from 'vitest';

import { buildAlternates, getSiteUrl, localeUrl } from './site';

const env = (vars: Record<string, string>) => vars as unknown as NodeJS.ProcessEnv;

describe('getSiteUrl', () => {
  it('uses SITE_URL normalised to its origin', () => {
    expect(getSiteUrl(env({ SITE_URL: ' https://konkan.example/ ' })).toString()).toBe(
      'https://konkan.example/',
    );
  });

  it('falls back to the local dev server outside production', () => {
    expect(getSiteUrl(env({ NODE_ENV: 'development' })).toString()).toBe('http://127.0.0.1:3000/');
  });

  it('is required in production builds', () => {
    expect(() => getSiteUrl(env({ NODE_ENV: 'production' }))).toThrow(/SITE_URL must be set/);
  });

  it.each([
    ['relative', '/site'],
    ['non-http', 'ftp://konkan.example'],
    ['path', 'https://konkan.example/en'],
    ['query', 'https://konkan.example/?a=1'],
    ['credentials', 'https://user:pw@konkan.example'],
  ])('rejects %s URLs', (_case, value) => {
    expect(() => getSiteUrl(env({ SITE_URL: value }))).toThrow(/SITE_URL/);
  });
});

describe('localeUrl', () => {
  const site = new URL('https://konkan.example');

  it.each([
    ['', 'https://konkan.example/mr'],
    ['/', 'https://konkan.example/mr'],
    ['/places', 'https://konkan.example/mr/places'],
    ['places', 'https://konkan.example/mr/places'],
  ])('path %j -> %s', (path, expected) => {
    expect(localeUrl(site, 'mr', path)).toBe(expected);
  });
});

describe('buildAlternates', () => {
  it('gives a self-referencing canonical and hreflang for every locale plus x-default', () => {
    const result = buildAlternates(new URL('https://konkan.example'), 'hi', '/places');

    expect(result.canonical).toBe('https://konkan.example/hi/places');
    expect(result.languages).toEqual({
      'mr-IN': 'https://konkan.example/mr/places',
      'en-IN': 'https://konkan.example/en/places',
      'hi-IN': 'https://konkan.example/hi/places',
      'x-default': 'https://konkan.example/en/places',
    });
  });
});
