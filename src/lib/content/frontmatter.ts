/** Split a Markdown file into its YAML frontmatter (parsed) and body. Pure; no Astro APIs. */
import { load } from 'js-yaml';

import { pruneEmpty } from './yaml';

export function parseFrontmatter(text: string): { data: unknown; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!match) throw new Error('Expected a file starting with --- frontmatter ---');
  // Same rule as the projects collection: blank values from the browser editor count as not set.
  return { data: pruneEmpty(load(match[1] ?? '')), body: match[2] ?? '' };
}
