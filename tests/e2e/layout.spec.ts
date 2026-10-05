import { expect, test } from '@playwright/test';

test('the first Tab focuses the skip link, which moves focus to the main content', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Keyboard navigation is a desktop concern');
  await page.goto('/');

  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();

  await page.keyboard.press('Enter');
  await expect(page.locator('main#main')).toBeFocused();
});

test('every page has exactly one banner, main, and contentinfo landmark', async ({ page }) => {
  for (const path of ['/', '/id/']) {
    await page.goto(path);
    await expect(page.getByRole('banner')).toHaveCount(1);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('contentinfo')).toHaveCount(1);
  }
});

test('the footer links to every social profile from profile.yaml', async ({ page }) => {
  await page.goto('/');
  const footer = page.getByRole('contentinfo');

  await expect(footer.getByRole('link', { name: /^LinkedIn/ })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/harry-mardika/',
  );
  await expect(footer.getByRole('link', { name: /^Instagram/ })).toHaveAttribute(
    'href',
    'https://www.instagram.com/harry.mrdk/',
  );
  await expect(footer.getByRole('link', { name: /^GitHub/ })).toHaveAttribute(
    'href',
    'https://github.com/harrymardika',
  );
  await expect(footer.getByRole('link', { name: /^Email/ })).toHaveAttribute('href', /^mailto:/);
});

test('the skip link and footer are translated on Indonesian pages', async ({ page }) => {
  await page.goto('/id/');
  await expect(page.getByRole('link', { name: 'Lewati ke konten' })).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Temukan saya di' })).toHaveCount(1);
});

test('no page shows a phone number', async ({ page }) => {
  for (const path of ['/', '/id/']) {
    await page.goto(path);
    expect(await page.content()).not.toMatch(/(\+?62|\b08)[\d\s-]{8,}/);
  }
});
