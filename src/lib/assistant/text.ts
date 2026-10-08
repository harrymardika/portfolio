/**
 * Plain-text helpers for the knowledge sections (T11.1): one string per language, no Markdown markers.
 */
import { localize, stripEmphasis, stripStrong } from '@/lib/content';
import type { LocalizedText } from '@/lib/content';
import type { Locale } from '@/lib/i18n/locales';

import type { Bilingual, KnowledgeSection } from './knowledge';

/** Highlights beyond this many go to `detail`, so the compact knowledge stays within its budget. */
export const COMPACT_HIGHLIGHTS = 2;

/** Plain text: no `*accent*` or `**bold**` markers. */
export const plain = (text: string): string => stripEmphasis(stripStrong(text));

/** Render once per language; Indonesian is kept only when it differs from English. */
export function both(render: (locale: Locale) => string): Bilingual {
  const en = render('en');
  const id = render('id');
  return id === en ? { en } : { en, id };
}

/** Join the non-empty parts with line breaks. */
export const lines = (...parts: (string | false | undefined)[]): string =>
  parts.filter((part): part is string => typeof part === 'string' && part !== '').join('\n');

export const bullets = (items: readonly LocalizedText[], locale: Locale): string =>
  items.map((item) => `- ${plain(localize(item, locale))}`).join('\n');

/** `{ detail }` when there is any detail text, otherwise nothing (the schema rejects empty text). */
export const optionalDetail = (detail: Bilingual): Pick<KnowledgeSection, 'detail'> =>
  detail.en === '' ? {} : { detail };

/** The first highlights in `text`; the rest and any `extra` line as `detail` (full knowledge only). */
export function withHighlights(
  head: (locale: Locale) => string,
  highlights: readonly LocalizedText[],
  extra = '',
): Pick<KnowledgeSection, 'text' | 'detail'> {
  return {
    text: both((locale) => lines(head(locale), bullets(highlights.slice(0, COMPACT_HIGHLIGHTS), locale))),
    ...optionalDetail(both((locale) => lines(bullets(highlights.slice(COMPACT_HIGHLIGHTS), locale), extra))),
  };
}

/**
 * Case study Markdown as plain text: images and HTML dropped, links reduced to their text, emphasis
 * markers removed, and headings turned into labels ("Problem:") so they never look like the `## key (path)`
 * section headers of the prompt (knowledgeText).
 */
export function plainMarkdown(markdown: string): string {
  return plain(
    markdown
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/^#{1,6}\s+(.+)$/gm, '$1:'),
  )
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
