import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the homelab page explains the pipeline and stack', async ({ page }) => {
  await page.goto('/homelab/');
  await expect(page.getByRole('heading', { level: 1, name: 'Homelab' })).toBeVisible();
  await expect(page.locator('ol > li')).toHaveCount(4);
  await expect(page.getByRole('heading', { level: 3, name: 'Through a Cloudflare Tunnel' })).toBeVisible();
  await expect(page.getByText('Cloudflare Tunnel', { exact: true })).toBeVisible();
  // Hidden until the owner adds real specs to content/homelab.yaml.
  await expect(page.locator('#hardware-title')).toHaveCount(0);
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
