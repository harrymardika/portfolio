/**
 * WCAG 2.2 AA contrast for the text/background token pairs used by the design
 * (docs/03-design-system.md §2). Reads src/styles/tokens.css so a color change
 * that breaks readability fails `bun test`.
 */
import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const CSS = readFileSync(join(import.meta.dir, '../../src/styles/tokens.css'), 'utf8');

function block(selector: string): Record<string, string> {
  const start = CSS.indexOf(selector);
  const body = CSS.slice(CSS.indexOf('{', start) + 1, CSS.indexOf('}', start));
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));
}

const light = block(':root {');
const dark = { ...light, ...block(":root[data-theme='dark']") };

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [
    number,
    number,
    number,
  ];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** [foreground, background, minimum ratio]. 4.5 = normal text, 3 = large text / UI parts. */
const PAIRS: [string, string, number][] = [
  ['ink', 'sage', 4.5],
  ['ink', 'surface', 4.5],
  ['ink-muted', 'sage', 4.5],
  ['ink-muted', 'surface', 4.5],
  ['forest-ink', 'sage', 4.5],
  ['amber-deep', 'sage', 4.5],
  ['amber-deep', 'surface', 4.5],
  ['on-forest', 'forest', 4.5],
  ['on-forest-muted', 'forest', 4.5],
  ['amber', 'forest', 4.5],
  ['forest', 'amber', 4.5],
];

describe('token contrast (WCAG AA)', () => {
  it('found the tokens it needs', () => {
    for (const [fg, bg] of PAIRS) {
      expect(light[fg]).toBeDefined();
      expect(light[bg]).toBeDefined();
    }
  });

  for (const [theme, tokens] of [
    ['light', light],
    ['dark', dark],
  ] as const) {
    for (const [fg, bg, min] of PAIRS) {
      it(`${theme}: ${fg} on ${bg} ≥ ${min}:1`, () => {
        const ratio = contrast(tokens[fg] ?? '', tokens[bg] ?? '');
        expect(Number(ratio.toFixed(2))).toBeGreaterThanOrEqual(min);
      });
    }
  }
  // The CV prints in the light theme only (print pages force data-theme="light").
  it('light: print-ink on surface ≥ 4.5:1', () => {
    expect(contrast(light['print-ink'] ?? '', light['surface'] ?? '')).toBeGreaterThanOrEqual(4.5);
  });
});
