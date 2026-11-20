import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const READY = { status: 'ready', checks: { database: 'ok', postgis: 'ok' } };
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function mockReadiness(page: Page, body: unknown = READY, status = 200) {
  await page.route('**/api/v1/health/ready', (route) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) }),
  );
}

test.describe('admin shell', () => {
  test('loads the dashboard with API status', async ({ page }) => {
    await mockReadiness(page);
    await page.goto('/');

    await expect(page).toHaveTitle('Konkan Discovery Admin');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dashboard');
    await expect(page.getByRole('status')).toHaveText(/API is available/);
  });

  test('shows unreachable state when the API is down, and recovers', async ({ page }) => {
    let up = false;
    await page.route('**/api/v1/health/ready', (route) =>
      up
        ? route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(READY),
          })
        : route.abort('connectionrefused'),
    );
    await page.goto('/');
    await expect(page.getByRole('status')).toHaveText(/Cannot reach the API/);

    up = true;
    await page.getByRole('button', { name: 'Check again' }).click();
    await expect(page.getByRole('status')).toHaveText(/API is available/);
  });

  test('skip link is the first tab stop and moves focus to main content', async ({ page }) => {
    await mockReadiness(page);
    await page.goto('/');
    await expect(page.getByRole('status')).toHaveText(/API is available/);

    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();

    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
  });

  test('switching language updates text and <html lang>', async ({ page }) => {
    await mockReadiness(page);
    await page.goto('/');

    await page.getByRole('combobox', { name: 'Language' }).selectOption('mr');

    await expect(page.locator('html')).toHaveAttribute('lang', 'mr-IN');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('डॅशबोर्ड');
    await expect(page.getByRole('status')).toHaveText(/API उपलब्ध आहे/);
  });

  test('has no horizontal scrolling at its viewport width', async ({ page }) => {
    await mockReadiness(page);
    await page.goto('/');
    await expect(page.getByRole('status')).toHaveText(/API is available/);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('accessibility (axe, WCAG 2.2 AA)', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    for (const locale of ['en', 'mr', 'hi'] as const) {
      test(`no violations: ${colorScheme} theme, ${locale}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await mockReadiness(
          page,
          {
            status: 'unavailable',
            checks: { database: 'ok', postgis: 'fail' },
          },
          503,
        );
        await page.goto('/');
        if (locale !== 'en') {
          await page.getByRole('combobox', { name: 'Language' }).selectOption(locale);
        }
        await expect(page.getByRole('status')).not.toHaveText(/Checking|तपासत|जाँची/);

        const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }

  test('text remains usable at 200% zoom', async ({ page }) => {
    await mockReadiness(page);
    await page.goto('/');
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Check again' })).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
});
