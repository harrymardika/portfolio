import { expect, test } from '@playwright/test';

test('English is served at / and Indonesian at /id/', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');

  await page.goto('/id/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'id-ID');
});

test('every page declares hreflang alternates for both locales', async ({ page }) => {
  for (const path of ['/', '/id/']) {
    await page.goto(path);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', /\/$/);
    await expect(page.locator('link[rel="alternate"][hreflang="id"]')).toHaveAttribute('href', /\/id\/$/);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
  }
});

test('the language switch moves between locales and marks the current one', async ({ page }) => {
  await page.goto('/');
  await page.locator('a[hreflang="id"]').click();
  await expect(page).toHaveURL(/\/id\/$/);
  await expect(page.locator('a[hreflang="id"]')).toHaveAttribute('aria-current', 'true');

  await page.locator('a[hreflang="en"]').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
});
