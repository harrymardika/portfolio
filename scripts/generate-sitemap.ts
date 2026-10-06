#!/usr/bin/env bun
/**
 * Write <outDir>/sitemap.xml from the finished build: every page with a canonical URL that is not
 * noindex, with its hreflang alternates (src/lib/seo/sitemap.ts). New pages are listed automatically.
 *   bun run sitemap                   uses BUILD_OUT_DIR or ./dist
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { buildSitemap, pageFromHtml, type SitemapPage } from '../src/lib/seo/sitemap';
import { requireBuild } from './lib/static-server';

const ROOT = join(import.meta.dir, '..');
const OUT_DIR = resolve(ROOT, process.env['BUILD_OUT_DIR'] ?? 'dist');

await requireBuild(OUT_DIR);
const pages: SitemapPage[] = [];
for (const file of await readdir(OUT_DIR, { recursive: true })) {
  if (!file.endsWith('.html')) continue;
  const page = pageFromHtml(await readFile(join(OUT_DIR, file), 'utf8'));
  if (page) pages.push(page);
}

await writeFile(join(OUT_DIR, 'sitemap.xml'), buildSitemap(pages));
console.log(`Sitemap: ${pages.length} pages → ${join(OUT_DIR, 'sitemap.xml')}`);
