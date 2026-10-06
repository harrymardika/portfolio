/**
 * Content Security Policy built from the final HTML (docs/07-deployment.md §5).
 * Inline scripts (the theme pre-paint script and small modules Astro inlines) are allowed by their
 * SHA-256 hash only, so script-src never needs 'unsafe-inline'. Pure; used by scripts/generate-csp.ts.
 */
import { createHash } from 'node:crypto';

const INLINE_SCRIPT = /<script\b(?![^>]*\bsrc\s*=)([^>]*)>([\s\S]*?)<\/script>/gi;

/** Contents of executable inline scripts (data blocks such as application/ld+json are skipped). */
export function inlineScripts(html: string): string[] {
  const scripts: string[] = [];
  for (const match of html.matchAll(INLINE_SCRIPT)) {
    const attributes = match[1] ?? '';
    const type = /\btype\s*=\s*["']?([^"'\s>]+)/i.exec(attributes)?.[1]?.toLowerCase();
    const executable =
      !type || type === 'module' || type === 'text/javascript' || type === 'application/javascript';
    if (executable) scripts.push(match[2] ?? '');
  }
  return scripts;
}

/** CSP source expression for a script body, e.g. 'sha256-AbC…='. */
export function scriptHash(content: string): string {
  return `'sha256-${createHash('sha256').update(content, 'utf8').digest('base64')}'`;
}

/** The site's policy. Everything is same-origin; WebGL, canvas textures, and blobs stay local. */
export function buildCsp(scriptHashes: Iterable<string>): string {
  const hashes = [...new Set(scriptHashes)].sort();
  return [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(' ')}`.trim(),
    // Astro inlines small component styles and two style attributes; inline CSS cannot run code.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}
