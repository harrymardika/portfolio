import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the homelab page explains the pipeline and stack', async ({ page }) => {
  await page.goto('/homelab/');
  await expect(page.getByRole('heading', { level: 1, name: 'Homelab' })).toBeVisible();
  await expect(page.locator('section[aria-labelledby="pipeline-title"] ol > li')).toHaveCount(4);
  await expect(page.getByRole('heading', { level: 3, name: 'Through a Cloudflare Tunnel' })).toBeVisible();
  await expect(page.getByText('Cloudflare Tunnel', { exact: true })).toBeVisible();
  // Real specs from content/homelab.yaml (read from the server).
  const hardware = page.locator('section[aria-labelledby="hardware-title"]');
  await expect(hardware.getByRole('heading', { level: 2, name: 'The server' })).toBeVisible();
  await expect(hardware).toContainText('Intel Celeron N3050');
  await expect(hardware).toContainText('Debian 13 (trixie)');
});

test('the homelab page is translated', async ({ page }) => {
  await page.goto('/id/homelab/');
  await expect(
    page.getByRole('heading', { level: 2, name: 'Dari git push sampai ke browser Anda' }),
  ).toBeVisible();
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

for (const path of ['/homelab/', '/id/homelab/', '/missing/']) {
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
  await page.goto('/homelab/');
  const badge = page.locator('[data-server-status]');
  await expect(badge).toHaveAttribute('data-server-status', 'online');
  await expect(badge).toContainText('Online, served from my home server');
});

test('the server status explains the cached copy when the home server is down', async ({ page }) => {
  await page.route('**/api/health', (route) => route.abort('connectionrefused'));
  await page.goto('/id/homelab/');
  const badge = page.locator('[data-server-status]');
  await expect(badge).toHaveAttribute('data-server-status', 'offline');
  await expect(badge).toContainText('salinan yang disimpan Cloudflare');
});
