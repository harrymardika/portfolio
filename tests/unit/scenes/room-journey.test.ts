import { describe, expect, it } from 'bun:test';

import { heroPins } from '@/scenes/room/parts/hero-config';
import { ballAt, beadPositions, clotheslineNails, threadWaypoints } from '@/scenes/room/parts/journey';
import { FLOOR_Y, STATIONS } from '@/scenes/room/world';

describe('beadPositions', () => {
  it('uses the stations when there are as many milestones', () => {
    expect(beadPositions(STATIONS.journey.beads.length)).toEqual([...STATIONS.journey.beads]);
  });

  it('spreads other counts between the first and the last station, alternating sides', () => {
    const first = STATIONS.journey.beads[0];
    const last = STATIONS.journey.beads[STATIONS.journey.beads.length - 1];
    const beads = beadPositions(3);
    expect(beads).toHaveLength(3);
    expect(beads[0]?.y).toBe(first?.y);
    expect(beads[2]?.y).toBe(last?.y);
    expect(beads[0]?.x).toBe(-(beads[1]?.x ?? 0));
    expect(beadPositions(1)).toHaveLength(1);
  });
});

describe('threadWaypoints', () => {
  const beads = beadPositions(5);
  const points = threadWaypoints(beads);
  const [left, right] = clotheslineNails();
  const [photo, sheet] = heroPins();
  const at = (point: { x: number; y: number; z: number } | undefined) =>
    points.findIndex((p) => p.x === point?.x && p.y === point.y && p.z === point.z);

  it('is one thread: the clothesline through both clothespins, then the beads, down to the line', () => {
    expect(points[0]).toEqual(left);
    expect(points).toContainEqual(photo);
    expect(points).toContainEqual(sheet);
    expect(points).toContainEqual(right);
    expect(at(photo)).toBeGreaterThan(0);
    expect(at(photo)).toBeLessThan(at(sheet));
    expect(at(right)).toBeLessThan(at(beads[0]));
    for (const bead of beads) expect(points).toContainEqual(bead);
    expect(points[points.length - 1]).toEqual(STATIONS.journey.end);
  });

  it('hangs between nails above the pins, sagging between them', () => {
    expect(left.y).toBeGreaterThan(photo.y);
    expect(right.y).toBeGreaterThan(sheet.y);
    const sag = points[at(photo) + 1];
    expect(sag?.y).toBeLessThan(Math.min(photo.y, sheet.y));
  });

  it('runs down the wall from the second nail, then along the floor, rising only onto the belt', () => {
    const ys = points.slice(at(right), -1).map((point) => point.y);
    for (let i = 1; i < ys.length; i++) expect(ys[i] ?? 0).toBeLessThanOrEqual((ys[i - 1] ?? 0) + 1e-9);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(FLOOR_Y);
    expect(STATIONS.journey.end.y - FLOOR_Y).toBeLessThan(1);
  });
});

describe('ballAt', () => {
  it('waits at the end of the clothesline, then follows the camera down to the line', () => {
    expect(ballAt(-1, 0.1, 0.2, 0.7)).toBe(0.1);
    expect(ballAt(0, 0.1, 0.2, 0.7)).toBe(0.1);
    expect(ballAt(0.5, 0.1, 0.2, 0.7)).toBeCloseTo(0.15, 9);
    expect(ballAt(1, 0.1, 0.2, 0.7)).toBe(0.2);
    expect(ballAt(1.5, 0.1, 0.2, 0.7)).toBeCloseTo(0.45, 9);
    expect(ballAt(2, 0.1, 0.2, 0.7)).toBe(0.7);
    expect(ballAt(3, 0.1, 0.2, 0.7)).toBe(1);
    expect(ballAt(5, 0.1, 0.2, 0.7)).toBe(1);
  });
});
