/**
 * The home page's lower rooms (T13.6): the sorting line under Selected projects, Kind words as paper
 * notes, and the homelab laptop beside Contact. The content always stays HTML; the 3D only adds to it.
 */
import AxeBuilder from '@axe-core/playwright';
import { assumeGpu, disableWebGL, SCENE_READY_TIMEOUT } from './helpers';
import { expect, test, type Page } from '@playwright/test';

const sorting = '[data-room-slot="sorting"]';
const notes = '[data-room-slot="notes"]';
const laptop = '[data-room-slot="laptop"]';

async function scrollTo(page: Page, selector: string): Promise<void> {
  await page.locator(selector).first().scrollIntoViewIfNeeded();
  // A real scroll event, so the room builds what is near.
  await page.mouse.wheel(0, 1);
}

async function ready(page: Page, selector: string): Promise<void> {
  await scrollTo(page, selector);
  await expect(page.locator(selector)).toHaveAttribute('data-room-ready', 'true', {
    timeout: SCENE_READY_TIMEOUT,
  });
}

test.describe('without 3D', () => {
  for (const [name, setup] of [
    ['without WebGL', (page: Page) => disableWebGL(page)],
    ['without a GPU', async () => undefined],
  ] as const) {
    test(`${name}: no empty 3D bands, and the projects, messages, and contact stay HTML`, async ({
      page,
    }) => {
      await setup(page);
      await page.goto('/');
      await scrollTo(page, '#contact');
      await expect(page.locator('html')).not.toHaveAttribute('data-room-3d');
      await expect(page.locator(sorting)).toBeHidden();
      await expect(page.locator(laptop)).toBeHidden();
      await expect(page.locator('#projects article')).toHaveCount(3);
      // Messages keep their own card look.
      const figure = page.locator(`${notes} figure`).first();
      await expect(figure).toBeVisible();
      expect(await figure.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(
        'rgba(0, 0, 0, 0)',
      );
      await expect(page.locator('#contact a[href^="mailto:"]')).toBeVisible();
    });
  }

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('the 3D bands take no space', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator(sorting)).toBeHidden();
      await expect(page.locator(laptop)).toBeHidden();
      await expect(page.locator(`${notes} figure`).first()).toBeVisible();
    });
  });
});

test.describe('with 3D', () => {
  test.beforeEach(({ page }) => assumeGpu(page));

  test.describe('reduced motion (a still frame)', () => {
    test.use({ reducedMotion: 'reduce' });

    test('the camera detects a selected project, and clicking its card opens the case study', async ({
      page,
    }) => {
      await page.goto('/');
      await ready(page, sorting);
      const line = page.locator(sorting);
      const href = await line.getAttribute('data-detected');
      // The first card on the line is a selected project, the same page as its row.
      const rows = await page
        .locator('#projects article h3 a')
        .evaluateAll((links) => links.map((link) => new URL((link as HTMLAnchorElement).href).pathname));
      expect(rows).toContain(href);
      const [x, y] = ((await line.getAttribute('data-detected-at')) ?? '').split(' ').map(Number);
      if (x === undefined || y === undefined || Number.isNaN(x)) throw new Error('no detected card');
      await page.mouse.move(x, y);
      await expect(page.locator('html')).toHaveClass(/room-hover/);
      await page.mouse.click(x, y);
      await expect(page).toHaveURL(new RegExp(`${href}$`));
    });

    test('after a theme switch the redrawn cards are the ones that respond, never the old ones', async ({
      page,
    }) => {
      await page.goto('/');
      await ready(page, sorting);
      const line = page.locator(sorting);
      const href = await line.getAttribute('data-detected');
      const at = async () => ((await line.getAttribute('data-detected-at')) ?? '').split(' ').map(Number);
      const [oldX, oldY] = await at();
      if (oldX === undefined || oldY === undefined || Number.isNaN(oldX)) throw new Error('no detected card');
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
      // Where the old card was drawn, with the line scrolled out of view: nothing to hover there.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.mouse.wheel(0, 1);
      await page.mouse.move(oldX, oldY);
      await page.waitForTimeout(300);
      await expect(page.locator('html')).not.toHaveClass(/room-hover/);
      // Back at the line, the redrawn card opens its case study.
      await scrollTo(page, sorting);
      await page.waitForTimeout(300);
      const [x, y] = await at();
      if (x === undefined || y === undefined || Number.isNaN(x)) throw new Error('no detected card');
      await page.mouse.click(x, y);
      await expect(page).toHaveURL(new RegExp(`${href}$`));
    });

    test('on a touch screen, a first tap shows the title and a second opens the case study', async ({
      page,
      isMobile,
    }) => {
      test.skip(!isMobile, 'Touch only');
      await page.goto('/');
      await ready(page, sorting);
      const line = page.locator(sorting);
      const href = await line.getAttribute('data-detected');
      const [x, y] = ((await line.getAttribute('data-detected-at')) ?? '').split(' ').map(Number);
      if (x === undefined || y === undefined || Number.isNaN(x)) throw new Error('no detected card');
      await page.touchscreen.tap(x, y);
      await page.waitForTimeout(400);
      await expect(page).toHaveURL(/\/$/);
      await page.touchscreen.tap(x, y);
      await expect(page).toHaveURL(new RegExp(`${href}$`));
    });

    for (const theme of ['light', 'dark'] as const) {
      test(`notes and laptop are drawn, and the sections pass axe (${theme})`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme });
        await page.goto('/');
        await ready(page, notes);
        const figure = page.locator(`${notes} figure`).first();
        await expect
          .poll(() => figure.evaluate((el) => getComputedStyle(el).backgroundColor))
          .toBe('rgba(0, 0, 0, 0)');
        await ready(page, laptop);
        await expect(page.locator(laptop)).toContainText('This site is served from this laptop');
        const results = await new AxeBuilder({ page })
          .include('#projects')
          .include('#messages')
          .include('#contact')
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  });

  test('the sorting line keeps moving while in view, without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    await page.goto('/');
    await ready(page, sorting);
    const line = page.locator(sorting);
    // Cards ride under the camera one after another.
    const seen = new Set<string>();
    await expect
      .poll(
        async () => {
          const href = await line.getAttribute('data-detected');
          if (href) seen.add(href);
          return seen.size;
        },
        { timeout: 30_000, intervals: [250] },
      )
      .toBeGreaterThan(1);
    expect(errors).toEqual([]);
  });

  test('Indonesian pages label the laptop in Indonesian', async ({ page }) => {
    await page.goto('/id/');
    await ready(page, laptop);
    await expect(page.locator(laptop)).toContainText('Situs ini dilayani dari laptop ini');
  });
});
