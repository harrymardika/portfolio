import { describe, expect, it } from 'bun:test';

import { detour, monotonic, threadPoints } from '@/scenes/room/parts/journey';

describe('threadPoints', () => {
  it('passes through the start, every bead, and the end; swings left between beads', () => {
    const beads = [
      { x: 100, y: 100 },
      { x: 100, y: 200 },
      { x: 100, y: 300 },
    ];
    const points = threadPoints({ start: { x: 300, y: 0 }, beads, end: { x: 100, y: 400 } });
    expect(points).toHaveLength(9);
    expect(points.filter((_, i) => i % 2 === 0)).toEqual([{ x: 300, y: 0 }, ...beads, { x: 100, y: 400 }]);
    // Start → first bead and last bead → end run straight (halfway point).
    expect(points[1]).toEqual({ x: 200, y: 50 });
    expect(points[7]).toEqual({ x: 100, y: 350 });
    // Between beads: always to the left, wide then narrow.
    expect(points[3]).toEqual({ x: 52, y: 150 });
    expect(points[5]).toEqual({ x: 82, y: 250 });
  });

  it('keeps swings inside the page when the beads hug the left edge (phones)', () => {
    const beads = [26, 126, 226].map((y) => ({ x: 26, y }));
    const points = threadPoints({ start: null, beads, end: null });
    expect(Math.min(...points.map((point) => point.x))).toBe(12);
  });

  it('works without a start or an end', () => {
    const points = threadPoints({
      start: null,
      beads: [
        { x: 100, y: 0 },
        { x: 100, y: 10 },
      ],
      end: null,
    });
    expect(points).toEqual([
      { x: 100, y: 0 },
      { x: 52, y: 5 },
      { x: 100, y: 10 },
    ]);
  });
});

describe('monotonic', () => {
  it('never goes back up', () => {
    expect(monotonic([0, 5, 4, 6, 6, 3, 9])).toEqual([0, 5, 5, 6, 6, 6, 9]);
  });
});

describe('detour', () => {
  const heading = { left: 16, top: 1000, right: 360, bottom: 1100 };

  it('leaves a segment alone when it does not cross the text', () => {
    // Desktop: the heading sits left of the timeline.
    expect(detour({ x: 900, y: 600 }, { x: 650, y: 1300 }, { ...heading, right: 560 }, 1440)).toEqual([]);
    // Text entirely above or below the segment.
    expect(detour({ x: 200, y: 1200 }, { x: 30, y: 1300 }, heading, 412)).toEqual([]);
  });

  it('goes around the text on the side with more room, inside the page', () => {
    // Phone: from the sheet (right) down to the first bead (left), across the heading.
    const around = detour({ x: 250, y: 800 }, { x: 26, y: 1300 }, heading, 412);
    expect(around).toEqual([
      { x: 370, y: 972 },
      { x: 370, y: 1128 },
    ]);
    // Little room on the right: go left, clamped to the page edge.
    const left = detour({ x: 300, y: 800 }, { x: 300, y: 1300 }, { ...heading, left: 300, right: 408 }, 412);
    expect(left.map((point) => point.x)).toEqual([290, 290]);
    const clamped = detour({ x: 5, y: 800 }, { x: 5, y: 1300 }, { ...heading, left: 10, right: 411 }, 412);
    expect(clamped.map((point) => point.x)).toEqual([12, 12]);
  });

  it('threadPoints inserts the detour between the start and the first bead', () => {
    const points = threadPoints({
      start: { x: 250, y: 800 },
      beads: [
        { x: 26, y: 1300 },
        { x: 26, y: 1400 },
      ],
      end: null,
      avoid: heading,
      viewWidth: 412,
    });
    expect(points).toContainEqual({ x: 370, y: 972 });
    expect(points).toContainEqual({ x: 370, y: 1128 });
    expect(points.findIndex((point) => point.y === 1128)).toBeLessThan(
      points.findIndex((point) => point.y === 1300),
    );
  });
});
