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

/**
 * Scroll to where the room's camera stops at a section (camera.ts `stopsFor`): centred on the
 * screen, or at its top when it is taller than the screen.
 */
async function scrollToRoom(page: Page, section: string): Promise<void> {
  await page.evaluate((name) => {
    const element = document.querySelector(`[data-room-section="${name}"]`);
    if (!element) throw new Error(`section ${name} missing`);
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + Math.min(0, (element.clientHeight - window.innerHeight) / 2));
  }, section);
  await page.mouse.wheel(0, 1);
}

async function ready(page: Page, selector: string): Promise<void> {
  if (selector === sorting) await scrollToRoom(page, 'projects');
  else await scrollTo(page, selector);
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

    test('the lamp is on from the start, without the opening', async ({ page }) => {
      await page.goto('/');
      const hero = page.locator('[data-room-slot="hero"]');
      await expect(hero).toHaveAttribute('data-room-ready', 'true', { timeout: SCENE_READY_TIMEOUT });
      await expect(hero).toHaveAttribute('data-lamp', 'on');
    });

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

    test('the detection log names the detected project and marks its row', async ({ page }) => {
      await page.goto('/');
      await ready(page, sorting);
      const href = await page.locator(sorting).getAttribute('data-detected');
      if (!href) throw new Error('nothing detected');
      // Exactly the detected project's row is marked.
      const marked = page.locator('#projects [data-project][data-detected]');
      await expect(marked).toHaveCount(1);
      const title = (await marked.locator('h3 a').innerText()).trim();
      expect(
        new URL(await marked.locator('h3 a').evaluate((a) => (a as HTMLAnchorElement).href)).pathname,
      ).toBe(href);
      // The log reads "Title → Field", from the same content.
      const log = page.locator('[data-detection-log]');
      await expect(log).toBeVisible();
      await expect(log).toHaveText(new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} → .+`));
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
      await scrollToRoom(page, 'projects');
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
        // The notes are papers of their own in the room (ADR 0020); the HTML messages keep their cards.
        const figure = page.locator(`${notes} figure`).first();
        expect(await figure.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(
          'rgba(0, 0, 0, 0)',
        );
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

test.describe('the full-screen room layout (ADR 0020)', () => {
  const sections = '[data-room-section]';

  test('without 3D the home page keeps its plain layout, without a scrim', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveAttribute('data-room-3d');
    for (const display of await page
      .locator(sections)
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).display)))
      expect(display).toBe('block');
    await expect(page.locator('.room-scrim')).toBeHidden();
  });

  test.describe('with 3D', () => {
    test.beforeEach(async ({ page }) => {
      await assumeGpu(page);
      // What the root looked like before the load event, when web fonts finished loading, and every
      // layout shift. A font swapping in can move text on any page (on phones Young Serif wraps the
      // hero name onto two lines); what must not move anything is the 3D.
      await page.addInitScript(() => {
        const state = window as unknown as {
          earlyRoom?: boolean;
          fontsDone: number[];
          shifts: { at: number; value: number }[];
        };
        state.fontsDone = [];
        state.shifts = [];
        document.addEventListener('DOMContentLoaded', () => {
          state.earlyRoom = document.documentElement.hasAttribute('data-room-3d');
        });
        document.fonts.addEventListener('loadingdone', () => state.fontsDone.push(performance.now()));
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & { value: number })[])
            state.shifts.push({ at: entry.startTime, value: entry.value });
        }).observe({ type: 'layout-shift', buffered: true });
      });
    });

    test('the room opens dim, then the lamp switches on', async ({ page }) => {
      // Every state the lamp goes through, and whether the walls were dimmed meanwhile.
      await page.addInitScript(() => {
        const state = window as unknown as { lamp: string[]; wallsDimmed: boolean };
        state.lamp = [];
        state.wallsDimmed = false;
        new MutationObserver(() => {
          const value = document.querySelector<HTMLElement>('[data-room-slot="hero"]')?.dataset['lamp'];
          if (value && state.lamp[state.lamp.length - 1] !== value) state.lamp.push(value);
          if (document.documentElement.style.getPropertyValue('--room-dark')) state.wallsDimmed = true;
        }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-lamp', 'style'] });
      });
      await page.goto('/');
      const hero = page.locator('[data-room-slot="hero"]');
      await expect(hero).toHaveAttribute('data-room-ready', 'true', { timeout: SCENE_READY_TIMEOUT });
      await expect(hero).toHaveAttribute('data-lamp', 'on', { timeout: 10_000 });
      const seen = await page.evaluate(() => {
        const state = window as unknown as { lamp: string[]; wallsDimmed: boolean };
        return { lamp: state.lamp, wallsDimmed: state.wallsDimmed };
      });
      expect(seen.lamp).toEqual(['off', 'on']);
      expect(seen.wallsDimmed).toBe(true);
      // Once the lamp is on, the walls are back to full light.
      expect(await page.evaluate(() => document.documentElement.style.getPropertyValue('--room-dark'))).toBe(
        '',
      );
    });

    test('opened further down the page, the lamp is simply on', async ({ page }) => {
      await page.goto('/#contact');
      await expect(page.locator('[data-room-stage]')).toHaveAttribute('data-scene', 'animated');
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.mouse.wheel(0, -1);
      const hero = page.locator('[data-room-slot="hero"]');
      await expect(hero).toHaveAttribute('data-room-ready', 'true', { timeout: SCENE_READY_TIMEOUT });
      // On at once: no opening played.
      expect(await hero.getAttribute('data-lamp')).toBe('on');
    });

    test('the walls follow the camera from jade at the hero to indigo at the contact', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('[data-room-slot="hero"]')).toHaveAttribute('data-room-ready', 'true', {
        timeout: SCENE_READY_TIMEOUT,
      });
      const wall = () => page.evaluate(() => document.body.style.getPropertyValue('--room-b'));
      await expect.poll(wall).toContain('var(--room-top)');
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.mouse.wheel(0, 1);
      await expect.poll(wall).toContain('var(--room-bottom)');
    });

    test('the room is decided before the page loads, every section fills the screen, and nothing jumps once the 3D is drawn', async ({
      page,
    }) => {
      await page.goto('/');
      expect(await page.evaluate(() => (window as unknown as { earlyRoom?: boolean }).earlyRoom)).toBe(true);
      await expect(page.locator('html')).toHaveAttribute('data-room-3d', 'animated');
      await expect(page.locator('[data-room-slot="hero"]')).toHaveAttribute('data-room-ready', 'true', {
        timeout: SCENE_READY_TIMEOUT,
      });
      const height = page.viewportSize()?.height ?? 0;
      for (const [name, box] of await page
        .locator(sections)
        .evaluateAll((els) =>
          els.map(
            (el) => [(el as HTMLElement).dataset['roomSection'], el.getBoundingClientRect().height] as const,
          ),
        ))
        expect(box, `${name} fills the screen`).toBeGreaterThanOrEqual(
          name === 'hero' ? height - 80 : height - 1,
        );
      // No dividing lines: the header and the sections lose their borders.
      const transparent = 'rgba(0, 0, 0, 0)';
      expect(
        await page.locator('body > header').evaluate((el) => getComputedStyle(el).borderBottomColor),
      ).toBe(transparent);
      for (const color of await page
        .locator(sections)
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).borderTopColor)))
        expect(color).toBe(transparent);
      // On to the projects room: its detection log fills in without moving anything either.
      await scrollToRoom(page, 'projects');
      await expect(page.locator(sorting)).toHaveAttribute('data-detected', /.+/, {
        timeout: SCENE_READY_TIMEOUT,
      });
      // Give the 3D a moment to settle, then: no layout shift after the load event.
      await page.waitForTimeout(500);
      const late = await page.evaluate(() => {
        const state = window as unknown as { fontsDone: number[]; shifts: { at: number; value: number }[] };
        const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        const fontSwap = (at: number) => state.fontsDone.some((done) => at >= done && at <= done + 250);
        return state.shifts
          .filter((shift) => shift.at > (nav?.loadEventEnd ?? 0) && !fontSwap(shift.at))
          .reduce((sum, shift) => sum + shift.value, 0);
      });
      expect(late).toBeLessThan(0.01);
    });
  });
});
