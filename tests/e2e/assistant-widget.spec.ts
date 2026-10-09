/**
 * The "Ask Harry" corner chat (T11.4). `astro preview` has no assistant service, so every test mocks
 * /api/ask/health and /api/ask; nothing here calls a real model.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Route } from '@playwright/test';

import { UI } from '../../src/lib/i18n/ui';

import type { EventPayload } from '../../src/lib/stats/events';

type Reply = { status: number; body: unknown };

/** Turn the feature on (or off) and answer each question with the next reply; returns the request bodies. */
async function mockAssistant(page: Page, replies: Reply[] = [], enabled = true): Promise<unknown[]> {
  const asked: unknown[] = [];
  await page.route('**/api/ask/health', (route) => route.fulfill({ json: { ok: true, enabled } }));
  await page.route('**/api/ask', async (route: Route) => {
    asked.push(JSON.parse(route.request().postData() ?? 'null'));
    const reply = replies.shift() ?? { status: 503, body: { error: 'unavailable' } };
    await route.fulfill({ status: reply.status, json: reply.body });
  });
  return asked;
}

const answer = (text: string, links: { href: string; label: string }[] = []): Reply => ({
  status: 200,
  body: { answer: text, links },
});

const openButton = (page: Page, locale: 'en' | 'id' = 'en') =>
  page.getByRole('button', { name: UI[locale]['ask.open'] });
const panel = (page: Page, locale: 'en' | 'id' = 'en') =>
  page.getByRole('dialog', { name: UI[locale]['ask.title'] });

async function openChat(page: Page, path = '/', locale: 'en' | 'id' = 'en'): Promise<void> {
  await page.goto(path);
  await openButton(page, locale).click();
  await expect(panel(page, locale)).toBeVisible();
}

async function ask(page: Page, question: string, locale: 'en' | 'id' = 'en'): Promise<void> {
  await page.getByRole('textbox', { name: UI[locale]['ask.label'] }).fill(question);
  await page.keyboard.press('Enter');
}

test('stays hidden while the assistant is off', async ({ page }) => {
  await mockAssistant(page, [], false);
  const health = page.waitForResponse('**/api/ask/health');
  await page.goto('/');
  await health;
  await page.waitForTimeout(200);
  await expect(openButton(page)).toBeHidden();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('shows no chat button', async ({ page }) => {
    await page.goto('/');
    await expect(openButton(page)).toBeHidden();
  });
});

test('answers in the page language with links to its pages, and sends the question as data', async ({
  page,
  isMobile,
}) => {
  const asked = await mockAssistant(page, [
    answer('Harry adalah AI Product Manager.', [{ href: '/id/about/', label: 'Tentang' }]),
  ]);
  await openChat(page, '/id/', 'id');
  // Phones start at the chat log, so the on-screen keyboard does not cover the sheet.
  await expect(
    isMobile ? page.getByRole('log') : page.getByRole('textbox', { name: UI.id['ask.label'] }),
  ).toBeFocused();
  await ask(page, 'Apa pekerjaan Harry?', 'id');
  const log = page.getByRole('log');
  await expect(log).toContainText('Harry adalah AI Product Manager.');
  await expect(log.getByRole('link', { name: 'Tentang' })).toHaveAttribute('href', '/id/about/');
  expect(asked).toEqual([{ question: 'Apa pekerjaan Harry?', lang: 'id', history: [] }]);
});

test('an example question is sent with one click', async ({ page }) => {
  const asked = await mockAssistant(page, [answer('He builds AI products.')]);
  await openChat(page);
  await page.getByRole('button', { name: UI.en['ask.example1'] }).click();
  await expect(page.getByRole('log')).toContainText('He builds AI products.');
  expect(asked).toEqual([{ question: UI.en['ask.example1'], lang: 'en', history: [] }]);
  await expect(page.getByRole('button', { name: UI.en['ask.example1'] })).toBeHidden();
});

test('keeps the privacy notice behind a small Privacy toggle', async ({ page }) => {
  await mockAssistant(page);
  await openChat(page, '/id/', 'id');
  const notice = panel(page, 'id').getByText(UI.id['ask.privacy']);
  await expect(notice).toBeHidden();
  await panel(page, 'id').locator('summary', { hasText: UI.id['ask.privacyLabel'] }).click();
  await expect(notice).toBeVisible();
});

test('offers the CV and email when the assistant cannot answer, and explains the limit', async ({ page }) => {
  await mockAssistant(page, [
    { status: 503, body: { error: 'unavailable' } },
    { status: 429, body: { error: 'limit' } },
  ]);
  await openChat(page);
  await ask(page, 'First question');
  const log = page.getByRole('log');
  await expect(log).toContainText(UI.en['ask.fallback']);
  await expect(log.getByRole('link', { name: UI.en['download.cv'] })).toHaveAttribute('href', /\.pdf$/);
  await expect(log.getByRole('link', { name: UI.en['ask.email'] })).toHaveAttribute('href', /^mailto:/);
  await ask(page, 'Second question');
  await expect(log).toContainText(UI.en['ask.limit']);
});

test('keeps the conversation across pages in the same tab, and clears it on request', async ({ page }) => {
  const asked = await mockAssistant(page, [answer('First answer.'), answer('Second answer.')]);
  await openChat(page);
  await ask(page, 'First question');
  await expect(page.getByRole('log')).toContainText('First answer.');

  await openChat(page, '/about/');
  await expect(page.getByRole('log')).toContainText('First question');
  await ask(page, 'Follow-up');
  await expect(page.getByRole('log')).toContainText('Second answer.');
  expect((asked[1] as { history: unknown[] }).history).toEqual([
    { role: 'visitor', text: 'First question' },
    { role: 'assistant', text: 'First answer.' },
  ]);

  await page.getByRole('button', { name: UI.en['ask.clear'] }).click();
  await expect(page.getByRole('log')).not.toContainText('First question');
  await page.reload();
  await openButton(page).click();
  await expect(page.getByRole('log')).not.toContainText('Follow-up');
});

test('closes with Escape or the close button and returns focus to the chat button', async ({ page }) => {
  await mockAssistant(page);
  await openChat(page);
  await page.keyboard.press('Escape');
  await expect(panel(page)).toBeHidden();
  await expect(openButton(page)).toBeFocused();
  await expect(openButton(page)).toHaveAttribute('aria-expanded', 'false');

  await openButton(page).click();
  await page.getByRole('button', { name: UI.en['ask.close'] }).click();
  await expect(panel(page)).toBeHidden();
  await expect(openButton(page)).toBeFocused();
});

test('reports how a question ended to the stats beacon, never its text', async ({ page }) => {
  const events: EventPayload[] = [];
  await page.addInitScript(() => localStorage.setItem('stats:debug', '1'));
  await page.route('**/api/stats/event', async (route) => {
    events.push(JSON.parse(route.request().postData() ?? '{}') as EventPayload);
    await route.fulfill({ status: 204 });
  });
  await mockAssistant(page, [answer('Yes.')]);
  await openChat(page);
  await ask(page, 'A private question');
  await expect
    .poll(() => events.filter((e) => e.type === 'ask'))
    .toEqual([{ type: 'ask', path: '/', lang: 'en', detail: 'answered' }]);
  expect(JSON.stringify(events)).not.toContain('A private question');
});

test('is a bottom sheet on phones and keeps the end of the page clear of the button', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Phone layout');
  await mockAssistant(page);
  await page.goto('/');
  await expect(openButton(page)).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.body).paddingBottom)).toBe('72px');
  await openButton(page).click();
  const box = await panel(page).boundingBox();
  const viewport = page.viewportSize();
  expect(box?.width).toBe(viewport?.width);
  expect(Math.round((box?.y ?? 0) + (box?.height ?? 0))).toBe(viewport?.height);
});

test('print pages have no chat', async ({ page }) => {
  await mockAssistant(page);
  await page.goto('/print/cv/');
  await expect(page.locator('[data-ask]')).toHaveCount(0);
});

for (const colorScheme of ['light', 'dark'] as const) {
  test(`the open chat has no serious accessibility violations (${colorScheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await mockAssistant(page, [answer('Harry builds AI products.', [{ href: '/about/', label: 'About' }])]);
    await openChat(page);
    await ask(page, 'What does Harry do?');
    await expect(page.getByRole('log')).toContainText('Harry builds AI products.');
    const results = await new AxeBuilder({ page }).include('[data-ask]').analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}
