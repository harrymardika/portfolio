import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { hasForeignDecimal } from '@/lib/content';
import { UI } from '@/lib/i18n';

/**
 * Decision D16: each language follows its own number rules (English 92.5% / 12,000,
 * Indonesian 92,5% / 12.000). Language-neutral values are written in English style and
 * converted by localizeNumber, so they are checked as English.
 */

interface Finding {
  readonly where: string;
  readonly text: string;
}

const LANGUAGE_NEUTRAL = new Set(['value', 'gpa']);

function collect(node: unknown, where: string, out: Finding[], key = ''): void {
  if (typeof node === 'string') {
    if (LANGUAGE_NEUTRAL.has(key) && hasForeignDecimal(node, 'en')) out.push({ where, text: node });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((child, index) => collect(child, `${where}[${index}]`, out));
    return;
  }
  if (node === null || typeof node !== 'object') return;
  const record = node as Record<string, unknown>;
  for (const locale of ['en', 'id'] as const) {
    const text = record[locale];
    if (typeof text === 'string' && hasForeignDecimal(text, locale)) {
      out.push({ where: `${where}.${locale}`, text });
    }
  }
  for (const [child, value] of Object.entries(record)) collect(value, `${where}.${child}`, out, child);
}

function frontmatter(source: string): string {
  return source.split(/^---$/m)[1] ?? '';
}

function contentFindings(): Finding[] {
  const out: Finding[] = [];
  for (const file of readdirSync('content').filter((name) => name.endsWith('.yaml'))) {
    collect(parse(readFileSync(`content/${file}`, 'utf8')), file, out);
  }
  for (const file of readdirSync('content/projects').filter((name) => name.endsWith('.md'))) {
    const source = readFileSync(`content/projects/${file}`, 'utf8');
    collect(parse(frontmatter(source)), file, out);
    const body = source.split(/^---$/m).slice(2).join('---');
    if (hasForeignDecimal(body, 'en')) out.push({ where: `${file} (body)`, text: 'English case study' });
  }
  return out;
}

describe('number format per language (D16)', () => {
  it('detects a decimal separator from the other language', () => {
    expect(hasForeignDecimal('92,5%', 'en')).toBe(true);
    expect(hasForeignDecimal('AUC 0.96', 'id')).toBe(true);
    expect(hasForeignDecimal('3.99/4.00', 'id')).toBe(true);
  });

  it('allows thousands separators and lists', () => {
    expect(hasForeignDecimal('12,000+ applicants', 'en')).toBe(false);
    expect(hasForeignDecimal('12.000+ pendaftar', 'id')).toBe(false);
    expect(hasForeignDecimal('Rp5,85 juta', 'id')).toBe(false);
    expect(hasForeignDecimal('Python, SQL, 2024', 'en')).toBe(false);
    expect(hasForeignDecimal('1, 2, 3', 'en')).toBe(false);
  });

  it('content uses the separators of each language', () => {
    expect(contentFindings()).toEqual([]);
  });

  it('UI strings use the separators of each language', () => {
    const findings = (['en', 'id'] as const).flatMap((locale) =>
      Object.entries(UI[locale])
        .filter(([, text]) => hasForeignDecimal(text, locale))
        .map(([key]) => `${locale}:${key}`),
    );
    expect(findings).toEqual([]);
  });
});
