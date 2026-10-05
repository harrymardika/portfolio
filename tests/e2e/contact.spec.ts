import { expect, test } from '@playwright/test';

test('the contact section lists email first, then the social profiles', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#contact');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText("Let's talk.");
  const links = section.locator('li a');
  await expect(links).toHaveText(['Email', 'LinkedIn', 'Instagram', 'GitHub']);
  await expect(links.first()).toHaveAttribute('href', 'mailto:harrymardika48@gmail.com');
  await expect(section.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
    'href',
    'https://www.instagram.com/harry.mrdk/',
  );
  await expect(section).not.toContainText(/(\+?62|\b08)[\d\s-]{8,}/);
});

test('the copy button copies the email address', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Clipboard permissions are Chromium-only in Playwright');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Copy email address' });
  await button.click();
  await expect(button).toHaveText('Copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('harrymardika48@gmail.com');
});

test('the section is translated on /id/', async ({ page }) => {
  await page.goto('/id/');
  await expect(page.locator('#contact').getByRole('heading', { level: 2 })).toHaveText('Mari ngobrol.');
  await expect(page.getByRole('button', { name: 'Salin alamat email' })).toBeVisible();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('hides the copy button but keeps the email link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-copy]')).toBeHidden();
    await expect(page.locator('#contact').getByRole('link', { name: 'Email' })).toBeVisible();
  });
});
