export interface TextSegment {
  readonly text: string;
  readonly emphasis: boolean;
}

/**
 * Split text on `*asterisks*` so components can color the emphasized words,
 * e.g. "Let's build something *useful.*" (docs/04-content-guide.md, profile.headline).
 * An unmatched asterisk is kept as literal text.
 */
export function splitEmphasis(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const pattern = /\*([^*]+)\*/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > cursor) segments.push({ text: text.slice(cursor, match.index), emphasis: false });
    segments.push({ text: match[1] ?? '', emphasis: true });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), emphasis: false });
  return segments;
}

/** Plain text without emphasis markers, for `<title>`, meta descriptions, and PDFs metadata. */
export function stripEmphasis(text: string): string {
  return splitEmphasis(text)
    .map((segment) => segment.text)
    .join('');
}

export interface StrongSegment {
  readonly text: string;
  readonly strong: boolean;
}

/**
 * Split text on `**double asterisks**` so components can render the marked words in bold, e.g. the
 * key result in a CV highlight (docs/04-content-guide.md §6). Unlike `*accent*` in headlines this is
 * for body text. An unmatched pair of asterisks is kept as literal text.
 */
export function splitStrong(text: string): StrongSegment[] {
  const segments: StrongSegment[] = [];
  let cursor = 0;
  // Like Markdown: the bold text may not start or end with a space (`** a **` stays literal).
  for (const match of text.matchAll(/\*\*(?=\S)([^*]+?)(?<=\S)\*\*/g)) {
    if (match.index > cursor) segments.push({ text: text.slice(cursor, match.index), strong: false });
    segments.push({ text: match[1] ?? '', strong: true });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), strong: false });
  return segments;
}

/** Plain text without bold markers. */
export function stripStrong(text: string): string {
  return splitStrong(text)
    .map((segment) => segment.text)
    .join('');
}

/** True when `**` markers are left over after pairing, e.g. a typo made in the CMS, or `***` is used. */
export function hasStrayStrongMarker(text: string): boolean {
  return text.includes('***') || stripStrong(text).includes('**');
}
