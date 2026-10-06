import { disableWebGL, force3DMode, SCENE_READY_TIMEOUT } from './helpers';
import { expect, test } from '@playwright/test';

const stage = '[data-photo-card]';

test('the hero shows the headline, tagline, actions, and three stats from profile.yaml', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('section[aria-labelledby="hero-title"]');

  await expect(hero.getByRole('heading', { level: 1 })).toHaveText(
    /Harry Mardika: Let's build something useful\./,
  );
  await expect(hero.getByRole('link', { name: 'Download CV' })).toHaveAttribute(
    'href',
    '/downloads/Harry-Mardika-CV-EN.pdf',
  );
  await expect(hero.getByRole('link', { name: 'Portfolio PDF' })).toHaveAttribute(
    'href',
    '/downloads/Harry-Mardika-Portfolio-EN.pdf',
  );
  await expect(hero.locator('dl dd')).toHaveCount(3);
  await expect(hero.getByRole('img', { name: 'Photo of Harry Mardika' })).toBeVisible();
});

test('the hero is translated on /id/', async ({ page }) => {
  await page.goto('/id/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Mari membangun sesuatu yang bermanfaat.',
  );
  await expect(page.getByRole('link', { name: 'Unduh CV' })).toHaveAttribute(
    'href',
    '/downloads/Harry-Mardika-CV-ID.pdf',
  );
  await expect(page.getByRole('img', { name: 'Foto Harry Mardika' })).toBeVisible();
});

test('the 3D card replaces the static card once ready, without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));

  await force3DMode(page, 'animated');
  await page.goto('/');
  await expect(page.locator(stage)).toHaveAttribute('data-scene', 'animated');
  await expect(page.locator(stage)).toHaveAttribute('data-scene-ready', 'true', {
    timeout: SCENE_READY_TIMEOUT,
  });
  await expect(page.locator(`${stage} canvas`)).toHaveCSS('opacity', '1');
  await expect(page.locator(`${stage} .static-card`)).toHaveCSS('opacity', '0');
  expect(errors).toEqual([]);
});

test('WebGL without a GPU (headless Chromium uses SwiftShader) renders a still 3D frame', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator(stage)).toHaveAttribute('data-scene', 'still');
  await expect(page.locator(stage)).toHaveAttribute('data-scene-ready', 'true', {
    timeout: SCENE_READY_TIMEOUT,
  });
  await expect(page.locator(`${stage} canvas`)).toHaveCSS('opacity', '1');
});

test('reduced motion renders a still 3D frame', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator(stage)).toHaveAttribute('data-scene', 'still');
  await expect(page.locator(stage)).toHaveAttribute('data-scene-ready', 'true', {
    timeout: SCENE_READY_TIMEOUT,
  });
});

test('without WebGL the static card stays and three.js is never downloaded', async ({ page }) => {
  await disableWebGL(page);
  const scripts: string[] = [];
  page.on('request', (request) => request.resourceType() === 'script' && scripts.push(request.url()));

  await page.goto('/');
  await page.waitForLoadState('load');
  await expect(page.locator(stage)).toHaveAttribute('data-scene', 'off');
  await expect(page.locator(`${stage} .static-card`)).toHaveCSS('opacity', '1');
  expect(scripts.filter((url) => /mount|photo-card/.test(url))).toEqual([]);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the static card is fully visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(`${stage} .static-card`)).toBeVisible();
    await expect(page.locator(`${stage} .static-card`)).toHaveCSS('opacity', '1');
    await expect(page.getByRole('img', { name: 'Photo of Harry Mardika' })).toBeVisible();
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
