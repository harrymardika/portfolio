import { describe, expect, it } from 'bun:test';

import {
  crossing,
  fitScale,
  isNear,
  pageOffset,
  pageToWorld,
  rectCenter,
  viewProgress,
  worldPerPixel,
} from '@/scenes/room/layout';

describe('worldPerPixel', () => {
  it('maps the viewport height to the visible height of the page plane', () => {
    const wpp = worldPerPixel(900, 10, 30);
    // Visible height at distance 10 with a 30° field of view: 2 · 10 · tan(15°).
    expect(wpp * 900).toBeCloseTo(2 * 10 * Math.tan(Math.PI / 12), 6);
  });

  it('is zero for an empty viewport', () => {
    expect(worldPerPixel(0, 10, 30)).toBe(0);
  });
});

describe('page ↔ world', () => {
  const view = { width: 1200, height: 800 };
  const wpp = worldPerPixel(view.height, 10, 30);

  it('puts the viewport centre at the origin once the page group is offset', () => {
    const scrollY = 1500;
    const point = pageToWorld(view.width / 2, scrollY + view.height / 2, view.width, wpp);
    expect(point.x).toBeCloseTo(0, 9);
    expect(point.y + pageOffset(scrollY, view.height, wpp)).toBeCloseTo(0, 9);
  });

  it('keeps the top of the viewport at the top edge of the camera view', () => {
    const scrollY = 300;
    const top = pageToWorld(0, scrollY, view.width, wpp).y + pageOffset(scrollY, view.height, wpp);
    expect(top).toBeCloseTo((view.height / 2) * wpp, 9);
  });

  it('finds a rectangle centre', () => {
    const center = rectCenter({ left: 600, top: 100, width: 200, height: 100 }, view.width, wpp);
    expect(center.x).toBeCloseTo(100 * wpp, 9);
    expect(center.y).toBeCloseTo(-150 * wpp, 9);
  });
});

describe('fitScale', () => {
  it('fits the limiting side with a margin', () => {
    expect(fitScale({ width: 400, height: 200 }, { width: 2, height: 2 }, 0.01)).toBeCloseTo(1, 9);
    expect(fitScale({ width: 400, height: 200 }, { width: 2, height: 2 }, 0.01, 0.1)).toBeCloseTo(0.9, 9);
  });

  it('is zero for an empty object', () => {
    expect(fitScale({ width: 400, height: 200 }, { width: 0, height: 2 }, 0.01)).toBe(0);
  });
});

describe('viewProgress and isNear', () => {
  it('runs from 0 (just below the viewport) to 1 (just above it)', () => {
    const rect = { top: 2000, height: 400 };
    expect(viewProgress(rect, 2000 - 800, 800)).toBe(0);
    expect(viewProgress(rect, 2400, 800)).toBe(1);
    expect(viewProgress(rect, 1800, 800)).toBeCloseTo(0.5, 9);
  });

  it('detects rectangles within a margin of the viewport', () => {
    expect(isNear({ top: 2000, height: 100 }, 0, 800, 500)).toBe(false);
    expect(isNear({ top: 1200, height: 100 }, 0, 800, 500)).toBe(true);
    expect(isNear({ top: 0, height: 100 }, 1000, 800, 500)).toBe(false);
  });
});

describe('crossing', () => {
  const ys = [100, 200, 300, 400];

  it('clamps before and after the path', () => {
    expect(crossing(ys, 50)).toBe(0);
    expect(crossing(ys, 450)).toBe(1);
    expect(crossing([], 50)).toBe(0);
    expect(crossing([100], 500)).toBe(0);
  });

  it('interpolates between samples', () => {
    expect(crossing(ys, 250)).toBeCloseTo(0.5, 9);
    expect(crossing(ys, 300)).toBeCloseTo(2 / 3, 9);
  });

  it('handles flat stretches', () => {
    expect(crossing([100, 100, 200], 100)).toBeGreaterThanOrEqual(0);
    expect(crossing([100, 100, 200], 150)).toBeCloseTo(0.75, 9);
  });
});
