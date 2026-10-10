import { describe, expect, it } from 'bun:test';

import sheet from '../../../content/media/aksara-sheet.json';
import { SEQUENCE } from '@/scenes/room/parts/hero-config';
import { boxOnPrint, curl, sequenceAt } from '@/scenes/room/parts/hero';

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
