import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the About page lists every section in order', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.getByRole('heading', { level: 1, name: 'About me' })).toBeVisible();
  const sections = await page.locator('main h2').allTextContents();
  expect(sections).toEqual([
    'Experience',
    'Leadership & teaching',
    'Education',
    'Training',
    'Awards',
    'Certifications',
    'Skills',
  ]);
});

test('experience is newest first and ongoing roles say Present', async ({ page }) => {
  await page.goto('/about/');
  const first = page.locator('#experience li').first();
  await expect(first.getByRole('heading', { level: 3 })).toHaveText('Founder & CEO');
  await expect(first).toContainText('Present');
});

test('phrases marked **bold** in content render as bold text, without asterisks', async ({ page }) => {
  for (const path of ['/about/', '/id/about/']) {
    await page.goto(path);
    expect(await page.locator('main li strong').count()).toBeGreaterThan(5);
    await expect(page.locator('main header p strong').first()).toBeVisible();
    expect(await page.locator('main').innerText()).not.toContain('**');
  }
});

test('expired certifications are hidden and active ones shown', async ({ page }) => {
  await page.goto('/about/');
  const certs = page.locator('#certifications');
  await expect(certs).toContainText('Alibaba Cloud Certified Associate');
  await expect(certs).not.toContainText('Azure AI Engineer');
});

test('Indonesian page shows translated headings, highlights, and skills', async ({ page }) => {
  await page.goto('/id/about/');
  await expect(page.getByRole('heading', { level: 1, name: 'Tentang saya' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Pengalaman' })).toBeVisible();
  await expect(page.locator('#experience')).toContainText('Memimpin pengembangan Decklify');
  await expect(page.locator('#experience')).toContainText('Sekarang');
  await expect(page.locator('#skills')).toContainText('Bahasa Indonesia (penutur asli)');
  // Every highlight is translated now; untranslated ones would be marked lang="en" (see TimelineItem).
  await expect(page.locator('#experience li[lang="en"]')).toHaveCount(0);
});

test('the header links to About', async ({ page, isMobile }) => {
  await page.goto('/');
  // On phones the primary links live in the menu popover (T2.8).
  if (isMobile) await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about\/$/);
});

for (const path of ['/about/', '/id/about/']) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`${path} has no serious accessibility violations (${colorScheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
      const serious = results.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(serious).toEqual([]);
    });
  }
}
