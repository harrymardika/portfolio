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
