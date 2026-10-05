import { expect, test, type Page } from '@playwright/test';

const bodyBackground = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

// Token values from src/styles/tokens.css (--sage), as computed RGB.
const LIGHT_BG = 'rgb(238, 243, 239)';
const DARK_BG = 'rgb(17, 26, 23)';

test('follows the OS dark preference when no theme was chosen', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  expect(await bodyBackground(page)).toBe(DARK_BG);
});

test('the toggle switches theme and the choice survives a reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  expect(await bodyBackground(page)).toBe(LIGHT_BG);

  const toggle = page.locator('[data-theme-toggle]');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');

  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  expect(await bodyBackground(page)).toBe(DARK_BG);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await bodyBackground(page)).toBe(DARK_BG);
});

test('the toggle label is translated', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/id/');
  await expect(page.locator('[data-theme-toggle]')).toHaveAttribute('aria-label', 'Ganti ke tema gelap');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the page still renders and the toggle stays hidden', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('[data-theme-toggle]')).toBeHidden();
  });
});
