import { render, screen, within } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';

import robots from './app/robots';
import sitemap from './app/sitemap';
import { SiteHeader } from './components/SiteHeader';
import { messages } from './i18n/messages';
import { proxy } from './proxy';

describe('messages', () => {
  const english = Object.keys(messages.en).sort();

  it.each(['mr', 'hi'] as const)('%s defines exactly the English keys', (locale) => {
    expect(Object.keys(messages[locale]).sort()).toEqual(english);
  });

  it.each(['en', 'mr', 'hi'] as const)('%s has no empty strings', (locale) => {
    for (const [key, value] of Object.entries(messages[locale])) {
      expect(value.trim(), `${locale}.${key}`).not.toBe('');
    }
  });

  it.each(['mr', 'hi'] as const)('%s is translated (Devanagari)', (locale) => {
    expect(messages[locale].homeHeading).toMatch(/[ऀ-ॿ]/);
    expect(messages[locale].metaDescription).toMatch(/[ऀ-ॿ]/);
  });

  it.each(['en', 'mr', 'hi'] as const)(
    '%s meta description fits search snippets (<= 160 chars)',
    (locale) => {
      expect(messages[locale].metaDescription.length).toBeLessThanOrEqual(160);
    },
  );
});

describe('SiteHeader', () => {
  it('links every language by native name, marking the current one', () => {
    render(<SiteHeader locale="mr" />);

    const nav = screen.getByRole('navigation', { name: 'भाषा' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((l) => l.textContent)).toEqual(['मराठी', 'English', 'हिन्दी']);
    expect(links.map((l) => l.getAttribute('href'))).toEqual(['/mr', '/en', '/hi']);
    expect(links.map((l) => l.getAttribute('hreflang'))).toEqual(['mr-IN', 'en-IN', 'hi-IN']);
    expect(links[0]).toHaveAttribute('aria-current', 'page');
    expect(links[1]).not.toHaveAttribute('aria-current');
  });

  it('has no axe violations', async () => {
    const { container } = render(<SiteHeader locale="en" />);
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('root redirect (proxy)', () => {
  function redirectFor(acceptLanguage: string | null) {
    const headers = new Headers();
    if (acceptLanguage !== null) headers.set('accept-language', acceptLanguage);
    const request = { headers, url: 'https://konkan.example/' };
    return proxy(request as unknown as Parameters<typeof proxy>[0]);
  }

  it.each([
    ['mr-IN,mr;q=0.9,en;q=0.8', '/mr'],
    ['en-US;q=0.4, hi;q=0.9', '/hi'],
    ['fr-FR', '/en'],
    [null, '/en'],
  ])('Accept-Language %j -> %s', (header, path) => {
    const response = redirectFor(header);

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get('location')!).pathname).toBe(path);
    expect(response.headers.get('vary')).toBe('Accept-Language');
  });
});

describe('robots and sitemap', () => {
  it('robots allows crawling and points at the sitemap', () => {
    expect(robots()).toEqual({
      rules: [{ userAgent: '*', allow: '/' }],
      sitemap: 'http://127.0.0.1:3000/sitemap.xml',
    });
  });

  it('sitemap lists each locale home with hreflang alternates', () => {
    const entries = sitemap();

    expect(entries.map((e) => e.url)).toEqual([
      'http://127.0.0.1:3000/mr',
      'http://127.0.0.1:3000/en',
      'http://127.0.0.1:3000/hi',
    ]);
    expect(entries[0]!.alternates?.languages).toMatchObject({
      'en-IN': 'http://127.0.0.1:3000/en',
      'x-default': 'http://127.0.0.1:3000/en',
    });
  });
});
