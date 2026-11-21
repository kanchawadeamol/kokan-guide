import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const LOCALES = [
  { code: 'en', lang: 'en-IN', heading: 'Discover the Konkan coast' },
  { code: 'mr', lang: 'mr-IN', heading: 'कोकण किनारपट्टी शोधा' },
  { code: 'hi', lang: 'hi-IN', heading: 'कोंकण तट की खोज करें' },
] as const;

test.describe('locale routing', () => {
  for (const [header, expected] of [
    ['mr-IN,mr;q=0.9,en;q=0.8', '/mr'],
    ['en-GB;q=0.3, hi;q=0.9', '/hi'],
    ['fr-FR', '/en'],
  ] as const) {
    test(`/ redirects to ${expected} for Accept-Language "${header}"`, async ({ request }) => {
      const response = await request.get('/', {
        headers: { 'Accept-Language': header },
        maxRedirects: 0,
      });

      expect(response.status()).toBe(307);
      expect(new URL(response.headers().location ?? '', 'http://x').pathname).toBe(expected);
      expect(response.headers().vary).toContain('Accept-Language');
    });
  }

  test('unsupported locale returns 404', async ({ request }) => {
    expect((await request.get('/fr')).status()).toBe(404);
  });
});

test.describe('pages', () => {
  for (const { code, lang, heading } of LOCALES) {
    test(`/${code} renders localized content with correct SEO metadata`, async ({ page }) => {
      const response = await page.goto(`/${code}`);
      expect(response?.status()).toBe(200);

      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `http://127.0.0.1:3100/${code}`,
      );
      for (const alt of ['mr-IN', 'en-IN', 'hi-IN', 'x-default']) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${alt}"]`)).toHaveCount(1);
      }
    });
  }

  test('language links navigate between locales', async ({ page }) => {
    await page.goto('/en');
    await page
      .getByRole('navigation', { name: 'Language' })
      .getByRole('link', { name: 'हिन्दी' })
      .click();

    await expect(page).toHaveURL(/\/hi$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi-IN');
    await expect(
      page.getByRole('navigation', { name: 'भाषा' }).getByRole('link', { name: 'हिन्दी' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('skip link is the first tab stop and moves focus to main', async ({ page }) => {
    await page.goto('/en');
    await page.keyboard.press('Tab');

    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
  });

  test('no horizontal scrolling', async ({ page }) => {
    await page.goto('/mr');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('SEO and security endpoints', () => {
  test('robots.txt and sitemap.xml', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain('Sitemap: http://127.0.0.1:3100/sitemap.xml');

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    for (const code of ['mr', 'en', 'hi']) {
      expect(xml).toContain(`<loc>http://127.0.0.1:3100/${code}</loc>`);
    }
    expect(xml).toContain('hreflang="x-default"');
  });

  test('security headers are set and the framework is not advertised', async ({ request }) => {
    const headers = (await request.get('/en')).headers();

    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toContain('camera=()');
    expect(headers['x-powered-by']).toBeUndefined();
  });
});

test.describe('accessibility (axe, WCAG 2.2 AA)', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    for (const { code } of LOCALES) {
      test(`no violations: ${colorScheme}, ${code}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(`/${code}`);

        const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }

  test('usable at 200% text size', async ({ page }) => {
    await page.goto('/mr');
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
