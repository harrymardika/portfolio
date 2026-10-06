#!/usr/bin/env bun
/**
 * Print the CV and portfolio pages of a finished build into PDFs (docs/09-pdf-generation.md).
 * Runs after `astro build`: serves the build output locally, opens every print page in headless
 * Chromium, and writes <outDir>/downloads/*.pdf.
 *   bun run pdf                       uses BUILD_OUT_DIR or ./dist
 * Requires Playwright's Chromium (`bunx playwright install chromium`).
 */
import { mkdir, readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { chromium } from '@playwright/test';
import { load } from 'js-yaml';

import { profileSchema } from '../src/lib/content/schemas';
import { allDownloads, DOWNLOADS_DIR } from '../src/lib/downloads';
import { requireBuild, serveBuild } from './lib/static-server';

const ROOT = join(import.meta.dir, '..');
const OUT_DIR = resolve(ROOT, process.env['BUILD_OUT_DIR'] ?? 'dist');
const TARGET_DIR = join(OUT_DIR, DOWNLOADS_DIR);
/** Size budgets from docs/09: the CV must stay light for applicant tracking systems. */
const MAX_BYTES = { cv: 1_000_000, portfolio: 3_000_000 } as const;

await requireBuild(OUT_DIR);

const profile = profileSchema.parse(load(await readFile(join(ROOT, 'content/profile.yaml'), 'utf8')));

const server = serveBuild(OUT_DIR);

await mkdir(TARGET_DIR, { recursive: true });
const browser = await chromium.launch();
let failed = false;
try {
  const page = await browser.newPage();
  for (const download of allDownloads(profile.name)) {
    const url = new URL(download.source, server.url).href;
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    if (response?.status() !== 200) throw new Error(`${download.source} returned ${response?.status()}`);
    await page.evaluate(() => document.fonts.ready);
    const path = join(TARGET_DIR, download.file);
    // preferCSSPageSize: paper size and margins come from @page in PrintLayout.
    await page.pdf({ path, preferCSSPageSize: true, printBackground: true, tagged: true, outline: true });
    const bytes = (await stat(path)).size;
    const tooBig = bytes > MAX_BYTES[download.kind];
    failed ||= tooBig;
    console.log(
      `PDF: ${download.file} (${Math.round(bytes / 1024)} KB)${tooBig ? ' — over the size budget!' : ''}`,
    );
  }
} finally {
  await browser.close();
  await server.stop(true);
}

if (failed) {
  console.error('PDF: at least one file exceeds its size budget (docs/09-pdf-generation.md).');
  process.exit(1);
}
