/**
 * Social preview (Open Graph) images, generated at build time by scripts/generate-og.ts.
 * The page and the generator both derive the file name from the page path, so they always agree.
 */

export const OG_DIR = 'og';
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** `/` → `/og/home.jpg`, `/id/projects/decklify/` → `/og/id-projects-decklify.jpg`. */
export function ogImagePath(pathname: string): string {
  const slug = pathname
    .split('/')
    .filter(Boolean)
    .map((part) => part.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
    .join('-');
  return `/${OG_DIR}/${slug === '' ? 'home' : slug}.jpg`;
}

/** Fallback for pages without their own image (404, print views). */
export const DEFAULT_OG_IMAGE = ogImagePath('/');

/** Headline for a page's image from its `<title>`: drops the " · Name" suffix; the home page shows the name. */
export function ogHeading(title: string, name: string): string {
  if (title.startsWith(`${name} · `)) return name;
  return title.endsWith(` · ${name}`) ? title.slice(0, -` · ${name}`.length) : title;
}

export interface PageMeta {
  title: string;
  description: string;
  /** BCP 47 tag from `<html lang>`. */
  lang: string;
  /** Path of the page's og:image, e.g. `/og/about.jpg`. */
  image: string | null;
}

const decode = (text: string): string =>
  text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/** What the image generator needs from a built page. */
export function readPageMeta(html: string): PageMeta {
  const head = html.split(/<\/head>/i)[0] ?? '';
  const meta = (key: string, value: string): string | undefined => {
    for (const tag of head.match(/<meta\b[^>]*>/gi) ?? []) {
      if (new RegExp(`\\b${key}\\s*=\\s*"${value}"`, 'i').test(tag)) {
        const content = /\bcontent\s*=\s*"([^"]*)"/i.exec(tag)?.[1];
        if (content !== undefined) return decode(content);
      }
    }
    return undefined;
  };
  const image = meta('property', 'og:image');
  return {
    title: decode(/<title>([\s\S]*?)<\/title>/i.exec(head)?.[1] ?? '').trim(),
    description: meta('name', 'description') ?? '',
    lang: /<html\b[^>]*\blang\s*=\s*"([^"]+)"/i.exec(html)?.[1] ?? 'en-US',
    image: image ? new URL(image, 'http://x').pathname : null,
  };
}
