import { describe, expect, it } from 'bun:test';

import sheet from '../../../content/media/aksara-sheet.json';
import {
  HERO_UNIT,
  heroPins,
  PHOTO_PRINT,
  photoPrintPadding,
  printLayout,
  PRINTS,
  SEQUENCE,
  STAGE_WIDTH,
} from '@/scenes/room/parts/hero-config';
import { boxOnPrint, curl, LAMP, lampAt, sequenceAt } from '@/scenes/room/parts/hero';
import { STATIONS } from '@/scenes/room/world';

describe('boxOnPrint', () => {
  it('turns a box in sheet fractions into px around the print centre, y up', () => {
    const box = boxOnPrint({ x: 0.25, y: 0.25, w: 0.5, h: 0.5 }, 400, 200);
    expect(box).toEqual({ x: 0, y: 0, width: 200, height: 100 });
    const corner = boxOnPrint({ x: 0, y: 0, w: 0.2, h: 0.2 }, 400, 200);
    expect(corner.x).toBeCloseTo(-160);
    expect(corner.y).toBeCloseTo(80);
  });
});

describe('curl', () => {
  it('lifts both edges equally and keeps the sheet centred in depth', () => {
    expect(curl(-200, 400, 16)).toBeCloseTo(curl(200, 400, 16));
    expect(curl(200, 400, 16)).toBeCloseTo(8);
    expect(curl(0, 400, 16)).toBeCloseTo(-8);
    expect(curl(10, 0, 16)).toBeCloseTo(-8);
  });
});

describe('sequenceAt', () => {
  it('starts with nothing detected', () => {
    const state = sequenceAt(0, 5);
    expect(state.face).toBe(0);
    expect(state.person).toBe(0);
    expect(state.name).toBe(0);
    expect(state.boxes.every((k) => k === 0)).toBe(true);
    expect(state.read).toBe(0);
    expect(state.done).toBe(false);
  });

  it('shows "person" before the name, then reads the sheet in order', () => {
    expect(sequenceAt(SEQUENCE.faceIn + 0.6, 5).person).toBe(1);
    expect(sequenceAt(SEQUENCE.personUntil + 0.5, 5).person).toBe(0);
    expect(sequenceAt(SEQUENCE.personUntil + 0.5, 5).name).toBe(1);
    const middle = sequenceAt(SEQUENCE.sheetFrom + SEQUENCE.sheetStep * 1.5, 5).boxes;
    expect(middle[0]).toBe(1);
    expect(middle[4]).toBe(0);
  });

  it('ends with every box and the transliteration shown', () => {
    const state = sequenceAt(Number.POSITIVE_INFINITY, 5);
    expect(state.boxes).toEqual([1, 1, 1, 1, 1]);
    expect(state.read).toBe(1);
    expect(state.name).toBe(1);
    expect(state.person).toBe(0);
    expect(state.done).toBe(true);
  });
});

describe('aksara sheet data', () => {
  it('has five syllables inside the sheet, read as Harry Mardika', () => {
    expect(sheet.boxes.map((box) => box.cls)).toEqual(['ha', 'ra', 'ma', 'da', 'ka']);
    expect(sheet.boxes.map((box) => box.latin).join('')).toBe('harrimardika');
    for (const box of sheet.boxes) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.w).toBeLessThanOrEqual(1);
      expect(box.y + box.h).toBeLessThanOrEqual(1);
    }
  });
});

describe('photoPrintPadding', () => {
  it('turns the print-relative border into stage-relative CSS padding', () => {
    const padding = photoPrintPadding();
    expect(padding.side / PRINTS.photo.width).toBeCloseTo(PHOTO_PRINT.border, 9);
    expect(padding.bottom / PRINTS.photo.width).toBeCloseTo(PHOTO_PRINT.bottom, 9);
  });
});

describe('printLayout', () => {
  const sheetAspect = 0.7;
  const prints = printLayout(STAGE_WIDTH, sheetAspect);
  const stageHeight = STAGE_WIDTH / PRINTS.aspect;

  it('sizes the prints from the same fractions as the HTML', () => {
    expect(prints.photo.width).toBeCloseTo(PRINTS.photo.width * STAGE_WIDTH, 9);
    expect(prints.sheet.width).toBeCloseTo(PRINTS.sheet.width * STAGE_WIDTH, 9);
    expect(prints.sheet.height).toBeCloseTo(prints.sheet.width * sheetAspect, 9);
  });

  it('makes the photo print the square photo plus its border, deeper at the bottom', () => {
    const { width, height } = prints.photo;
    const photo = width * (1 - 2 * PHOTO_PRINT.border);
    expect(height).toBeCloseTo(photo + width * PHOTO_PRINT.border + width * PHOTO_PRINT.bottom, 9);
  });

  it('places each print where its HTML twin starts, relative to the stage centre, y up', () => {
    const left = (box: { x: number; width: number }) => box.x - box.width / 2 + STAGE_WIDTH / 2;
    const top = (box: { y: number; height: number }) => stageHeight / 2 - (box.y + box.height / 2);
    expect(left(prints.photo)).toBeCloseTo(PRINTS.photo.left * STAGE_WIDTH, 9);
    expect(top(prints.photo)).toBeCloseTo(PRINTS.photo.top * stageHeight, 9);
    expect(left(prints.sheet)).toBeCloseTo(PRINTS.sheet.left * STAGE_WIDTH, 9);
    expect(top(prints.sheet)).toBeCloseTo(PRINTS.sheet.top * stageHeight, 9);
  });

  it('keeps both prints within the stage width', () => {
    for (const box of [prints.photo, prints.sheet]) {
      expect(box.x - box.width / 2).toBeGreaterThanOrEqual(-STAGE_WIDTH / 2 - 1e-9);
      expect(box.x + box.width / 2).toBeLessThanOrEqual(STAGE_WIDTH / 2 + 1e-9);
    }
  });
});

describe('heroPins', () => {
  const [photo, sheet] = heroPins();

  it('holds each print at the top of its stage area, the photo left of the sheet', () => {
    const prints = printLayout(STAGE_WIDTH);
    expect(photo.x).toBeLessThan(sheet.x);
    // Near the top edge of each print (turned only a few degrees), in world units.
    expect(photo.y).toBeCloseTo(STATIONS.hero.y + (prints.photo.y + prints.photo.height / 2) * HERO_UNIT, 1);
    expect(sheet.y).toBeCloseTo(STATIONS.hero.y + (prints.sheet.y + prints.sheet.height / 2) * HERO_UNIT, 1);
    // The photo floats in front of the sheet.
    expect(photo.z).toBeGreaterThan(sheet.z);
  });
});

describe('lampAt', () => {
  it('starts dim with the bulb off, flickers, then comes up to full', () => {
    expect(lampAt(0)).toEqual({ level: LAMP.dim, bulb: 0, on: false });
    expect(lampAt(LAMP.flicker + 0.04).bulb).toBe(1);
    expect(lampAt(LAMP.flicker + 0.12).level).toBe(LAMP.dim);
    const rising = lampAt((LAMP.flicker + LAMP.full) / 2 + 0.08);
    expect(rising.level).toBeGreaterThan(LAMP.dim);
    expect(rising.level).toBeLessThan(1);
    expect(lampAt(LAMP.full)).toEqual({ level: 1, bulb: 1, on: true });
    expect(lampAt(10).on).toBe(true);
  });

  it('is fully on before the detection starts', () => {
    expect(LAMP.detectFrom).toBeGreaterThanOrEqual(LAMP.full);
  });
});
