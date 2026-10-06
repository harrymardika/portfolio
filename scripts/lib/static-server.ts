/**
 * Minimal static file server over a finished build, used by the build scripts that drive Chromium
 * (generate-pdf.ts, generate-og.ts). Listens on a random local port.
 */
import { stat } from 'node:fs/promises';
import { join, normalize, sep } from 'node:path';

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

export function serveBuild(root: string): ReturnType<typeof Bun.serve> {
  return Bun.serve({
    port: 0,
    hostname: '127.0.0.1',
    async fetch(request) {
      const file = await resolveFile(root, new URL(request.url).pathname);
      return file ? new Response(Bun.file(file)) : new Response('Not found', { status: 404 });
    },
  });
}
