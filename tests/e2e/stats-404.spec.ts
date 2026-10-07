import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the footer links to the statistics page, which is not in the main menu', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('banner').getByRole('link', { name: 'Site statistics' })).toHaveCount(0);
  await page.getByRole('contentinfo').getByRole('link', { name: 'Site statistics' }).click();
  await expect(page).toHaveURL(/\/stats\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Site statistics' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Site statistics' })).toBeVisible();
});

test('the statistics page is translated', async ({ page }) => {
  await page.goto('/id/');
  await page.getByRole('contentinfo').getByRole('link', { name: 'Statistik situs' }).click();
  await expect(page).toHaveURL(/\/id\/stats\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Statistik situs' })).toBeVisible();
});

test('the old homelab page is gone', async ({ page }) => {
  const response = await page.goto('/homelab/');
  expect(response?.status()).toBe(404);
});

test('unknown URLs get a bilingual 404 with links to both home pages', async ({ page }) => {
  const response = await page.goto('/id/tidak-ada/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  await expect(page.getByRole('heading', { level: 2, name: 'Halaman tidak ditemukan' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to the home page' })).toHaveAttribute('href', '/');
  await expect(page.getByRole('link', { name: 'Kembali ke beranda' })).toHaveAttribute('href', '/id/');
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);
});

for (const path of ['/stats/', '/id/stats/', '/missing/']) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
    const serious = results.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
    expect(serious).toEqual([]);
  });
}

test('the server status shows online when the home server answers', async ({ page }) => {
  await page.route('**/api/health', (route) => route.fulfill({ json: { ok: true } }));
  await page.goto('/stats/');
  const badge = page.locator('[data-server-status]');
  await expect(badge).toHaveAttribute('data-server-status', 'online');
  await expect(badge).toContainText('Online, served from my home server');
});

test('the server status explains the cached copy when the home server is down', async ({ page }) => {
  await page.route('**/api/health', (route) => route.abort('connectionrefused'));
  await page.goto('/id/stats/');
  const badge = page.locator('[data-server-status]');
  await expect(badge).toHaveAttribute('data-server-status', 'offline');
  await expect(badge).toContainText('salinan yang disimpan Cloudflare');
});
