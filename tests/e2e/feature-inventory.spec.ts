/**
 * Feature inventory (T13.0, docs/11-roadmap.md §I): every feature the site had before the Phase 13
 * redesign must still be there after it. Checks use roles, UI dictionary text, `content/`, and a few
 * stable ids (#journey, #projects, #messages, #contact), never CSS classes, so they hold for any look.
 * Detailed behavior stays in the feature's own spec; this file only proves nothing went missing.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test, type Page } from '@playwright/test';
import { load } from 'js-yaml';

import { localizePath, type Locale, UI } from '../../src/lib/i18n';
import { cvVariants, publishedCaseStudies } from './helpers';

const LOCALES: Locale[] = ['en', 'id'];
const contentFile = (name: string) => join(import.meta.dirname, '..', '..', 'content', name);

interface Profile {
  name: string;
  stats: unknown[];
  socials: { platform: string; url: string }[];
}
const profile = load(readFileSync(contentFile('profile.yaml'), 'utf8')) as Profile;
const milestones = (load(readFileSync(contentFile('journey.yaml'), 'utf8')) as { milestones: unknown[] })
  .milestones;
const SOCIALS = ['linkedin', 'instagram', 'github', 'medium'] as const;
const SOCIAL_NAMES = { linkedin: 'LinkedIn', instagram: 'Instagram', github: 'GitHub', medium: 'Medium' };

const isMobile = () => test.info().project.name === 'mobile';

/** The assistant service does not run under `astro preview`; pretend it is on. */
async function assistantOn(page: Page): Promise<void> {
  await page.route('**/api/ask/health', (route) => route.fulfill({ json: { ok: true, enabled: true } }));
}

/** Primary navigation links, opening the phone menu first when there is one. */
async function primaryNav(page: Page, locale: Locale) {
  const t = UI[locale];
  if (isMobile()) {
    await page.getByRole('button', { name: t['nav.menu'] }).click();
    return page.locator('#mobile-menu');
  }
  return page.getByRole('navigation', { name: t['nav.primary'] });
}

for (const locale of LOCALES) {
  const t = UI[locale];
  const path = (p: string) => localizePath(p, locale);
  const other: Locale = locale === 'en' ? 'id' : 'en';
  const suffix = locale.toUpperCase();

  test.describe(`${locale}: every page`, () => {
    for (const page of ['/', '/projects/', '/about/', '/stats/', '/messages/', '/cv/']) {
      test(`${page} keeps the shared layout`, async ({ page: browser }) => {
        await assistantOn(browser);
        await browser.goto(path(page));

        await expect(browser.getByRole('link', { name: t['a11y.skipToContent'] })).toHaveCount(1);
        await expect(browser.locator(`header a[hreflang="${other}"]`)).toHaveAttribute(
          'href',
          localizePath(page, other),
        );
        await expect(browser.getByRole('button', { name: /theme|tema/i })).toBeVisible();
        await expect(browser.getByRole('button', { name: t['ask.open'] })).toBeVisible();

        const footer = browser.getByRole('contentinfo');
        await expect(footer.getByRole('link', { name: t['stats.title'] })).toHaveAttribute(
          'href',
          path('/stats/'),
        );
        await expect(footer.getByRole('link', { name: t['footer.cvVariants'] })).toHaveAttribute(
          'href',
          path('/cv/'),
        );
        await expect(footer.getByRole('link', { name: t['messages.leave'] })).toHaveAttribute(
          'href',
          path('/messages/'),
        );
        for (const platform of [...SOCIALS, 'email'] as const) {
          const url = profile.socials.find((social) => social.platform === platform)?.url;
          await expect(footer.locator(`a[href="${url}"]`)).toHaveCount(1);
        }

        await expect(browser.locator('link[rel="alternate"][hreflang]')).not.toHaveCount(0);
        await expect(browser.locator('meta[property="og:image"]')).toHaveCount(1);

        const nav = await primaryNav(browser, locale);
        await expect(nav.getByRole('link', { name: t['nav.projects'] })).toHaveAttribute(
          'href',
          path('/projects/'),
        );
        await expect(nav.getByRole('link', { name: t['nav.about'] })).toHaveAttribute(
          'href',
          path('/about/'),
        );
      });
    }
  });

  test.describe(`${locale}: home`, () => {
    test('hero: name, both PDF downloads, three highlights', async ({ page }) => {
      await page.goto(path('/'));
      await expect(page.getByRole('heading', { level: 1 })).toContainText(profile.name);
      const cv = page.getByRole('link', { name: t['download.cv'] }).first();
      await expect(cv).toHaveAttribute('href', `/downloads/Harry-Mardika-CV-${suffix}.pdf`);
      await expect(cv).toHaveAttribute('download', /.*/);
      await expect(cv).toHaveAttribute('data-download', /.+/);
      const portfolio = page.getByRole('link', { name: t['download.portfolio'] }).first();
      await expect(portfolio).toHaveAttribute('href', `/downloads/Harry-Mardika-Portfolio-${suffix}.pdf`);
      await expect(portfolio).toHaveAttribute('data-download', /.+/);
      await expect(page.getByLabel(t['hero.statsLabel']).locator('dt')).toHaveCount(profile.stats.length);
      await expect(page.locator('main img').first()).toBeVisible();
    });

    test('journey: every milestone, each with its story', async ({ page }) => {
      await page.goto(path('/'));
      const journey = page.locator('#journey');
      const openers = journey.getByRole('button', { name: new RegExp(t['journey.openDetail']) });
      await expect(openers).toHaveCount(milestones.length);
      await openers.last().click();
      await expect(page.getByRole('dialog')).toBeVisible();
    });

    test('selected projects, kind words, and contact', async ({ page, context, browserName }) => {
      await page.goto(path('/'));
      const featured = publishedCaseStudies()
        .filter((project) => project.featured)
        .slice(0, 3);
      const projects = page.locator('#projects');
      for (const project of featured) {
        await expect(
          projects.locator(`a[href="${path(`/projects/${project.slug}/`)}"]`).first(),
        ).toBeVisible();
      }
      await expect(projects.getByRole('link', { name: t['projects.viewAll'] })).toHaveAttribute(
        'href',
        path('/projects/'),
      );

      const messages = page.locator('#messages');
      await expect(messages.getByRole('heading', { name: t['messages.title'] })).toBeVisible();
      await expect(messages.getByText('Test Manager')).toBeVisible();
      await expect(messages.getByRole('link', { name: t['messages.leave'] })).toHaveAttribute(
        'href',
        path('/messages/'),
      );

      const contact = page.locator('#contact');
      await expect(contact.locator('a[href^="mailto:"]').first()).toBeVisible();
      for (const platform of SOCIALS) {
        await expect(
          contact.getByRole('link', { name: new RegExp(SOCIAL_NAMES[platform]) }).first(),
        ).toBeVisible();
      }
      if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await contact.getByRole('button', { name: t['contact.copyEmail'] }).click();
      await expect(contact.getByText(t['contact.copied'])).toBeVisible();
    });
  });

  test.describe(`${locale}: other pages`, () => {
    test('projects: search, field filters, filter links, every case study', async ({ page }) => {
      await page.goto(path('/projects/'));
      await expect(page.getByRole('searchbox', { name: t['projects.search'] })).toBeVisible();
      const filters = page.getByRole('group', { name: t['projects.filterLabel'] });
      await expect(filters.getByRole('button', { name: new RegExp(`^${t['projects.all']}`) })).toBeVisible();
      for (const project of publishedCaseStudies()) {
        await expect(page.locator(`a[href="${path(`/projects/${project.slug}/`)}"]`).first()).toBeAttached();
      }
      const status = page.getByRole('status').filter({ hasText: /\d/ });
      const all = await status.textContent();
      await page.goto(`${path('/projects/')}?filter=computer-vision`);
      await expect(status).not.toHaveText(all ?? '');
    });

    test('a case study keeps its content and the way back', async ({ page }) => {
      const [first] = publishedCaseStudies();
      if (!first) throw new Error('No published case study');
      await page.goto(path(`/projects/${first.slug}/`));
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByRole('link', { name: t['projects.back'] }).first()).toHaveAttribute(
        'href',
        path('/projects/'),
      );
    });

    test('about: every section', async ({ page }) => {
      await page.goto(path('/about/'));
      for (const key of [
        'about.experience',
        'about.education',
        'about.awards',
        'about.certifications',
        'about.skills',
      ] as const) {
        await expect(page.getByRole('heading', { name: t[key], exact: true })).toBeVisible();
      }
    });

    test('CVs by role: every variant with its PDFs', async ({ page }) => {
      await page.goto(path('/cv/'));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(t['cvVariants.title']);
      // Two PDFs (EN and ID) per variant.
      await expect(page.locator('main a[href^="/downloads/cv/"][href$=".pdf"]')).toHaveCount(
        cvVariants().length * 2,
      );
    });

    test('statistics, the message form, and the 404 page', async ({ page }) => {
      await page.goto(path('/stats/'));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(t['stats.title']);
      await expect(page.getByText(t['status.label']).first()).toBeAttached();

      await page.goto(path('/messages/'));
      await expect(page.getByRole('textbox', { name: t['messages.form.name'] })).toBeVisible();
      await expect(page.getByRole('textbox', { name: t['messages.form.message'] })).toBeVisible();
      await expect(page.getByRole('button', { name: t['messages.form.submit'] })).toBeVisible();

      const missing = await page.goto(path('/missing-page/'));
      expect(missing?.status()).toBe(404);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(UI.en['notFound.title']);
    });
  });
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the home page keeps its content and the journey stories open', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(profile.name);
    await expect(page.getByRole('link', { name: UI.en['download.cv'] }).first()).toBeVisible();
    await page
      .locator('#journey')
      .getByRole('button', { name: new RegExp(UI.en['journey.openDetail']) })
      .first()
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('#contact a[href^="mailto:"]').first()).toBeVisible();
  });
});

test('the PDFs are still built', async ({ request }) => {
  for (const file of [
    'Harry-Mardika-CV-EN.pdf',
    'Harry-Mardika-CV-ID.pdf',
    'Harry-Mardika-Portfolio-EN.pdf',
    'Harry-Mardika-Portfolio-ID.pdf',
  ]) {
    const response = await request.get(`/downloads/${file}`);
    expect(response.status(), file).toBe(200);
  }
});
