#!/usr/bin/env bun
/**
 * Write Brotli (.br) and gzip (.gz) copies of every text file in the build, next to the original.
 * Caddy serves them with `file_server { precompressed br gzip }`, so the home server's slow CPU
 * never compresses on request (docs/07-deployment.md). Runs in the Docker build only:
 *   bun scripts/precompress.ts        uses BUILD_OUT_DIR or ./dist
 */
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { brotli, gzip, isCompressible, MIN_COMPRESS_BYTES } from './lib/compression';

const ROOT = join(import.meta.dir, '..');
const OUT_DIR = resolve(ROOT, process.env['BUILD_OUT_DIR'] ?? 'dist');

let count = 0;
let before = 0;
let after = 0;
for (const file of await readdir(OUT_DIR, { recursive: true })) {
  if (!isCompressible(file)) continue;
  const path = join(OUT_DIR, file);
  if ((await stat(path)).size < MIN_COMPRESS_BYTES) continue;
  const data = await readFile(path);
  const br = brotli(data);
  await writeFile(`${path}.br`, br);
  await writeFile(`${path}.gz`, gzip(data));
  count += 1;
  before += data.length;
  after += br.length;
}
console.log(
  `Precompress: ${count} files, ${Math.round(before / 1024)} KB → ${Math.round(after / 1024)} KB with Brotli`,
);
