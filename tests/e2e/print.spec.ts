import { expect, test } from '@playwright/test';

import { publishedCaseStudies } from './helpers';

for (const [path, headings] of [
  [
    '/print/cv/',
    [
      'Summary',
      'Education',
      'Skills',
      'Experience',
      'Leadership & teaching',
      'Training',
      'Awards',
      'Certifications',
    ],
  ],
  [
    '/id/print/cv/',
    [
      'Ringkasan',
      'Pendidikan',
      'Keahlian',
      'Pengalaman',
      'Kepemimpinan & mengajar',
      'Pelatihan',
      'Penghargaan',
      'Sertifikasi',
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
    // Key results marked **like this** in content/ are bold, and no marker is left as text.
    expect(await page.locator('.cv .cv-entry li strong').count()).toBeGreaterThan(5);
    await expect(page.locator('.cv section').first().locator('p strong').first()).toBeVisible();
    expect(await page.locator('.cv').innerText()).not.toContain('**');
  });
}

test('the CV text is black, not the theme green', async ({ page }) => {
  await page.goto('/print/cv/');
  for (const selector of ['.cv', '.cv h1', '.cv h2', '.cv li']) {
    await expect(page.locator(selector).first()).toHaveCSS('color', 'rgb(0, 0, 0)');
  }
});

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

test('the portfolio lists every non-featured project on the "more projects" page @fixture', async ({
  page,
}) => {
  await page.goto('/print/portfolio/');
  // Every published case study beyond the (up to) three featured pages, plus the 2 GitHub fixture
  // entries; the grid holds at most 16 (PortfolioDocument MORE_LIMIT).
  const projects = publishedCaseStudies();
  const featuredPages = Math.min(3, projects.filter((project) => project.featured).length);
  await expect(page.locator('.pf-grid li')).toHaveCount(Math.min(16, projects.length + 2 - featuredPages));
});

test('the GPA uses the decimal separator of the language', async ({ page }) => {
  await page.goto('/print/cv/');
  await expect(page.locator('.cv')).toContainText('GPA 3.99/4.00');
  await page.goto('/id/print/cv/');
  await expect(page.locator('.cv')).toContainText('IPK 3,99/4,00');
  await expect(page.locator('.cv')).not.toContainText('3.99');
});
