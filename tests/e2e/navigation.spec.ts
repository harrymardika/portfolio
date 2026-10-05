import { expect, test } from '@playwright/test';

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens, navigates, and marks the current page', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Menu' });
    await expect(button).toBeVisible();
    await button.click();
    const menu = page.locator('#mobile-menu');
    await expect(menu).toBeVisible();
    await menu.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about\/$/);

    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.locator('#mobile-menu').getByRole('link', { name: 'About' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('closes with Escape', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.locator('#mobile-menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-menu')).toBeHidden();
  });

  test('is translated on Indonesian pages', async ({ page }) => {
    await page.goto('/id/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.locator('#mobile-menu').getByRole('link', { name: 'Proyek' })).toHaveAttribute(
      'href',
      '/id/projects/',
    );
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('still opens', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Menu' }).click();
      await expect(page.locator('#mobile-menu').getByRole('link', { name: 'Projects' })).toBeVisible();
    });
  });
});

test.describe('desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('shows the inline navigation instead of the menu button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
    await expect(page.getByRole('navigation', { name: 'Main' }).first()).toBeVisible();
  });
});
