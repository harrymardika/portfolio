import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { fill } from '../../src/lib/i18n/format';
import { UI } from '../../src/lib/i18n/ui';
import { publishedCaseStudies } from './helpers';

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

// Drafts are hidden by isPublished (tests/unit/content/helpers.test.ts); no case study is a draft right now.
test('the list shows case studies first, then GitHub repos @fixture', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible();
  const titles = await page.locator('[data-project] h2').allTextContents();
  expect(titles.map((t) => t.trim())).toEqual([
    // Published case studies in the site's order (featured by `order`, then newest year, then title),
    // derived from content/projects/ so publishing a new one never breaks this test.
    ...publishedCaseStudies().map((project) => project.title),
    // From tests/fixtures/github.json (e2e builds never call the GitHub API), newest push first.
    'fixture-vision-toolkit',
    'Fixture grouped project',
  ]);
});

test('a GitHub repo card links to GitHub and shows its language, stars, and topics @fixture', async ({
  page,
}) => {
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

test('a project split across repositories shows as one card linked to its first repo @fixture', async ({
  page,
}) => {
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

test('GitHub cards are translated on /id/ @fixture', async ({ page }) => {
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

test('Indonesian case studies show the Indonesian body when it exists', async ({ page }) => {
  const translated = publishedCaseStudies().find((project) => project.translated);
  test.skip(!translated, 'no case study has an Indonesian body');
  await page.goto(`/id/projects/${translated?.slug ?? ''}/`);
  await expect(page.getByText('Studi kasus ini ditulis dalam bahasa Inggris.')).toHaveCount(0);
  await expect(page.locator('.prose')).not.toHaveAttribute('lang', 'en');
});

test('Indonesian case studies without a translation say the body is in English', async ({ page }) => {
  const untranslated = publishedCaseStudies().find((project) => !project.translated);
  test.skip(!untranslated, 'every case study has an Indonesian body');
  await page.goto(`/id/projects/${untranslated?.slug ?? ''}/`);
  await expect(page.getByText('Studi kasus ini ditulis dalam bahasa Inggris.')).toBeVisible();
  await expect(page.locator('.prose')).toHaveAttribute('lang', 'en');
});

test('the Indonesian Decklify case study is translated, with its header and links', async ({ page }) => {
  await page.goto('/id/projects/decklify/');
  await expect(page.getByRole('heading', { level: 2, name: 'Masalah' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Kunjungi situs/ })).toBeVisible();
});

test('the home page shows selected projects with a link to all projects', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#projects');
  await expect(section.locator('[data-project]')).toHaveCount(3);
  await section.getByRole('link', { name: /View all projects/ }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
});

const visibleCards = '[data-project-grid] li:not([hidden]) > [data-project]';
const fieldButtons = 'button[data-category]:not([data-category=""])';

/** Read what the visible cards carry, so expectations follow content/ instead of hard-coding it. */
async function visibleData(page: Page): Promise<{ categories: string[]; search: string }[]> {
  return page.locator(visibleCards).evaluateAll((cards) =>
    cards.map((card) => ({
      categories: ((card as HTMLElement).dataset['categories'] ?? '').split(' '),
      search: ((card as HTMLElement).dataset['search'] ?? '').toLowerCase(),
    })),
  );
}

/** The first field button with its id and count, or null when content defines no useful fields. */
async function firstField(page: Page): Promise<{ id: string; count: number } | null> {
  const button = page.locator(fieldButtons).first();
  if ((await button.count()) === 0) return null;
  return {
    id: (await button.getAttribute('data-category')) ?? '',
    count: Number(await button.locator('.count').textContent()),
  };
}

/** A word (4+ letters) from the search text of the first card in a field: a query that must match. */
async function wordFrom(page: Page, field: string): Promise<string> {
  const cards = await visibleData(page);
  const card = cards.find((c) => c.categories.includes(field)) ?? cards[0];
  return card?.search.match(/[a-z]{4,}/)?.[0] ?? '';
}

test.describe('search and field filters', () => {
  test('a field button shows its projects, with the count it promises', async ({ page }) => {
    await page.goto('/projects/');
    const field = await firstField(page);
    test.skip(field === null, 'No field holds 2+ projects in content/profile.yaml');
    if (!field) return;
    const total = await page.locator('[data-project]').count();
    const button = page.locator(`button[data-category="${field.id}"]`);

    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator(visibleCards)).toHaveCount(field.count);
    for (const card of await visibleData(page)) expect(card.categories).toContain(field.id);
    await expect(page.locator('[data-filter-status]')).toHaveText(
      fill(UI.en['projects.results'], { shown: field.count, total }),
    );
    await expect(page).toHaveURL(new RegExp(`\\?filter=${field.id}$`));

    await page.getByRole('button', { name: new RegExp(`^${UI.en['projects.all']}`) }).click();
    await expect(page.locator(visibleCards)).toHaveCount(total);
    await expect(page).toHaveURL(/\/projects\/$/);
  });

  test('search narrows the list and combines with a field', async ({ page }) => {
    await page.goto('/projects/');
    const field = await firstField(page);
    const word = await wordFrom(page, field?.id ?? '');
    await page.getByRole('searchbox', { name: UI.en['projects.search'] }).fill(word);
    await expect(page).toHaveURL(new RegExp(`[?&]q=${word}`));
    const matches = await visibleData(page);
    expect(matches.length).toBeGreaterThan(0);
    for (const card of matches) expect(card.search).toContain(word);

    if (!field) return;
    await page.locator(`button[data-category="${field.id}"]`).click();
    const both = await visibleData(page);
    expect(both.length).toBeGreaterThan(0);
    for (const card of both) {
      expect(card.categories).toContain(field.id);
      expect(card.search).toContain(word);
    }
    expect(both.length).toBe(matches.filter((card) => card.categories.includes(field.id)).length);
  });

  test('no match says so and one click clears every filter', async ({ page }) => {
    await page.goto('/projects/');
    const total = await page.locator('[data-project]').count();
    const search = page.getByRole('searchbox', { name: UI.en['projects.search'] });
    await search.fill('zzqx-nothing');
    await expect(page.locator(visibleCards)).toHaveCount(0);
    await expect(page.locator('[data-filter-status]')).toHaveText(UI.en['projects.noResults']);
    await page.getByRole('button', { name: UI.en['projects.clear'] }).click();
    await expect(page.locator(visibleCards)).toHaveCount(total);
    await expect(search).toBeFocused();
    await expect(page.getByRole('button', { name: UI.en['projects.clear'] })).toBeHidden();
  });

  test('a shared link opens the list already filtered', async ({ page }) => {
    await page.goto('/projects/');
    const field = await firstField(page);
    test.skip(field === null, 'No field holds 2+ projects in content/profile.yaml');
    if (!field) return;
    const word = await wordFrom(page, field.id);

    await page.goto(`/projects/?filter=${field.id}&q=${word}`);
    await expect(page.locator(`button[data-category="${field.id}"]`)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('searchbox', { name: UI.en['projects.search'] })).toHaveValue(word);
    const cards = await visibleData(page);
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(card.categories).toContain(field.id);
      expect(card.search).toContain(word);
    }
  });

  test('an unknown field in the link falls back to all projects and is dropped', async ({ page }) => {
    await page.goto('/projects/?filter=not-a-field');
    await expect(page.locator(visibleCards)).toHaveCount(await page.locator('[data-project]').count());
    await expect(page).toHaveURL(/\/projects\/$/);
  });

  test('the Indonesian page searches and labels in Indonesian', async ({ page }) => {
    await page.goto('/id/projects/');
    const total = await page.locator('[data-project]').count();
    await expect(page.locator('[data-filter-status]')).toHaveText(
      fill(UI.id['projects.results'], { shown: total, total }),
    );
    if ((await firstField(page)) !== null)
      await expect(page.getByRole('group', { name: UI.id['projects.filterLabel'] })).toBeVisible();
    await page.getByRole('searchbox', { name: UI.id['projects.search'] }).fill('zzqx-nothing');
    await expect(page.locator('[data-filter-status]')).toHaveText(UI.id['projects.noResults']);
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('every project is listed and the filter stays hidden', async ({ page }) => {
      await page.goto('/projects/?filter=computer-vision&q=zzqx');
      await expect(page.locator('[data-project-filter]')).toBeHidden();
      await expect(page.locator(visibleCards)).toHaveCount(await page.locator('[data-project]').count());
    });
  });
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
