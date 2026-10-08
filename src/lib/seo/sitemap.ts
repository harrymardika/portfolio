/**
 * sitemap.xml from the finished build (scripts/generate-sitemap.ts). Every page that declares a
 * canonical URL and is not `noindex` is listed, with its language alternates as hreflang links.
 * Pure string functions; the build HTML is the single source of truth.
 */

export interface SitemapPage {
  url: string;
  /** hreflang → absolute URL, including x-default. */
  alternates: Record<string, string>;
}

import { decodeEntities } from './html';
import { CV_VARIANTS_DIR, DOWNLOADS_DIR } from '@/lib/downloads';

/** Attribute value with HTML entities decoded (buildSitemap escapes again for XML). */
const attribute = (tag: string, name: string): string | undefined => {
  const value = new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i').exec(tag)?.[1];
  return value === undefined ? undefined : decodeEntities(value);
};

/** Read the canonical URL and hreflang alternates of a page; null when it should not be listed. */
export function pageFromHtml(html: string): SitemapPage | null {
  const head = html.split(/<\/head>/i)[0] ?? '';
  const metas = head.match(/<meta\b[^>]*>/gi) ?? [];
  const robots = metas.find((tag) => attribute(tag, 'name')?.toLowerCase() === 'robots');
  if (robots && /noindex/i.test(attribute(robots, 'content') ?? '')) return null;

  let url: string | undefined;
  const alternates: Record<string, string> = {};
  for (const tag of head.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = attribute(tag, 'rel');
    const href = attribute(tag, 'href');
    if (!href) continue;
    if (rel === 'canonical') url = href;
    const lang = attribute(tag, 'hreflang');
    if (rel === 'alternate' && lang) alternates[lang] = href;
  }
  return url ? { url, alternates } : null;
}

const escapeXml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Sitemap XML with xhtml:link alternates (https://developers.google.com/search/docs/specialty/international/localized-versions#sitemap). */
export function buildSitemap(pages: readonly SitemapPage[]): string {
  const sorted = [...pages].sort((a, b) => a.url.localeCompare(b.url));
  const entries = sorted.map((page) => {
    const links = Object.entries(page.alternates)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(
        ([lang, href]) =>
          `    <xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}"/>`,
      );
    return ['  <url>', `    <loc>${escapeXml(page.url)}</loc>`, ...links, '  </url>'].join('\n');
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
}

/** robots.txt: everything public is crawlable; the API is not a page; CV variant PDFs stay out of search (T10.2). */
export function buildRobots(site: string | URL): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    `Disallow: /${DOWNLOADS_DIR}/${CV_VARIANTS_DIR}/`,
    '',
    `Sitemap: ${new URL('/sitemap.xml', site).href}`,
    '',
  ].join('\n');
}
