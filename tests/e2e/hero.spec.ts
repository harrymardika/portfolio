import { expect, test } from '@playwright/test';

const stage = '[data-photo-card]';

test('the hero shows the headline, tagline, actions, and three stats from profile.yaml', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('section[aria-labelledby="hero-title"]');

  await expect(hero.getByRole('heading', { level: 1 })).toHaveText(
    /Harry Mardika: Let's build something useful\./,
  );
  await expect(hero.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', /^mailto:/);
  await expect(hero.getByRole('link', { name: 'LinkedIn profile' })).toHaveAttribute('href', /linkedin\.com/);
  await expect(hero.locator('dl dd')).toHaveCount(3);
  await expect(hero.getByRole('img', { name: 'Photo of Harry Mardika' })).toBeVisible();
});

test('the hero is translated on /id/', async ({ page }) => {
  await page.goto('/id/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Mari membangun sesuatu yang bermanfaat.',
  );
  await expect(page.getByRole('link', { name: 'Hubungi saya' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Foto Harry Mardika' })).toBeVisible();
});

test('the 3D card replaces the static card once ready, without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page.locator(stage)).toHaveAttribute('data-scene', 'animated');
  await expect(page.locator(stage)).toHaveAttribute('data-scene-ready', 'true', { timeout: 15_000 });
  await expect(page.locator(`${stage} canvas`)).toHaveCSS('opacity', '1');
  await expect(page.locator(`${stage} .static-card`)).toHaveCSS('opacity', '0');
  expect(errors).toEqual([]);
});

test('reduced motion renders a still 3D frame', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator(stage)).toHaveAttribute('data-scene', 'still');
  await expect(page.locator(stage)).toHaveAttribute('data-scene-ready', 'true', { timeout: 15_000 });
});

test('without WebGL the static card stays and three.js is never downloaded', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...rest: unknown[]
    ) {
      return type.startsWith('webgl') ? null : original.call(this, type as '2d', ...(rest as []));
    } as typeof original;
  });
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
