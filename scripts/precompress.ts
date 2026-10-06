#!/usr/bin/env bun
/**
 * Write Brotli (.br) and gzip (.gz) copies of every text file in the build, next to the original.
 * Caddy serves them with `file_server { precompressed br gzip }`, so the home server's slow CPU
 * never compresses on request (docs/07-deployment.md). Runs in the Docker build only:
 *   bun scripts/precompress.ts        uses BUILD_OUT_DIR or ./dist
 */
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

const ROOT = join(import.meta.dir, '..');
const OUT_DIR = resolve(ROOT, process.env['BUILD_OUT_DIR'] ?? 'dist');
/** Already-compressed formats (images, fonts, PDFs) gain nothing and are skipped. */
const TEXT = /\.(html|css|js|mjs|json|svg|xml|txt|webmanifest)$/;
/** Below this size the compressed copy saves less than a network packet. */
const MIN_BYTES = 1024;

let count = 0;
let before = 0;
let after = 0;
for (const file of await readdir(OUT_DIR, { recursive: true })) {
  if (!TEXT.test(file)) continue;
  const path = join(OUT_DIR, file);
  if ((await stat(path)).size < MIN_BYTES) continue;
  const data = await readFile(path);
  const br = brotliCompressSync(data, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } });
  await writeFile(`${path}.br`, br);
  await writeFile(`${path}.gz`, gzipSync(data, { level: 9 }));
  count += 1;
  before += data.length;
  after += br.length;
}
console.log(
  `Precompress: ${count} files, ${Math.round(before / 1024)} KB → ${Math.round(after / 1024)} KB with Brotli`,
);
