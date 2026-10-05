import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const SUMMARY = {
  generatedAt: '2026-10-05T12:00:00.000Z',
  since: '2026-10-01',
  visitors: { total: 1234, last30Days: 456 },
  pageviews: { total: 5678, last30Days: 910 },
  downloads: { cv: 42, portfolio: 7 },
  topPages: [
    { key: '/', count: 300 },
    { key: '/projects/', count: 120 },
  ],
  topReferrers: [{ key: 'linkedin.com', count: 80 }],
  topCountries: [
    { key: 'ID', count: 200 },
    { key: 'US', count: 12 },
  ],
};

const stats = '[data-site-stats]';

test('shows live numbers formatted for the language', async ({ page }) => {
  await page.route('**/api/stats/summary', (route) => route.fulfill({ json: SUMMARY }));
  await page.goto('/homelab/');
  await expect(page.locator(`${stats} [data-stat="visitors"]`)).toHaveText('1,234');
  await expect(page.locator(`${stats} [data-stat-detail="visitors"]`)).toHaveText('456 · last 30 days');
  await expect(page.locator(`${stats} [data-stat="cv"]`)).toHaveText('42');
  await expect(page.locator(`${stats} [data-stat-list="topReferrers"]`)).toContainText('linkedin.com');
  await expect(page.locator(`${stats} [data-stat-list="topCountries"] li`).first()).toContainText(
    'Indonesia',
  );
  await expect(page.locator(`${stats} [data-stat-status]`)).toHaveText('Counting since Oct 2026');
  await expect(page.locator(stats)).toHaveAttribute('aria-busy', 'false');

  await page.goto('/id/homelab/');
  await expect(page.locator(`${stats} [data-stat="visitors"]`)).toHaveText('1.234');
  await expect(page.locator(`${stats} [data-stat-list="topCountries"]`)).toContainText('Amerika Serikat');
});

test('says the numbers are unavailable when the service is down, and the page still works', async ({
  page,
}) => {
  await page.route('**/api/stats/summary', (route) => route.fulfill({ status: 502, body: 'Bad gateway' }));
  await page.goto('/homelab/');
  await expect(page.locator(`${stats} [data-stat-status]`)).toHaveText(
    'Statistics are temporarily unavailable.',
  );
  await expect(page.locator(`${stats} [data-stat="visitors"]`)).toHaveText('—');
  await expect(page.getByRole('heading', { level: 1, name: 'Homelab' })).toBeVisible();
});

test('rejects a malformed response instead of showing garbage', async ({ page }) => {
  await page.route('**/api/stats/summary', (route) =>
    route.fulfill({ json: { visitors: '<img src=x onerror=alert(1)>' } }),
  );
  await page.goto('/homelab/');
  await expect(page.locator(`${stats} [data-stat-status]`)).toHaveText(
    'Statistics are temporarily unavailable.',
  );
  await expect(page.locator(`${stats} img`)).toHaveCount(0);
});

test('shows an empty state for lists without data', async ({ page }) => {
  await page.route('**/api/stats/summary', (route) =>
    route.fulfill({ json: { ...SUMMARY, topReferrers: [], since: null } }),
  );
  await page.goto('/homelab/');
  await expect(page.locator(`${stats} [data-stat-list="topReferrers"]`)).toHaveText('No data yet.');
});

test('the statistics section has no serious accessibility violations', async ({ page }) => {
  await page.route('**/api/stats/summary', (route) => route.fulfill({ json: SUMMARY }));
  await page.goto('/homelab/');
  await expect(page.locator(stats)).toHaveAttribute('aria-busy', 'false');
  const results = await new AxeBuilder({ page })
    .include(stats)
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(
    results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id),
  ).toEqual([]);
});
