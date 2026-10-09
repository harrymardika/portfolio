/**
 * The "Leave a message" form (T12.2, ADR 0017). `astro preview` has no stats service, so /api/messages
 * is mocked; nothing here stores a message.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Request } from '@playwright/test';

import { UI } from '../../src/lib/i18n/ui';

const MESSAGE = 'Harry turned a messy dataset into a model our team actually used every week.';

/** Answer every post with the given reply and record the requests. */
async function mockMessages(page: Page, reply: { status: number; body?: unknown; location?: string }) {
  const posts: Request[] = [];
  await page.route('**/api/messages', async (route) => {
    posts.push(route.request());
    if (reply.location) {
      await route.fulfill({ status: 303, headers: { location: reply.location } });
      return;
    }
    await route.fulfill({ status: reply.status, json: reply.body ?? {} });
  });
  return posts;
}

async function fillForm(page: Page, locale: 'en' | 'id' = 'en'): Promise<void> {
  const t = UI[locale];
  await page.getByLabel(t['messages.form.name'], { exact: true }).fill('Rina Wijaya');
  await page.getByLabel(/^(How you know|Hubungan Anda dengan)/).fill('My manager at Example Co');
  await page.getByLabel(t['messages.form.message'], { exact: true }).fill(MESSAGE);
  await page.getByRole('checkbox').check();
}

test('the form posts JSON and opens the thank-you page', async ({ page }) => {
  const posts = await mockMessages(page, { status: 201, body: { ok: true } });
  await page.goto('/messages/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(UI.en['messages.form.title']);
  await fillForm(page);
  await page.getByRole('button', { name: UI.en['messages.form.submit'] }).click();
  await expect(page).toHaveURL(/\/messages\/sent\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(UI.en['messages.sent.title']);
  expect(posts[0]?.postDataJSON()).toEqual({
    lang: 'en',
    name: 'Rina Wijaya',
    role: '',
    relationship: 'My manager at Example Co',
    message: MESSAGE,
    link: '',
    hp_field: '',
    consent: true,
  });
});

test('fields the service refused are marked and described, the first one focused', async ({ page }) => {
  await mockMessages(page, { status: 400, body: { error: 'invalid', problems: { message: 'contact' } } });
  await page.goto('/messages/');
  await fillForm(page);
  await page.getByRole('button', { name: UI.en['messages.form.submit'] }).click();
  const message = page.getByLabel(UI.en['messages.form.message'], { exact: true });
  await expect(message).toHaveAttribute('aria-invalid', 'true');
  await expect(message).toBeFocused();
  await expect(message).toHaveAccessibleDescription(new RegExp(UI.en['messages.form.error.contact']));
  await expect(page.getByRole('status')).toHaveText(UI.en['messages.form.error.general']);
  // The next try clears the marks.
  await page.unroute('**/api/messages');
  await mockMessages(page, { status: 429, body: { error: 'limit' } });
  await page.getByRole('button', { name: UI.en['messages.form.submit'] }).click();
  await expect(page.getByRole('status')).toHaveText(UI.en['messages.form.error.limit']);
  await expect(message).not.toHaveAttribute('aria-invalid', 'true');
});

test('focus goes to the topmost refused field, and other failures say to try later', async ({ page }) => {
  await mockMessages(page, {
    status: 400,
    body: { error: 'invalid', problems: { message: 'too-short', name: 'contact' } },
  });
  await page.goto('/messages/');
  await fillForm(page);
  await page.getByRole('button', { name: UI.en['messages.form.submit'] }).click();
  await expect(page.getByLabel(UI.en['messages.form.name'], { exact: true })).toBeFocused();
  await page.unroute('**/api/messages');
  await mockMessages(page, { status: 403, body: { error: 'forbidden' } });
  await page.getByRole('button', { name: UI.en['messages.form.submit'] }).click();
  await expect(page.getByRole('status')).toHaveText(UI.en['messages.form.error.failed']);
});

test('a second submit while the first is on its way sends nothing', async ({ page }) => {
  const posts: unknown[] = [];
  await page.route('**/api/messages', async (route) => {
    posts.push(route.request().postData());
    await new Promise((resolve) => setTimeout(resolve, 600));
    await route.fulfill({ status: 201, json: { ok: true } });
  });
  await page.goto('/messages/');
  await fillForm(page);
  const name = page.getByLabel(UI.en['messages.form.name'], { exact: true });
  await name.press('Enter');
  await name.press('Enter');
  await expect(page).toHaveURL(/\/messages\/sent\/$/);
  expect(posts).toHaveLength(1);
});

test('the Indonesian form counts characters and posts in Indonesian', async ({ page }) => {
  const posts = await mockMessages(page, { status: 201, body: { ok: true } });
  await page.goto('/id/messages/');
  await fillForm(page, 'id');
  await expect(
    page.getByText(
      UI.id['messages.form.count'].replace('{count}', String(MESSAGE.length)).replace('{max}', '600'),
    ),
  ).toBeVisible();
  await page.getByRole('button', { name: UI.id['messages.form.submit'] }).click();
  await expect(page).toHaveURL(/\/id\/messages\/sent\/$/);
  expect(posts[0]?.postDataJSON()).toMatchObject({ lang: 'id' });
});

test('the honeypot is hidden from people and assistive technology', async ({ page }) => {
  await page.goto('/messages/');
  await expect(page.getByRole('textbox', { name: UI.en['messages.form.honeypot'] })).toHaveCount(0);
  await expect(page.locator('#msg-hp')).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('#msg-hp')).not.toBeInViewport();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('a plain form post lands on the page the service names', async ({ page }) => {
    const posts = await mockMessages(page, { status: 303, location: '/messages/not-sent/' });
    await page.goto('/messages/');
    await fillForm(page);
    await page.getByRole('button', { name: UI.en['messages.form.submit'] }).click();
    await expect(page).toHaveURL(/\/messages\/not-sent\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(UI.en['messages.notSent.title']);
    const form = new URLSearchParams(posts[0]?.postData() ?? '');
    expect([form.get('lang'), form.get('consent'), form.get('name')]).toEqual(['en', 'on', 'Rina Wijaya']);
  });
});

test('the result pages stay out of search engines, the form does not', async ({ page }) => {
  for (const path of ['/messages/sent/', '/id/messages/not-sent/']) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  }
  await page.goto('/messages/');
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});

test('the home page and the footer link to the form', async ({ page }) => {
  await page.goto('/');
  const section = page.getByRole('region', { name: UI.en['messages.title'] });
  await expect(section.getByRole('link', { name: UI.en['messages.leave'] })).toHaveAttribute(
    'href',
    '/messages/',
  );
  await expect(
    page.getByRole('contentinfo').getByRole('link', { name: UI.en['messages.leave'] }),
  ).toHaveAttribute('href', '/messages/');
  await page.goto('/id/');
  await expect(
    page.getByRole('contentinfo').getByRole('link', { name: UI.id['messages.leave'] }),
  ).toHaveAttribute('href', '/id/messages/');
});

for (const colorScheme of ['light', 'dark'] as const) {
  test(`the form and its errors have no serious accessibility violations (${colorScheme})`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme });
    await mockMessages(page, {
      status: 400,
      body: { error: 'invalid', problems: { name: 'too-short', link: 'link', consent: 'consent' } },
    });
    await page.goto('/messages/');
    await fillForm(page);
    await page.getByRole('button', { name: UI.en['messages.form.submit'] }).click();
    await expect(page.getByRole('status')).not.toBeEmpty();
    const results = await new AxeBuilder({ page }).include('main').analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}
