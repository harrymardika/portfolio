/**
 * The main journeys with a keyboard only (T7.4): navigation, language, theme, journey stories,
 * the mobile menu, and the CV download. The skip link is covered in layout.spec.ts.
 */
import { expect, test, type Locator, type Page } from '@playwright/test';

/** Press Tab until `target` has focus; fails if it is not reachable in `max` steps. */
async function tabTo(page: Page, target: Locator, max = 40): Promise<void> {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error(`Not reachable with Tab in ${max} steps: ${target.toString()}`);
}

const outline = (locator: Locator) => locator.evaluate((element) => getComputedStyle(element).outlineStyle);

test.describe('desktop keyboard', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'Phones use touch; the mobile menu is tested below');
  });

  test('Tab reaches the main navigation with a visible focus ring, and Enter follows it', async ({
    page,
  }) => {
    await page.goto('/');
    const about = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'About' });
    await tabTo(page, about);
    expect(await outline(about)).not.toBe('none');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/about\/$/);
  });

  test('the language switch and the theme toggle work from the keyboard', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('[data-theme-toggle]');
    await tabTo(page, toggle);
    const before = await toggle.getAttribute('aria-pressed');
    await page.keyboard.press('Space');
    await expect(toggle).not.toHaveAttribute('aria-pressed', before ?? '');

    await tabTo(page, page.locator('a[hreflang="id"]'));
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/id\/$/);
  });

  test('a journey story opens with Enter and Escape returns focus to its button', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: /Founder.*Read the story/ });
    await button.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Founder' });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('the CV downloads from the keyboard', async ({ page }) => {
    await page.goto('/id/');
    const link = page.getByRole('link', { name: 'Unduh CV' });
    await tabTo(page, link);
    const [download] = await Promise.all([page.waitForEvent('download'), page.keyboard.press('Enter')]);
    expect(download.suggestedFilename()).toBe('Harry-Mardika-CV-ID.pdf');
  });
});

test.describe('mobile menu with a keyboard', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens with Enter, lets Tab into its links, and closes with Escape', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Menu' });
    await button.focus();
    await page.keyboard.press('Enter');
    const menu = page.locator('#mobile-menu');
    await expect(menu).toBeVisible();

    await page.keyboard.press('Tab');
    expect(await menu.evaluate((element) => element.contains(document.activeElement))).toBe(true);

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(button).toBeFocused();
  });
});
