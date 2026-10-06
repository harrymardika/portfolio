/**
 * Minimal static file server over a finished build, used by the build scripts that drive Chromium
 * (generate-pdf.ts, generate-og.ts) and the production-like preview for Lighthouse (serve-build.ts).
 */
import { readdir, stat } from 'node:fs/promises';
import { join, normalize, sep } from 'node:path';

import { brotli, isCompressible, MIN_COMPRESS_BYTES } from './compression';

async function isFile(path: string): Promise<boolean> {
  return stat(path)
    .then((s) => s.isFile())
    .catch(() => false);
}

/** Map a URL path to a file inside `root`, refusing anything that escapes it. */
async function resolveFile(root: string, urlPath: string): Promise<string | null> {
  const relative = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.(\/|\\|$))+/, '');
  const candidate = join(root, relative);
  if (candidate !== root && !candidate.startsWith(root + sep)) return null;
  if (await isFile(candidate)) return candidate;
  const index = join(candidate, 'index.html');
  return (await isFile(index)) ? index : null;
}

/** Exit with a clear message when `astro build` has not run yet. */
export async function requireBuild(root: string): Promise<void> {
  if (!(await isFile(join(root, 'index.html')))) {
    console.error(`No build found in ${root}. Run \`astro build\` first.`);
    process.exit(1);
  }
}

export interface ServeOptions {
  /** 0 picks a free port. */
  readonly port?: number;
  /** Handles a request before the static files, or returns null to fall through. */
  readonly route?: (request: Request, pathname: string) => Promise<Response | null> | Response | null;
  /** Send text files Brotli-compressed like production (precompress.ts + Caddy). Compressed once, kept in memory. */
  readonly compress?: boolean;
}

const compressed = new Map<string, Uint8Array<ArrayBuffer>>();

async function fileResponse(path: string, request: Request, compress: boolean): Promise<Response> {
  const file = Bun.file(path);
  const accepts = /\bbr\b/.test(request.headers.get('accept-encoding') ?? '');
  if (!compress || !accepts || !isCompressible(path) || file.size < MIN_COMPRESS_BYTES)
    return new Response(file);
  let body = compressed.get(path);
  if (!body) {
    body = new Uint8Array(brotli(new Uint8Array(await file.arrayBuffer())));
    compressed.set(path, body);
  }
  return new Response(body, {
    headers: { 'Content-Type': file.type, 'Content-Encoding': 'br', Vary: 'Accept-Encoding' },
  });
}

/** Compress every eligible file up front, so no request (or Lighthouse run) waits on Brotli. */
export async function warmCompression(root: string): Promise<number> {
  let count = 0;
  for (const file of await readdir(root, { recursive: true })) {
    const path = join(root, file);
    if (!isCompressible(path) || compressed.has(path)) continue;
    const data = Bun.file(path);
    if (data.size < MIN_COMPRESS_BYTES) continue;
    compressed.set(path, new Uint8Array(brotli(new Uint8Array(await data.arrayBuffer()))));
    count += 1;
  }
  return count;
}

export function serveBuild(root: string, options: ServeOptions = {}): ReturnType<typeof Bun.serve> {
  const { port = 0, route, compress = false } = options;
  return Bun.serve({
    port,
    hostname: '127.0.0.1',
    async fetch(request) {
      const { pathname } = new URL(request.url);
      const routed = route ? await route(request, pathname) : null;
      if (routed) return routed;
      const file = await resolveFile(root, pathname);
      return file ? fileResponse(file, request, compress) : new Response('Not found', { status: 404 });
    },
  });
}
