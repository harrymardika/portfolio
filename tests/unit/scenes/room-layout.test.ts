import { describe, expect, it } from 'bun:test';

import { isNear } from '@/scenes/room/layout';

describe('isNear', () => {
  it('detects rectangles within a margin of the viewport', () => {
    expect(isNear({ top: 2000, height: 100 }, 0, 800, 500)).toBe(false);
    expect(isNear({ top: 1200, height: 100 }, 0, 800, 500)).toBe(true);
    expect(isNear({ top: 0, height: 100 }, 1000, 800, 500)).toBe(false);
  });
});
