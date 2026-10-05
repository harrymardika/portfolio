import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the header links to Projects and marks the current page', async ({ page, isMobile }) => {
  // On phones the primary links live in the menu popover (T2.8).
  const mainNav = async () => {
    if (isMobile) await page.getByRole('button', { name: 'Menu' }).click();
    return page.getByRole('navigation', { name: 'Main' });
  };
  await page.goto('/');
  await (await mainNav()).getByRole('link', { name: 'Projects' }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect((await mainNav()).getByRole('link', { name: 'Projects' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('the list shows case studies first (drafts hidden), then GitHub repos', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible();
  const titles = await page.locator('[data-project] h2').allTextContents();
  expect(titles.map((t) => t.trim())).toEqual([
    // Featured case studies by `order`, then the rest by year (newest) and title.
    'Decklify',
    'Real-time crowd violence detection',
    'Multimodal crisis-detection model',
    'Javanese script (Aksara Jawa) classification',
    'BCA stock price prediction',
    'Cross-site scripting (XSS) detection',
    'Indonesian fake news detection',
    // From tests/fixtures/github.json (e2e builds never call the GitHub API), newest push first.
    'fixture-vision-toolkit',
    'Fixture grouped project',
  ]);
  await expect(page.getByText('Reclaimyt')).toHaveCount(0); // draft
});

test('a GitHub repo card links to GitHub and shows its language, stars, and topics', async ({ page }) => {
  await page.goto('/projects/');
  const card = page.locator('[data-project-kind="github"]').filter({ hasText: 'fixture-vision-toolkit' });
  await expect(card).toHaveCount(1);
  // The owner's description from github.yaml wins over the GitHub one.
  await expect(card).toContainText('Test fixture: a GitHub repository without a case study.');
  await expect(card.getByRole('link', { name: 'fixture-vision-toolkit' })).toHaveAttribute(
    'href',
    'https://github.com/harrymardika/fixture-vision-toolkit',
  );
  await expect(card).toContainText('GitHub');
  await expect(card).toContainText('Python · 2026 · ★ 3');
  await expect(card.getByRole('list', { name: 'Technologies' }).getByRole('listitem')).toHaveText([
    'Python',
    'computer-vision',
  ]);
});

test('a project split across repositories shows as one card linked to its first repo', async ({ page }) => {
  await page.goto('/projects/');
  const card = page.locator('[data-project-kind="github"]').filter({ hasText: 'Fixture grouped project' });
  await expect(card).toHaveCount(1);
  await expect(card).toContainText('TypeScript · 2025 · 2 repositories');
  await expect(card.getByRole('link', { name: 'Fixture grouped project' })).toHaveAttribute(
    'href',
    'https://github.com/harrymardika/fixture-group-api',
  );
});

test('GitHub repos stay off the home page, which shows featured case studies only', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#projects [data-project-kind="github"]')).toHaveCount(0);
  await expect(page.locator('#projects [data-project-kind="local"]')).toHaveCount(3);
});

test('GitHub cards are translated on /id/', async ({ page }) => {
  await page.goto('/id/projects/');
  const card = page.locator('[data-project-kind="github"]').filter({ hasText: 'fixture-vision-toolkit' });
  await expect(card).toContainText('★ 3');
  await expect(card).toContainText('Fixture uji: repositori GitHub tanpa studi kasus.');
  await expect(
    page.locator('[data-project-kind="github"]').filter({ hasText: 'Fixture grouped' }),
  ).toContainText('2 repositori');
});

test('a card opens its case study, which links back to the list', async ({ page }) => {
  await page.goto('/projects/');
  await page.getByRole('link', { name: 'Decklify' }).click();
  await expect(page).toHaveURL(/\/projects\/decklify\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Decklify' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Visit site/ })).toHaveAttribute('href', 'https://decklify.id');
  await expect(page.getByRole('heading', { level: 2, name: 'Problem' })).toBeVisible();
  await page.getByRole('link', { name: /All projects/ }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
});

test('Indonesian case studies say the body is in English and mark it lang="en"', async ({ page }) => {
  await page.goto('/id/projects/decklify/');
  await expect(page.getByText('Studi kasus ini ditulis dalam bahasa Inggris.')).toBeVisible();
  await expect(page.locator('.prose')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('link', { name: /Kunjungi situs/ })).toBeVisible();
});

test('the home page shows selected projects with a link to all projects', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#projects');
  await expect(section.locator('[data-project]')).toHaveCount(3);
  await section.getByRole('link', { name: /View all projects/ }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
});

test('the tag filter narrows the grid when enough projects share tags', async ({ page }) => {
  await page.goto('/projects/');
  const filter = page.locator('[data-tag-filter]');
  test.skip((await filter.count()) === 0, 'Fewer than two shared tags in content/projects; filter is hidden');
  const total = await page.locator('[data-project]').count();
  await filter.getByRole('button').nth(1).click();
  await expect(filter.getByRole('button').nth(1)).toHaveAttribute('aria-pressed', 'true');
  expect(await page.locator('li:not([hidden]) > [data-project]').count()).toBeLessThan(total);
});

for (const path of ['/projects/', '/id/projects/decklify/']) {
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
