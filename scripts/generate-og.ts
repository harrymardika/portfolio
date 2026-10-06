#!/usr/bin/env bun
/**
 * Social preview images (1200×630 JPEG) for every page that declares its own og:image.
 * Runs after `astro build`: opens /og-template/ in headless Chromium once, fills in each page's
 * title, description, and language, and writes <outDir>/og/*.jpg (src/lib/seo/og.ts).
 *   bun run og                        uses BUILD_OUT_DIR or ./dist
 */
import { mkdir, readdir, readFile, rm, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { chromium } from '@playwright/test';
import { load } from 'js-yaml';

import { profileSchema } from '../src/lib/content/schemas';
import { pruneEmpty } from '../src/lib/content/yaml';
import { OG_DIR, OG_HEIGHT, OG_WIDTH, ogHeading, ogImagePath, readPageMeta } from '../src/lib/seo/og';
import { requireBuild, serveBuild } from './lib/static-server';

const ROOT = join(import.meta.dir, '..');
const OUT_DIR = resolve(ROOT, process.env['BUILD_OUT_DIR'] ?? 'dist');
/** Link previews are fetched by chat apps on slow connections; keep each image small. */
const MAX_BYTES = 150_000;

await requireBuild(OUT_DIR);
const profile = profileSchema.parse(
  pruneEmpty(load(await readFile(join(ROOT, 'content/profile.yaml'), 'utf8'))),
);

/** `about/index.html` → `/about/`. Only pages whose og:image is their own get one. */
const pages = [];
for (const file of await readdir(OUT_DIR, { recursive: true })) {
  if (!file.endsWith('index.html')) continue;
  const path = `/${file.slice(0, -'index.html'.length)}`;
  const meta = readPageMeta(await readFile(join(OUT_DIR, file), 'utf8'));
  if (meta.image === ogImagePath(path)) pages.push({ ...meta, image: meta.image });
}

const server = serveBuild(OUT_DIR);
await mkdir(join(OUT_DIR, OG_DIR), { recursive: true });
const browser = await chromium.launch();
let failed = false;
try {
  const page = await browser.newPage({ viewport: { width: OG_WIDTH, height: OG_HEIGHT } });
  const response = await page.goto(new URL('/og-template/', server.url).href, { waitUntil: 'networkidle' });
  if (response?.status() !== 200) throw new Error(`/og-template/ returned ${response?.status()}`);
  await page.evaluate(() => document.fonts.ready);

  for (const meta of pages) {
    await page.evaluate(
      ({ title, description, lang }) => {
        document.documentElement.lang = lang;
        const set = (selector: string, text: string) => {
          const element = document.querySelector(selector);
          if (element) element.textContent = text;
        };
        set('[data-og-title]', title);
        set('[data-og-description]', description);
        for (const line of document.querySelectorAll<HTMLElement>('[data-og-lang]')) {
          line.hidden = line.dataset['ogLang'] !== lang;
        }
      },
      { title: ogHeading(meta.title, profile.name), description: meta.description, lang: meta.lang },
    );
    const path = join(OUT_DIR, meta.image);
    await page.screenshot({
      path,
      type: 'jpeg',
      quality: 85,
      clip: { x: 0, y: 0, width: OG_WIDTH, height: OG_HEIGHT },
    });
    const bytes = (await stat(path)).size;
    failed ||= bytes > MAX_BYTES;
    if (bytes > MAX_BYTES)
      console.error(`OG: ${meta.image} is ${Math.round(bytes / 1024)} KB, over the budget`);
  }
} finally {
  await browser.close();
  await server.stop(true);
}

// The template is a build tool, not a page: keep it out of the published site.
await rm(join(OUT_DIR, 'og-template'), { recursive: true, force: true });
console.log(`OG: ${pages.length} images → ${join(OUT_DIR, OG_DIR)}`);
if (failed) process.exit(1);
