import { render, screen, within } from '@testing-library/react';
import axe from 'axe-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CategoryPage from './app/[locale]/category/[slug]/page';
import ListingPage from './app/[locale]/listing/[slug]/page';
import HomePage from './app/[locale]/page';
import SearchPage from './app/[locale]/search/page';
import robots from './app/robots';
import sitemap from './app/sitemap';
import { localizedPath } from './components/LanguageLinks';
import { SiteHeader } from './components/SiteHeader';
import { format, listingsLabel, messages } from './i18n/messages';
import { proxy } from './proxy';

import type * as Navigation from 'next/navigation';

const navigation = vi.hoisted(() => ({ pathname: '/mr' }));
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof Navigation>()),
  usePathname: () => navigation.pathname,
}));

beforeEach(() => {
  navigation.pathname = '/mr';
});

async function axeViolations(container: Element) {
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
  return results.violations;
}

const params = <T extends Record<string, string>>(value: T) => ({ params: Promise.resolve(value) });

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

  it('keeps the visitor on the same page when switching language', () => {
    navigation.pathname = '/en/category/hotels';
    render(<SiteHeader locale="en" />);

    const links = within(screen.getByRole('navigation', { name: 'Language' })).getAllByRole('link');
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '/mr/category/hotels',
      '/en/category/hotels',
      '/hi/category/hotels',
    ]);
  });

  it('has no axe violations', async () => {
    const { container } = render(<SiteHeader locale="en" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('localizedPath', () => {
  it.each([
    ['/en', 'mr', '/mr'],
    ['/en/listing/kolaba-fort', 'hi', '/hi/listing/kolaba-fort'],
    ['/', 'en', '/en'],
  ] as const)('%s -> %s = %s', (path, locale, expected) => {
    expect(localizedPath(path, locale)).toBe(expected);
  });
});

describe('listingsLabel', () => {
  it.each([
    ['en', 'en-IN', 1, '1 listing'],
    ['en', 'en-IN', 2, '2 listings'],
    ['mr', 'mr-IN', 1, '1 नोंद'],
    ['mr', 'mr-IN', 3, '3 नोंदी'],
  ] as const)('%s %i', (locale, bcp47, count, expected) => {
    expect(listingsLabel(messages[locale], bcp47, count)).toBe(expected);
  });
});

describe('format', () => {
  it('fills placeholders and leaves unknown ones', () => {
    expect(format('{count} results for “{query}”', { count: 2, query: 'x' })).toBe(
      '2 results for “x”',
    );
    expect(format('{missing}', {})).toBe('{missing}');
  });
});

describe('sample pages', () => {
  it('home shows search, sample notice, all 14 categories and popular places', async () => {
    const { container } = render(await HomePage(params({ locale: 'en' })));

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Discover the Konkan coast',
    );
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(/Sample data/);
    const categories = screen.getByRole('heading', { name: 'Browse by category' }).parentElement!;
    expect(within(categories).getAllByRole('link')).toHaveLength(14);
    expect(screen.getByRole('link', { name: 'Kolaba Fort' })).toHaveAttribute(
      'href',
      '/en/listing/kolaba-fort',
    );
    expect(await axeViolations(container)).toEqual([]);
  });

  it('category page lists its listings in Marathi', async () => {
    const { container } = render(await CategoryPage(params({ locale: 'mr', slug: 'forts' })));

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('किल्ले');
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'कुलाबा किल्ला' })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('emergency category explains that official numbers come later', async () => {
    render(await CategoryPage(params({ locale: 'en', slug: 'emergency-contacts' })));

    expect(screen.getByText(/verified government sources/)).toBeInTheDocument();
    expect(screen.getByText('No sample listings in this category yet.')).toBeInTheDocument();
  });

  it('business page shows hours, placeholder phone and disabled actions', async () => {
    const { container } = render(
      await ListingPage(params({ locale: 'en', slug: 'sample-family-clinic-dapoli' })),
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Family Clinic (Sample)');
    expect(screen.getByText('+91 00000 00003')).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Sunday' }).nextElementSibling).toHaveTextContent(
      'Closed',
    );
    const call = screen.getByRole('button', { name: 'Call' });
    expect(call).toHaveAttribute('aria-disabled', 'true');
    expect(call).toHaveAccessibleDescription('Disabled for sample data');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('landmark page never shows invented phone numbers or hours', async () => {
    render(await ListingPage(params({ locale: 'en', slug: 'murud-janjira-fort' })));

    expect(screen.getByText('No contact details for this place.')).toBeInTheDocument();
    expect(screen.getByText('Opening hours not available')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Call/ })).not.toBeInTheDocument();
  });

  it('search page shows results and announces the count', async () => {
    render(
      await SearchPage({
        params: Promise.resolve({ locale: 'en' }),
        searchParams: Promise.resolve({ q: 'beach' }),
      }),
    );

    expect(screen.getByRole('status')).toHaveTextContent(/results for “beach”/);
    expect(screen.getByRole('link', { name: 'Kashid Beach' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toHaveValue('beach');
  });

  it('search page handles no query and no results', async () => {
    const empty = render(
      await SearchPage({
        params: Promise.resolve({ locale: 'en' }),
        searchParams: Promise.resolve({}),
      }),
    );
    expect(screen.getByRole('status')).toHaveTextContent('Type a place or service to search.');
    empty.unmount();

    render(
      await SearchPage({
        params: Promise.resolve({ locale: 'en' }),
        searchParams: Promise.resolve({ q: 'zzzz' }),
      }),
    );
    expect(screen.getByRole('status')).toHaveTextContent('No results for “zzzz”');
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
