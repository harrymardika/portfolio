/**
 * The owner's private review queue (T12.3, ADR 0017). The stats service is mocked: these tests check the
 * page, never a real queue.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { UI } from '../../src/lib/i18n/ui';

const TOKEN = 'owner-token-for-tests';
const t = UI.en;

interface Queued {
  id: string;
  createdAt: string;
  lang: string;
  name: string;
  role: string | null;
  relationship: string;
  message: string;
  link: string | null;
}

const queued = (id: string, extra: Partial<Queued> = {}): Queued => ({
  id,
  createdAt: '2026-10-09T03:00:00.000Z',
  lang: 'en',
  name: 'Rina Wijaya',
  role: 'Data Lead, Example Co',
  relationship: 'My manager at Example Co',
  message: 'Harry turned a messy dataset into a model\nour team actually used.',
  link: 'https://www.linkedin.com/in/rina-wijaya',
  ...extra,
});

/** A fake queue behind the token: pending and approved lists, approve and reject. */
async function mockQueue(page: Page, pending: Queued[], approved: Queued[] = []) {
  const actions: { path: string; auth: string | null }[] = [];
  const authorized = (auth: string | null) => auth === `Bearer ${TOKEN}`;
  await page.route('**/api/messages/**', async (route) => {
    const request = route.request();
    const auth = request.headers()['authorization'] ?? null;
    if (!authorized(auth)) return route.fulfill({ status: 401, json: { error: 'unauthorized' } });
    const path = new URL(request.url()).pathname;
    if (path === '/api/messages/pending') return route.fulfill({ json: { messages: pending } });
    if (path === '/api/messages/approved') return route.fulfill({ json: { messages: approved } });
    const match = /^\/api\/messages\/([^/]+)\/(approve|reject)$/.exec(path);
    if (request.method() !== 'POST' || !match) return route.fulfill({ status: 404, json: {} });
    actions.push({ path, auth });
    const index = pending.findIndex((m) => m.id === match[1]);
    const [message] = pending.splice(index, 1);
    if (match[2] === 'approve' && message) approved.push(message);
    return route.fulfill({ json: { ok: true } });
  });
  return actions;
}

async function openQueue(page: Page, token = TOKEN): Promise<void> {
  await page.goto('/messages/review/');
  await page.getByLabel(t['messages.review.token']).fill(token);
  await page.getByRole('button', { name: t['messages.review.open'] }).click();
}

test('opens the queue with the token and shows each message as plain text', async ({ page }) => {
  await mockQueue(page, [
    queued('aaaaaaaaaaaaaaaa'),
    queued('bbbbbbbbbbbbbbbb', {
      name: '<img src=x onerror="window.pwned=1">',
      role: null,
      link: 'javascript:alert(1)',
      lang: 'id',
    }),
  ]);
  await openQueue(page);
  const list = page.locator('[data-review-list]');
  await expect(list.getByRole('heading', { level: 2 })).toHaveText([
    'Rina Wijaya',
    '<img src=x onerror="window.pwned=1">',
  ]);
  await expect(list.locator('img')).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { pwned?: number }).pwned)).toBeUndefined();
  // Only an https profile becomes a link.
  await expect(list.getByRole('link')).toHaveCount(1);
  await expect(list.getByRole('link')).toHaveAttribute('href', 'https://www.linkedin.com/in/rina-wijaya');
  await expect(list.getByText('javascript:alert(1)')).toBeVisible();
  await expect(
    page.getByText(t['messages.review.summary'].replace('{pending}', '2').replace('{approved}', '0')),
  ).toBeVisible();
  // The token stays for this tab: a reload opens the queue without asking again.
  await page.reload();
  await expect(list.getByRole('heading', { level: 2 })).toHaveCount(2);
  await expect(page.getByLabel(t['messages.review.token'])).toBeHidden();
});

test('approves and rejects only after a confirmation, sending the token', async ({ page }) => {
  const actions = await mockQueue(page, [
    queued('aaaaaaaaaaaaaaaa'),
    queued('bbbbbbbbbbbbbbbb', { name: 'Budi' }),
  ]);
  await openQueue(page);
  const list = page.locator('[data-review-list]');

  page.once('dialog', (dialog) => void dialog.dismiss());
  await list.getByRole('button', { name: t['messages.review.reject'] }).first().click();
  await expect(list.locator('li')).toHaveCount(2);
  expect(actions).toEqual([]);

  page.once('dialog', (dialog) => {
    expect(dialog.message()).toContain('Rina Wijaya');
    void dialog.accept();
  });
  await list.getByRole('button', { name: t['messages.review.approve'] }).first().click();
  await expect(page.getByRole('status')).toHaveText(t['messages.review.approved']);
  await expect(list.locator('li')).toHaveCount(1);

  page.once('dialog', (dialog) => void dialog.accept());
  await list.getByRole('button', { name: t['messages.review.reject'] }).click();
  await expect(page.getByRole('status')).toHaveText(t['messages.review.rejected']);
  await expect(list.locator('li')).toHaveCount(0);
  await expect(
    page.getByText(t['messages.review.summary'].replace('{pending}', '0').replace('{approved}', '1')),
  ).toBeVisible();
  expect(actions).toEqual([
    { path: '/api/messages/aaaaaaaaaaaaaaaa/approve', auth: `Bearer ${TOKEN}` },
    { path: '/api/messages/bbbbbbbbbbbbbbbb/reject', auth: `Bearer ${TOKEN}` },
  ]);
});

test('focus moves to the next message after an action, and the summary says when none is left', async ({
  page,
}) => {
  await mockQueue(page, [queued('aaaaaaaaaaaaaaaa'), queued('bbbbbbbbbbbbbbbb', { name: 'Budi' })]);
  await openQueue(page);
  const list = page.locator('[data-review-list]');
  await expect(list.getByRole('heading', { name: 'Rina Wijaya' })).toBeFocused();
  // Each button names its writer for screen readers.
  await expect(
    list.getByRole('button', { name: t['messages.review.approve'] }).first(),
  ).toHaveAccessibleDescription('Rina Wijaya');
  page.on('dialog', (dialog) => void dialog.accept());
  await list.getByRole('button', { name: t['messages.review.approve'] }).first().click();
  await expect(list.getByRole('heading', { name: 'Budi' })).toBeFocused();
  await list.getByRole('button', { name: t['messages.review.reject'] }).click();
  await expect(page.locator('[data-review-summary]')).toBeFocused();
  await expect(page.locator('[data-review-summary]')).toContainText(t['messages.review.empty']);
});

test('a message handled elsewhere disappears; a failed action can be tried again', async ({ page }) => {
  await mockQueue(page, [queued('aaaaaaaaaaaaaaaa'), queued('bbbbbbbbbbbbbbbb', { name: 'Budi' })]);
  await openQueue(page);
  const list = page.locator('[data-review-list]');
  await page.route('**/api/messages/aaaaaaaaaaaaaaaa/approve', (route) =>
    route.fulfill({ status: 404, json: {} }),
  );
  await page.route('**/api/messages/bbbbbbbbbbbbbbbb/reject', (route) =>
    route.fulfill({ status: 500, json: {} }),
  );
  page.on('dialog', (dialog) => void dialog.accept());
  await list.getByRole('button', { name: t['messages.review.approve'] }).first().click();
  await expect(page.getByRole('status')).toHaveText(t['messages.review.gone']);
  await expect(list.locator('li')).toHaveCount(1);
  await list.getByRole('button', { name: t['messages.review.reject'] }).click();
  await expect(page.getByRole('status')).toHaveText(t['messages.review.actionFailed']);
  await expect(list.getByRole('button', { name: t['messages.review.reject'] })).toBeEnabled();
});

test('forgetting the token clears it and returns to the token field', async ({ page }) => {
  await mockQueue(page, [queued('aaaaaaaaaaaaaaaa')]);
  await openQueue(page);
  await page.getByRole('button', { name: t['messages.review.forget'] }).click();
  await expect(page.getByLabel(t['messages.review.token'])).toBeFocused();
  await expect(page.locator('[data-review-list] li')).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem('kindWordsToken'))).toBeNull();
});

test('a wrong token is refused and forgotten', async ({ page }) => {
  await mockQueue(page, [queued('aaaaaaaaaaaaaaaa')]);
  await openQueue(page, 'wrong');
  await expect(page.getByRole('status')).toHaveText(t['messages.review.badToken']);
  await expect(page.getByLabel(t['messages.review.token'])).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('kindWordsToken'))).toBeNull();
});

test('the page is private: noindex, disallowed for robots, and not counted', async ({ page, request }) => {
  const events: string[] = [];
  await page.addInitScript(() => localStorage.setItem('stats:debug', '1'));
  await page.route('**/api/stats/event', async (route) => {
    events.push(route.request().postData() ?? '');
    await route.fulfill({ status: 204 });
  });
  await mockQueue(page, []);
  await page.goto('/id/messages/review/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(UI.id['messages.review.title']);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await page.waitForTimeout(500);
  expect(events).toEqual([]);
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /messages/review/');
  expect(robots).toContain('Disallow: /id/messages/review/');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('messages/review');
});

for (const colorScheme of ['light', 'dark'] as const) {
  test(`the open queue has no serious accessibility violations (${colorScheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await mockQueue(page, [queued('aaaaaaaaaaaaaaaa')]);
    await openQueue(page);
    await expect(page.locator('[data-review-list] li')).toHaveCount(1);
    // The card buttons are made by the script, so they need the global styles to be proper touch targets.
    const approve = page.getByRole('button', { name: t['messages.review.approve'] });
    expect((await approve.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    const results = await new AxeBuilder({ page }).include('main').analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}
