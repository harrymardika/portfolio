import AxeBuilder from '@axe-core/playwright';
import { disableWebGL, force3DMode, SCENE_READY_TIMEOUT } from './helpers';
import { expect, test, type Page } from '@playwright/test';

const stage = '[data-journey-stage]';
const milestones = `${stage} [data-milestone]`;

async function scrollJourney(page: Page, fraction: number): Promise<void> {
  await page.evaluate((f) => {
    const section = document.querySelector('#journey');
    if (!section) throw new Error('#journey missing');
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(
      0,
      top - window.innerHeight * 0.75 + (window.innerHeight * 0.75 + section.clientHeight * 0.3) * f,
    );
  }, fraction);
}

const years = (page: Page) => page.locator(`${milestones} .label span:first-child`).allTextContents();

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('shows an accessible timeline, oldest first', async ({ page }) => {
    await page.goto('/');
    const list = page.locator(`${stage} ol`);
    await expect(list.getByRole('listitem')).toHaveCount(5);
    const shown = (await years(page)).map(Number);
    expect([...shown].sort((a, b) => a - b)).toEqual(shown);
  });

  test('opens and closes a milestone story with the Popover API', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Founder.*Read the story/ }).click();
    const dialog = page.getByRole('dialog', { name: 'Founder' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Decklify');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});

test('without WebGL the timeline stays and the 3D path is never downloaded', async ({ page }) => {
  await disableWebGL(page);
  const scripts: string[] = [];
  page.on('request', (request) => request.resourceType() === 'script' && scripts.push(request.url()));

  await page.goto('/');
  await scrollJourney(page, 0.3);
  await expect(page.locator(stage)).toHaveAttribute('data-scene', 'off');
  await expect(page.locator(`${stage} ol`).getByRole('listitem')).toHaveCount(5);
  await expect(page.locator(`${stage} canvas`)).toHaveCSS('opacity', '0');
  expect(scripts.filter((url) => /journey-path|mount/.test(url))).toEqual([]);
});

test('the 3D path places labels and reaches milestones as you scroll', async ({ page }) => {
  await force3DMode(page, 'animated');
  await page.goto('/');
  await scrollJourney(page, 0.2);
  await expect(page.locator(stage)).toHaveAttribute('data-scene-ready', 'true', {
    timeout: SCENE_READY_TIMEOUT,
  });
  await expect(page.locator(milestones).first()).toHaveAttribute('style', /--x:/);

  const reached = page.locator(`${milestones}[data-reached="true"]`);
  await scrollJourney(page, 0.1);
  await expect.poll(() => reached.count()).toBeLessThan(5);
  // Scrolling to the end (or the page bottom on short pages) reaches every milestone.
  await scrollJourney(page, 1);
  await expect.poll(() => reached.count()).toBe(5);
});

test('3D labels stay inside the stage and never cover the section text', async ({ page }) => {
  await page.goto('/');
  await scrollJourney(page, 0.6);
  await expect(page.locator(stage)).toHaveAttribute('data-scene-ready', 'true', {
    timeout: SCENE_READY_TIMEOUT,
  });
  await page.waitForTimeout(500);

  const stageBox = await page.locator(stage).boundingBox();
  const textBoxes = await Promise.all(
    ['#journey-title', '#journey h2 + p'].map((selector) => page.locator(selector).boundingBox()),
  );
  const labels = await page.locator(`${milestones} .label`).all();
  for (const label of labels) {
    const box = await label.boundingBox();
    if (!box || !stageBox) throw new Error('missing box');
    expect(box.x).toBeGreaterThanOrEqual(stageBox.x - 1);
    expect(box.x + box.width).toBeLessThanOrEqual(stageBox.x + stageBox.width + 1);
    for (const text of textBoxes) {
      if (!text) continue;
      const overlaps =
        box.x < text.x + text.width &&
        box.x + box.width > text.x &&
        box.y < text.y + text.height &&
        box.y + box.height > text.y;
      expect(overlaps).toBe(false);
    }
  }
});

test('reduced motion shows the whole path as completed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await scrollJourney(page, 0);
  await expect(page.locator(stage)).toHaveAttribute('data-scene', 'still');
  await expect(page.locator(stage)).toHaveAttribute('data-scene-ready', 'true', {
    timeout: SCENE_READY_TIMEOUT,
  });
  await expect(page.locator(`${milestones}[data-reached="false"]`)).toHaveCount(0);
});

for (const colorScheme of ['light', 'dark'] as const) {
  test(`the 3D journey has no serious accessibility violations (${colorScheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto('/');
    await scrollJourney(page, 0.3);
    await expect(page.locator(stage)).toHaveAttribute('data-scene-ready', 'true', {
      timeout: SCENE_READY_TIMEOUT,
    });
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page })
      .include('#journey')
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    const serious = results.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
    expect(serious).toEqual([]);
  });
}
