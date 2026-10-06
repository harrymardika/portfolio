/**
 * Which build files are compressed and how; shared by precompress.ts (Docker image, served by Caddy
 * with `precompressed br gzip`) and the Lighthouse preview server, so both send the same bytes.
 */
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

/** Already-compressed formats (images, fonts, PDFs) gain nothing and are skipped. */
const TEXT = /\.(html|css|js|mjs|json|svg|xml|txt|webmanifest)$/;
/** Below this size the compressed copy saves less than a network packet. */
export const MIN_COMPRESS_BYTES = 1024;

export function isCompressible(path: string): boolean {
  return TEXT.test(path);
}

export function brotli(data: Uint8Array): Buffer {
  return brotliCompressSync(data, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } });
}

export function gzip(data: Uint8Array): Buffer {
  return gzipSync(data, { level: 9 });
}
