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
const darkChoice = block(":root[data-theme='dark']");
const darkOs = block(":root:not([data-theme='light'])");
const dark = { ...light, ...darkChoice };
// Print pages (data-print) keep the original palette so the PDFs never change (ADR 0018).
const print = { ...light, ...block(':root[data-print]') };
const ORIGINAL_PRINT = {
  'forest-ink': '#12302a',
  sage: '#eef3ef',
  surface: '#ffffff',
  ink: '#173d32',
  'ink-muted': '#3f5d52',
  line: '#d6e2d9',
  forest: '#173d32',
  amber: '#f2b134',
  'amber-deep': '#8a5a00',
  'on-forest': '#ffffff',
  'on-forest-muted': '#d3e2d9',
};

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
  ['ink', 'room-glow', 4.5],
  ['ink-muted', 'room-glow', 4.5],
  ['amber-deep', 'room-glow', 4.5],
];

/** Text that sits directly on the room walls (ADR 0018). Checked at every 10% of the gradient. */
const ON_ROOM: [string, number][] = [
  ['ink', 4.5],
  ['ink-muted', 4.5],
  ['forest-ink', 4.5],
  ['amber-deep', 4.5],
];

/** sRGB interpolation, like a CSS gradient. */
function mix(a: string, b: string, t: number): string {
  const channel = (hex: string, i: number) => parseInt(hex.slice(i, i + 2), 16);
  return `#${[1, 3, 5]
    .map((i) =>
      Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * t)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/**
 * The paper grain (global.css, white noise blended with overlay) lightens the walls a little; text
 * must stay readable on the lightened wall too. Measured at about 2–5%; checked with 4%.
 */
const GRAIN = 0.04;

/** The wall color at fraction `f` (0 = top, 1 = bottom) of the room: top → mid → bottom. */
function wall(tokens: Record<string, string>, f: number): string {
  const [top, mid, bottom] = [
    tokens['room-top'] ?? '',
    tokens['room-mid'] ?? '',
    tokens['room-bottom'] ?? '',
  ];
  return f <= 0.5 ? mix(top, mid, f * 2) : mix(mid, bottom, (f - 0.5) * 2);
}

const ROOM_TOKENS = ['room-top', 'room-mid', 'room-bottom', 'room-glow', 'room-shadow'];

describe('token contrast (WCAG AA)', () => {
  it('found the tokens it needs', () => {
    for (const name of [
      ...PAIRS.flatMap(([fg, bg]) => [fg, bg]),
      ...ON_ROOM.map(([fg]) => fg),
      ...ROOM_TOKENS,
    ]) {
      expect(light[name], name).toBeDefined();
      expect(dark[name], name).toBeDefined();
    }
  });

  it('the OS dark preference and the explicit dark choice define the same colors', () => {
    expect(darkOs).toEqual(darkChoice);
  });

  it('print pages keep the original palette, so the PDFs do not change', () => {
    for (const [name, value] of Object.entries(ORIGINAL_PRINT)) expect(print[name], name).toBe(value);
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
  for (const [theme, tokens] of [
    ['light', light],
    ['dark', dark],
  ] as const) {
    for (const [fg, min] of ON_ROOM) {
      it(`${theme}: ${fg} on every point of the room gradient ≥ ${min}:1`, () => {
        for (let step = 0; step <= 10; step += 1) {
          const surface = wall(tokens, step / 10);
          for (const background of [surface, mix(surface, '#ffffff', GRAIN)]) {
            const ratio = contrast(tokens[fg] ?? '', background);
            expect(Number(ratio.toFixed(2))).toBeGreaterThanOrEqual(min);
          }
        }
      });
    }
  }
  // The CV prints in the light theme only (print pages force data-theme="light").
  it('print: print-ink on surface ≥ 4.5:1', () => {
    expect(contrast(print['print-ink'] ?? '', print['surface'] ?? '')).toBeGreaterThanOrEqual(4.5);
  });
  for (const [fg, bg, min] of PAIRS.filter(([, bg]) => !bg.startsWith('room-'))) {
    it(`print: ${fg} on ${bg} ≥ ${min}:1`, () => {
      expect(Number(contrast(print[fg] ?? '', print[bg] ?? '').toFixed(2))).toBeGreaterThanOrEqual(min);
    });
  }
  for (const [theme, tokens] of [
    ['light', light],
    ['dark', dark],
  ] as const) {
    for (const [fg, min] of [
      ['ink', 4.5],
      ['ink-muted', 4.5],
      ['amber-deep', 4.5],
    ] as const) {
      it(`${theme}: ${fg} on the room light with grain ≥ ${min}:1`, () => {
        const glow = mix(tokens['room-glow'] ?? '', '#ffffff', GRAIN);
        expect(Number(contrast(tokens[fg] ?? '', glow).toFixed(2))).toBeGreaterThanOrEqual(min);
      });
    }
  }
});
