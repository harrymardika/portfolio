import { assumeGpu, disableWebGL, SCENE_READY_TIMEOUT } from './helpers';
import { expect, test } from '@playwright/test';

const stage = '[data-room-stage]';
const prints = '[data-room-slot="hero"]';

test('the hero shows the name, role, headline, tagline, actions, and three stats from profile.yaml', async ({
  page,
}) => {
  await page.goto('/');
  const hero = page.locator('section[aria-labelledby="hero-title"]');

  // D19: the owner's name is the H1; the headline follows as plain text (no accent color).
  await expect(hero.getByRole('heading', { level: 1 })).toHaveText('Harry Mardika');
  await expect(hero.getByText('AI Product Manager in Jakarta')).toBeVisible();
  await expect(hero.getByText("Let's build something useful.", { exact: true })).toBeVisible();
  await expect(hero.getByRole('link', { name: 'Download CV' })).toHaveAttribute(
    'href',
    '/downloads/Harry-Mardika-CV-EN.pdf',
  );
  await expect(hero.getByRole('link', { name: 'Portfolio PDF' })).toHaveAttribute(
    'href',
    '/downloads/Harry-Mardika-Portfolio-EN.pdf',
  );
  await expect(hero.locator('dl dd')).toHaveCount(3);
  await expect(hero.locator('dl dd').first()).toHaveText('months from idea to commercial launch at Decklify');
  await expect(hero.getByRole('img', { name: 'Photo of Harry Mardika' })).toBeVisible();
});

test('the hero is translated on /id/', async ({ page }) => {
  await page.goto('/id/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Harry Mardika');
  await expect(page.getByText('AI Product Manager di Jakarta')).toBeVisible();
  await expect(page.getByText('Mari membangun sesuatu yang bermanfaat.', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Unduh CV' })).toHaveAttribute(
    'href',
    '/downloads/Harry-Mardika-CV-ID.pdf',
  );
  await expect(page.getByRole('img', { name: 'Foto Harry Mardika' })).toBeVisible();
});

test('the 3D prints take over from the flat ones once ready, without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));

  await assumeGpu(page);
  // `astro preview` has no assistant service; without this its health check logs a 404 (T11.4).
  await page.route('**/api/ask/health', (route) => route.fulfill({ json: { ok: true, enabled: false } }));
  await page.goto('/');
  await expect(page.locator(stage)).toHaveAttribute('data-scene', 'animated');
  await expect(page.locator(stage)).toHaveAttribute('data-scene-ready', 'true', {
    timeout: SCENE_READY_TIMEOUT,
  });
  await expect(page.locator(stage)).toHaveCSS('opacity', '1');
  await expect(page.locator(prints)).toHaveAttribute('data-room-ready', 'true');
  await expect(page.locator(`${prints} [data-print="photo"]`)).toHaveCSS('opacity', '0');
  await expect(page.locator(`${prints} [data-print="sheet"]`)).toHaveCSS('opacity', '0');
  await expect(page.getByRole('button', { name: 'Play again' })).toBeVisible();
  // The photo stays in the accessibility tree for screen readers.
  await expect(page.getByRole('img', { name: 'Photo of Harry Mardika' })).toBeAttached();
  expect(errors).toEqual([]);
});

/** Script requests that belong to the 3D (three.js, the scene core, the room and its parts). */
const threeScripts = (urls: string[]) => urls.filter((url) => /three|mount|room|parts|hero\./.test(url));

test('without a GPU (headless Chromium renders WebGL on the CPU) the flat prints stay', async ({ page }) => {
  const scripts: string[] = [];
  page.on('request', (request) => request.resourceType() === 'script' && scripts.push(request.url()));
  await page.goto('/');
  await page.waitForLoadState('load');
  await expect(page.locator(stage)).toHaveAttribute('data-scene', 'off');
  await expect(page.locator(`${prints} [data-print="photo"]`)).toHaveCSS('opacity', '1');
  await expect(page.getByRole('button', { name: 'Play again' })).toBeHidden();
  expect(threeScripts(scripts)).toEqual([]);
});

test('reduced motion renders the finished prints without the replay button', async ({ page }) => {
  await assumeGpu(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator(stage)).toHaveAttribute('data-scene', 'still');
  await expect(page.locator(stage)).toHaveAttribute('data-scene-ready', 'true', {
    timeout: SCENE_READY_TIMEOUT,
  });
  await expect(page.getByRole('button', { name: 'Play again' })).toBeHidden();
});

test('without WebGL the flat prints stay and three.js is never downloaded', async ({ page }) => {
  await disableWebGL(page);
  const scripts: string[] = [];
  page.on('request', (request) => request.resourceType() === 'script' && scripts.push(request.url()));

  await page.goto('/');
  await page.waitForLoadState('load');
  await expect(page.locator(stage)).toHaveAttribute('data-scene', 'off');
  await expect(page.locator(`${prints} [data-print="sheet"]`)).toHaveCSS('opacity', '1');
  expect(threeScripts(scripts)).toEqual([]);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('both prints and their detection labels are fully visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(`${prints} [data-print="photo"]`)).toHaveCSS('opacity', '1');
    await expect(page.getByRole('img', { name: 'Photo of Harry Mardika' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Harry Mardika written in Javanese script' })).toBeVisible();
    await expect(page.locator(`${prints} .box`)).toHaveCount(6);
  });
});

test('largest contentful paint stays under 2.5 s', async ({ page }) => {
  await page.goto('/');
  const lcp = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries[entries.length - 1]?.startTime ?? 0);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      }),
  );
  expect(lcp).toBeGreaterThan(0);
  expect(lcp).toBeLessThan(2500);
});

test('every download button points at a PDF that exists and downloads with its file name', async ({
  page,
  request,
}) => {
  for (const path of ['/', '/id/', '/about/', '/id/about/']) {
    await page.goto(path);
    const links = page.locator('main a[data-download]');
    await expect(links).toHaveCount(2);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute('download', '');
      const href = await link.getAttribute('href');
      const response = await request.get(href ?? '');
      expect(response.status(), href ?? '').toBe(200);
      expect(response.headers()['content-type']).toContain('pdf');
    }
  }
});

test('the hero download starts a real file download', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Download events are the same on mobile');
  await page.goto('/');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: 'Download CV' }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('Harry-Mardika-CV-EN.pdf');
});

test('on desktop the LCP element is one of the hero prints, loaded eagerly with high priority', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'On phones the text block above the prints is the largest element');
  await page.goto('/');
  // Read the LCP only once both prints have loaded and painted; earlier, the heading is the largest
  // element painted so far and the result would depend on timing.
  await page.waitForFunction(
    (selector) =>
      [...document.querySelectorAll<HTMLImageElement>(`${selector} img`)].every((img) => img.complete),
    prints,
  );
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  const source = await page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries() as (PerformanceEntry & { element?: Element | null })[];
          const element = entries[entries.length - 1]?.element;
          resolve(element instanceof HTMLImageElement ? element.currentSrc : (element?.tagName ?? ''));
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      }),
  );
  expect(source).toMatch(/aksara-sheet|profile/);
  for (const image of await page.locator(`${prints} img`).all()) {
    await expect(image).toHaveAttribute('fetchpriority', 'high');
    await expect(image).toHaveAttribute('loading', 'eager');
  }
});
