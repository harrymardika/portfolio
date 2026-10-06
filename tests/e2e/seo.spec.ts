import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

/** Absolute production URLs in the HTML → paths on the server under test. */
const pathOf = (url: string): string => new URL(url).pathname;

async function jsonLd(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.map((block) => JSON.parse(block) as Record<string, unknown>);
}

/** JPEG size from its SOF0/SOF2 marker. */
async function jpegSize(
  request: APIRequestContext,
  path: string,
): Promise<{ width: number; height: number }> {
  const response = await request.get(path);
  expect(response.status(), path).toBe(200);
  expect(response.headers()['content-type']).toContain('image/jpeg');
  const bytes = await response.body();
  for (let i = 2; i < bytes.length - 8;) {
    const marker = bytes[i + 1] ?? 0;
    if (marker === 0xc0 || marker === 0xc2)
      return { height: bytes.readUInt16BE(i + 5), width: bytes.readUInt16BE(i + 7) };
    i += 2 + bytes.readUInt16BE(i + 2);
  }
  throw new Error(`${path} has no JPEG size marker`);
}

test('robots.txt allows crawling and points at the sitemap', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('User-agent: *');
  expect(robots).toContain('Disallow: /api/');
  expect(robots).toContain('Sitemap: https://harry.mardika.my.id/sitemap.xml');
});

test('the sitemap lists every public page in both languages and no utility pages', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => pathOf(match[1] ?? ''));
  for (const path of [
    '/',
    '/id/',
    '/about/',
    '/id/projects/',
    '/homelab/',
    '/projects/decklify/',
    '/id/projects/decklify/',
  ])
    expect(locs).toContain(path);
  expect(locs.filter((path) => /print|404|og-template/.test(path))).toEqual([]);
  expect(xml).toContain('hreflang="id" href="https://harry.mardika.my.id/id/about/"');
});

for (const path of ['/', '/id/about/', '/projects/decklify/']) {
  test(`${path} has its own 1200×630 social preview image`, async ({ page, request }) => {
    await page.goto(path);
    const image = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(image).toMatch(/\/og\/[a-z0-9-]+\.jpg$/);
    expect(await jpegSize(request, pathOf(image ?? ''))).toEqual({ width: 1200, height: 630 });
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  });
}

test('the home page describes the person and the website without the email', async ({ page, request }) => {
  await page.goto('/id/');
  const [person, website] = await jsonLd(page);
  expect(person).toMatchObject({
    '@type': 'Person',
    name: 'Harry Mardika',
    url: 'https://harry.mardika.my.id/id/',
  });
  expect(person?.['sameAs']).toContain('https://www.linkedin.com/in/harry-mardika/');
  expect(JSON.stringify(person)).not.toContain('@gmail');
  expect((await request.get(pathOf(String(person?.['image'])))).status()).toBe(200);
  expect(website).toMatchObject({
    '@type': 'WebSite',
    inLanguage: 'id-ID',
    author: { '@id': person?.['@id'] },
  });
});

test('a case study is a CreativeWork by the same person', async ({ page }) => {
  await page.goto('/projects/decklify/');
  const [work] = await jsonLd(page);
  expect(work).toMatchObject({
    '@type': 'CreativeWork',
    name: 'Decklify',
    author: { '@id': 'https://harry.mardika.my.id/#person' },
  });
});

test('utility pages share the home preview image and stay out of search', async ({ page }) => {
  await page.goto('/print/cv/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\/home\.jpg$/);
});
