/**
 * Crawls every page reachable from both home pages and checks that each internal link,
 * image, and stylesheet resolves. Catches broken navigation, wrong locale paths, and
 * missing assets anywhere on the site.
 */
import { expect, test } from '@playwright/test';

test('every internal link and asset on the site resolves', async ({ page, request, baseURL }) => {
  test.skip(test.info().project.name !== 'desktop', 'One crawl is enough');
  test.setTimeout(120_000);

  const origin = new URL(baseURL ?? 'http://localhost').origin;
  const toVisit = ['/', '/id/'];
  const visited = new Set<string>();
  const checked = new Map<string, number>();
  const broken: string[] = [];

  while (toVisit.length > 0) {
    const path = toVisit.shift() as string;
    if (visited.has(path)) continue;
    visited.add(path);

    const response = await page.goto(path);
    if (response?.status() !== 200) {
      broken.push(`${path} → ${response?.status()}`);
      continue;
    }

    const urls = await page.$$eval(
      'a[href], img[src], link[rel="stylesheet"][href], link[rel="icon"][href]',
      (els) => els.map((el) => (el as HTMLAnchorElement).href || (el as HTMLImageElement).src),
    );
    for (const raw of urls) {
      const url = new URL(raw);
      if (url.origin !== origin) continue; // External links are not crawled.
      const target = url.pathname;
      if (!checked.has(target)) {
        const status = (await request.get(target)).status();
        checked.set(target, status);
        if (status !== 200) broken.push(`${path} links to ${target} → ${status}`);
      }
      const isPage = target.endsWith('/') && !target.startsWith('/_astro/');
      if (isPage && checked.get(target) === 200 && !visited.has(target)) toVisit.push(target);
    }
  }

  expect(broken).toEqual([]);
  // Sanity check that the crawl actually explored the site in both languages.
  expect([...visited].filter((p) => p.startsWith('/id/')).length).toBeGreaterThan(4);
  expect(visited.size).toBeGreaterThan(10);
});
