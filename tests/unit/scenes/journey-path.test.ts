import { describe, expect, it } from 'bun:test';

import {
  isReached,
  PATH_HEIGHT,
  pathPlacement,
  pathPoints,
  sectionProgress,
} from '@/scenes/journey-path/layout';

describe('pathPoints', () => {
  it('climbs from bottom to top, alternating sides', () => {
    const points = pathPoints(5);
    expect(points).toHaveLength(5);
    expect(points[0]?.y).toBeCloseTo(-PATH_HEIGHT / 2);
    expect(points[4]?.y).toBeCloseTo(PATH_HEIGHT / 2);
    expect(points.map((p) => Math.sign(p.x))).toEqual([-1, 1, -1, 1, -1]);
    const ys = points.map((p) => p.y);
    expect([...ys].sort((a, b) => a - b)).toEqual(ys);
    expect(new Set(ys).size).toBe(ys.length);
  });

  it('handles zero and one milestone', () => {
    expect(pathPoints(0)).toEqual([]);
    expect(pathPoints(1)).toEqual([{ x: 0, y: 0, z: 0 }]);
  });
});

describe('sectionProgress', () => {
  const vh = 1000;

  it('is 0 before the section enters and 1 after most of it has passed', () => {
    expect(sectionProgress(2000, 800, vh)).toBe(0);
    expect(sectionProgress(-2000, 800, vh)).toBe(1);
  });

  it('is partway through when the section is centered, not already complete', () => {
    const centered = sectionProgress((vh - 650) / 2, 650, vh);
    expect(centered).toBeGreaterThan(0.4);
    expect(centered).toBeLessThan(0.85);
  });

  it('grows while scrolling through the section', () => {
    const a = sectionProgress(600, 800, vh);
    const b = sectionProgress(300, 800, vh);
    expect(a).toBeGreaterThan(0);
    expect(b).toBeGreaterThan(a);
    expect(b).toBeLessThan(1);
  });

  it('completes at the end of the page even if the section cannot scroll far enough', () => {
    expect(sectionProgress(400, 800, vh, true)).toBe(1);
  });

  it('treats an empty section as complete', () => {
    expect(sectionProgress(0, 0, vh)).toBe(1);
  });
});

describe('isReached', () => {
  it('reaches milestones in order as progress grows', () => {
    expect([0, 1, 2, 3, 4].map((i) => isReached(i, 5, 0))).toEqual([true, false, false, false, false]);
    expect([0, 1, 2, 3, 4].map((i) => isReached(i, 5, 0.5))).toEqual([true, true, true, false, false]);
    expect([0, 1, 2, 3, 4].map((i) => isReached(i, 5, 1))).toEqual([true, true, true, true, true]);
  });

  it('handles a single milestone', () => {
    expect(isReached(0, 1, 0)).toBe(false);
    expect(isReached(0, 1, 0.1)).toBe(true);
  });
});

describe('pathPlacement', () => {
  it('shrinks and shifts the path on narrower stages', () => {
    const wide = pathPlacement(1.6);
    const narrow = pathPlacement(0.6);
    expect(narrow.scale).toBeLessThan(wide.scale);
    expect(pathPlacement(0.9).scale).toBeLessThan(wide.scale);
  });
});
