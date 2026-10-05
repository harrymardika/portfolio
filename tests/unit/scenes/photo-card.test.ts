import { describe, expect, it } from 'bun:test';

import { fitScale, lockAmount, visibleHeight } from '@/scenes/photo-card/layout';

describe('lockAmount', () => {
  it('starts released, locks, holds, and releases each cycle', () => {
    expect(lockAmount(0)).toBe(0);
    expect(lockAmount(0.24)).toBeCloseTo(0.5, 5); // halfway through the 0.48 s lock-in
    expect(lockAmount(2)).toBe(1);
    expect(lockAmount(3.9)).toBeLessThan(1);
    expect(lockAmount(4)).toBe(0); // next cycle
  });

  it('handles negative time without leaving 0..1', () => {
    for (const t of [-0.1, -2, -3.99]) {
      const value = lockAmount(t);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});

describe('visibleHeight', () => {
  it('matches the camera frustum height', () => {
    expect(visibleHeight(90, 1)).toBeCloseTo(2, 10);
  });
});

describe('fitScale', () => {
  it('never enlarges and shrinks to fit narrow or short stages', () => {
    expect(fitScale(2, 10, 6, 6)).toBe(1);
    expect(fitScale(0.5, 10, 6, 6)).toBeCloseTo(5 / 6, 10); // width-limited
    expect(fitScale(2, 4, 6, 6)).toBeCloseTo(4 / 6, 10); // height-limited
  });

  it('falls back to 1 for an invalid aspect ratio', () => {
    expect(fitScale(0, 10, 6, 6)).toBe(1);
    expect(fitScale(Number.NaN, 10, 6, 6)).toBe(1);
  });
});
