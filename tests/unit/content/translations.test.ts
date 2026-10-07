import { describe, expect, it } from 'bun:test';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/**
 * Indonesian case study bodies (content/projects/id/<slug>.md, T9.3) must keep the shape of the
 * English file: the same section levels in the same order and the same images, so the two versions
 * never drift apart. Heading text is translated, so only the levels are compared.
 */

const PROJECTS = join('content', 'projects');
const TRANSLATIONS = join(PROJECTS, 'id');

function body(path: string): string {
  return readFileSync(path, 'utf8').split(/^---$/m).slice(2).join('---');
}

function headingLevels(markdown: string): number[] {
  return [...markdown.matchAll(/^#{2,6}(?= )/gm)].map((match) => match[0].length);
}

/** Image files a body shows, resolved from the Markdown file's folder. */
function images(path: string): string[] {
  return [...body(path).matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)].map((match) =>
    resolve(dirname(path), match[1] ?? ''),
  );
}

const translations = existsSync(TRANSLATIONS)
  ? readdirSync(TRANSLATIONS).filter((name) => name.endsWith('.md'))
  : [];

describe('Indonesian case studies', () => {
  for (const name of translations) {
    const english = join(PROJECTS, name);
    const indonesian = join(TRANSLATIONS, name);

    it(`id/${name} translates an existing case study`, () => {
      expect(existsSync(english)).toBe(true);
      expect(body(indonesian).trim().length).toBeGreaterThan(0);
    });

    it(`id/${name} has the English title, so the CMS list matches the case studies`, () => {
      const title = (path: string) => /^title: (.+)$/m.exec(readFileSync(path, 'utf8'))?.[1];
      expect(title(indonesian)).toBe(title(english));
    });

    it(`id/${name} has the same sections as the English file`, () => {
      expect(headingLevels(body(indonesian))).toEqual(headingLevels(body(english)));
    });

    it(`id/${name} shows the same images, and they exist`, () => {
      const shown = images(indonesian);
      expect(shown).toEqual(images(english));
      expect(shown.filter((file) => !existsSync(file))).toEqual([]);
    });
  }
});
