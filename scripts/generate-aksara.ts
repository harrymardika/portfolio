#!/usr/bin/env bun
/**
 * Draws the hero's aksara sheet once (T13.4, ADR 0019): the owner's name in Javanese script on a
 * ruled practice sheet, as the 3D texture and the no-WebGL fallback image, plus where each syllable
 * sits so the 3D detection boxes and the HTML fallback line up with the glyphs.
 *
 *   bun scripts/generate-aksara.ts
 *
 * Output (committed, so neither the build nor the browser needs the Javanese font):
 *   content/media/aksara-sheet.png   1200×880
 *   content/media/aksara-sheet.json  boxes as fractions of the sheet, with class and transliteration
 * Font: @fontsource/noto-sans-javanese (dev dependency, used only here).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import { chromium } from '@playwright/test';

const ROOT = join(import.meta.dir, '..');
const require = createRequire(import.meta.url);
const fontFile =
  require.resolve('@fontsource/noto-sans-javanese/files/noto-sans-javanese-javanese-500-normal.woff2');
const fontData = readFileSync(fontFile).toString('base64');

/** "Harry Mardika" = har-ri mar-di-ka: base character (YOLO class) + vowel/final marks, owner-confirmed. */
export const SYLLABLES = [
  { glyphs: 'ꦲꦂ', cls: 'ha', latin: 'har', line: 0 },
  { glyphs: 'ꦫꦶ', cls: 'ra', latin: 'ri', line: 0 },
  { glyphs: 'ꦩꦂ', cls: 'ma', latin: 'mar', line: 1 },
  { glyphs: 'ꦢꦶ', cls: 'da', latin: 'di', line: 1 },
  { glyphs: 'ꦏ', cls: 'ka', latin: 'ka', line: 1 },
] as const;

const WIDTH = 1200;
const HEIGHT = 880;

const page = `<!doctype html><html><head><style>
@font-face { font-family: Jawa; src: url(data:font/woff2;base64,${fontData}) format('woff2'); font-weight: 500; }
html, body { margin: 0; background: transparent; }
</style></head><body><canvas width="${WIDTH}" height="${HEIGHT}"></canvas></body></html>`;

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
await tab.setContent(page);
await tab.evaluate(() => document.fonts.load('500 215px Jawa', 'ꦲ'));

const result = await tab.evaluate(
  ({ syllables, width, height }) => {
    const FONT = '500 215px Jawa';
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const g = canvas.getContext('2d') as CanvasRenderingContext2D;
    // Measure each syllable's real ink: Javanese marks sit above and below the base character.
    const probe = document.createElement('canvas');
    probe.width = 520;
    probe.height = 520;
    const p = probe.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    const ink = syllables.map((s) => {
      p.clearRect(0, 0, 520, 520);
      p.font = FONT;
      p.fillStyle = '#000';
      p.fillText(s.glyphs, 60, 340);
      const data = p.getImageData(0, 0, 520, 520).data;
      let x0 = 520,
        y0 = 520,
        x1 = 0,
        y1 = 0;
      for (let y = 0; y < 520; y++)
        for (let x = 0; x < 520; x++)
          if ((data[(y * 520 + x) * 4 + 3] ?? 0) > 40) {
            x0 = Math.min(x0, x);
            x1 = Math.max(x1, x);
            y0 = Math.min(y0, y);
            y1 = Math.max(y1, y);
          }
      return { left: x0 - 60, top: y0 - 340, w: x1 - x0, h: y1 - y0 };
    });

    // Paper: off-white, ruled lines, a margin line, and the dataset file name.
    g.fillStyle = '#f6f8f5';
    g.fillRect(0, 0, width, height);
    g.strokeStyle = '#c3d4c8';
    g.lineWidth = 2;
    for (let y = 120; y < height; y += 56) {
      g.beginPath();
      g.moveTo(48, y);
      g.lineTo(width - 48, y);
      g.stroke();
    }
    g.strokeStyle = '#e2b7a5';
    g.beginPath();
    g.moveTo(110, 40);
    g.lineTo(110, height - 30);
    g.stroke();
    g.fillStyle = '#3f5d52';
    g.font = '500 22px ui-monospace, monospace';
    g.fillText('aksara_jawa/val/img_0417.jpg', 134, 70);

    const gap = 50;
    const lineY = [330, 740];
    const boxes: { cls: string; latin: string; x: number; y: number; w: number; h: number }[] = [];
    for (const line of [0, 1]) {
      const row = syllables.map((s, i) => ({ s, i })).filter(({ s }) => s.line === line);
      const total = row.reduce((sum, { i }) => sum + (ink[i]?.w ?? 0), 0) + gap * (row.length - 1);
      let x = (width - total) / 2 + 60;
      row.forEach(({ s, i }, k) => {
        const m = ink[i];
        if (!m) return;
        const jitter = (((k * 37 + line * 11) % 7) - 3) * 0.012;
        const penY = (lineY[line] ?? 0) + (k % 2 ? 6 : -4);
        g.save();
        g.translate(x + m.w / 2, penY);
        g.rotate(jitter);
        g.font = FONT;
        g.fillStyle = '#1d3a31';
        g.fillText(s.glyphs, -m.left - m.w / 2, 0);
        g.restore();
        const pad = 14;
        boxes.push({
          cls: s.cls,
          latin: s.latin,
          x: (x - pad) / width,
          y: (penY + m.top - pad) / height,
          w: (m.w + pad * 2) / width,
          h: (m.h + pad * 2) / height,
        });
        x += m.w + gap;
      });
    }
    return { png: canvas.toDataURL('image/png'), boxes };
  },
  { syllables: SYLLABLES.map((s) => ({ ...s })), width: WIDTH, height: HEIGHT },
);
await browser.close();

const out = join(ROOT, 'content', 'media');
writeFileSync(join(out, 'aksara-sheet.png'), Buffer.from(result.png.split(',')[1] ?? '', 'base64'));
writeFileSync(
  join(out, 'aksara-sheet.json'),
  `${JSON.stringify({ width: WIDTH, height: HEIGHT, text: 'Harry Mardika', boxes: result.boxes }, null, 2)}\n`,
);
console.log(`Aksara sheet: ${result.boxes.length} syllables → content/media/aksara-sheet.{png,json}`);
