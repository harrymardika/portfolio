import { expect, test } from '@playwright/test';

for (const [path, headings] of [
  [
    '/print/cv/',
    [
      'Summary',
      'Experience',
      'Leadership & teaching',
      'Education',
      'Training',
      'Awards',
      'Certifications',
      'Skills',
    ],
  ],
  [
    '/id/print/cv/',
    [
      'Ringkasan',
      'Pengalaman',
      'Kepemimpinan & mengajar',
      'Pendidikan',
      'Pelatihan',
      'Penghargaan',
      'Sertifikasi',
      'Keahlian',
    ],
  ],
] as const) {
  test(`${path} is an ATS-friendly CV page`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Harry Mardika');
    expect(await page.locator('h2').allTextContents()).toEqual([...headings]);
    // No photos or charts: ATS parsers only read text.
    await expect(page.locator('img, canvas, svg')).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    expect(await page.content()).not.toMatch(/(\+?62|\b08)[\d\s-]{8,}/);
  });
}

test('the CV always prints in the light theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/print/cv/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('the CV lists contacts as readable text and hides expired certifications', async ({ page }) => {
  await page.goto('/print/cv/');
  const contacts = page.locator('.cv-contacts');
  await expect(contacts).toContainText('harrymardika48@gmail.com');
  await expect(contacts).toContainText('linkedin.com/in/harry-mardika');
  await expect(contacts).toContainText('github.com/harrymardika');
  await expect(page.locator('body')).not.toContainText('Azure AI Engineer');
});

for (const path of ['/print/portfolio/', '/id/print/portfolio/']) {
  test(`${path} has the cover, profile, journey, featured projects, more projects, and contact pages`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Harry Mardika');
    // Cover + profile + journey + 3 featured + more projects + skills/contact.
    await expect(page.locator('.pf-page')).toHaveCount(8);
    await expect(page.getByRole('img', { name: 'Harry Mardika' })).toBeVisible();
    await expect(page.locator('.pf-journey li')).toHaveCount(5);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    expect(await page.content()).not.toMatch(/(\+?62|\b08)[\d\s-]{8,}/);
  });
}

test('the portfolio lists every non-featured project on the "more projects" page', async ({ page }) => {
  await page.goto('/print/portfolio/');
  // e2e fixture: 4 non-featured case studies + 2 GitHub entries.
  await expect(page.locator('.pf-grid li')).toHaveCount(6);
});
