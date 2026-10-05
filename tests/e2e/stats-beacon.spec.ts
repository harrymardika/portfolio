/**
 * The e2e build has PUBLIC_STATS_ENABLED=true. The beacon skips localhost unless the debug flag is
 * set, so most tests stay silent; these tests set the flag and capture the requests.
 */
import { expect, test, type Page } from '@playwright/test';

import type { EventPayload } from '../../src/lib/stats/events';

async function captureEvents(page: Page, { debug = true } = {}): Promise<EventPayload[]> {
  const events: EventPayload[] = [];
  if (debug) await page.addInitScript(() => localStorage.setItem('stats:debug', '1'));
  await page.route('**/api/stats/event', async (route) => {
    events.push(JSON.parse(route.request().postData() ?? '{}') as EventPayload);
    await route.fulfill({ status: 204 });
  });
  return events;
}

test('sends one page view with the path, language, and tracking ref, without the query string', async ({
  page,
}) => {
  const events = await captureEvents(page);
  await page.goto('/id/?ref=acme-ml-engineer&utm_source=mail');
  await expect.poll(() => events.length).toBe(1);
  expect(events[0]).toEqual({ type: 'pageview', path: '/id/', lang: 'id', ref: 'acme-ml-engineer' });
});

test('records CV downloads and clicks on social profiles', async ({ page }) => {
  const events = await captureEvents(page);
  await page.goto('/');
  await expect.poll(() => events.length).toBe(1);
  // Stop the navigations so the test stays on the page.
  await page.route('**/downloads/**', (route) => route.fulfill({ status: 204 }));
  await page.route('https://www.linkedin.com/**', (route) => route.fulfill({ status: 204, body: '' }));
  await page.locator('a[data-download="cv"]').first().dispatchEvent('click');
  await page.locator('footer a[data-outbound="linkedin"]').dispatchEvent('click');
  await expect.poll(() => events.map((e) => e.type)).toEqual(['pageview', 'download', 'outbound']);
  expect(events[1]).toEqual({ type: 'download', path: '/', lang: 'en', detail: 'cv' });
  expect(events[2]).toEqual({ type: 'outbound', path: '/', lang: 'en', detail: 'linkedin' });
});

test('sends nothing from localhost without the debug flag', async ({ page }) => {
  const events = await captureEvents(page, { debug: false });
  await page.goto('/');
  await page.waitForTimeout(500);
  expect(events).toEqual([]);
});

test('respects Global Privacy Control', async ({ page }) => {
  const events = await captureEvents(page);
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'globalPrivacyControl', { get: () => true }),
  );
  await page.goto('/');
  await page.waitForTimeout(500);
  expect(events).toEqual([]);
});

test('print pages have no beacon', async ({ page }) => {
  const events = await captureEvents(page);
  await page.goto('/print/cv/');
  await page.waitForTimeout(500);
  expect(events).toEqual([]);
});
