/**
 * "CVs by role" (T10.2, D10): the footer links to /cv/, which lists every CV variant PDF in both
 * languages. The variants come from content/cv-variants.yaml, never a hard-coded list.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { UI } from '../../src/lib/i18n/ui';
import { cvVariants } from './helpers';

test('the footer links to the CVs by role, in the page language', async ({ page }) => {
  for (const [path, locale, target] of [
    ['/', 'en', /\/cv\/$/],
    ['/id/', 'id', /\/id\/cv\/$/],
  ] as const) {
    await page.goto(path);
    await page.getByRole('contentinfo').getByRole('link', { name: UI[locale]['cvVariants.title'] }).click();
    await expect(page).toHaveURL(target);
    await expect(page.getByRole('heading', { level: 1, name: UI[locale]['cvVariants.title'] })).toBeVisible();
  }
});

test('the page lists every variant with working, counted PDF links, and stays out of search', async ({
  page,
  request,
}) => {
  await page.goto('/cv/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  const links = page.locator('main table a');
  await expect(links).toHaveCount(cvVariants().length * 2);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('data-download', 'cv');
    const href = (await link.getAttribute('href')) ?? '';
    expect(href).toMatch(/^\/downloads\/cv\/.+\.pdf$/);
    expect((await request.head(href)).status()).toBe(200);
  }
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /downloads/cv/');
});

for (const colorScheme of ['light', 'dark'] as const) {
  test(`/cv/ has no serious accessibility violations (${colorScheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto('/cv/');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
    const serious = results.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
    expect(serious).toEqual([]);
  });
}
