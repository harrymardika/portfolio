import { describe, expect, it } from 'bun:test';

import { ballAt, beadPositions, threadWaypoints } from '@/scenes/room/parts/journey';
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
  it('runs from the hero sheet through every bead, top to bottom, down to the sorting line', () => {
    const beads = beadPositions(5);
    const points = threadWaypoints(beads);
    expect(points[0]).toEqual(STATIONS.journey.start);
    expect(points[points.length - 1]).toEqual(STATIONS.journey.end);
    for (const bead of beads) expect(points).toContainEqual(bead);
    // Down the wall, never climbing back up, then along the floor; it only rises onto the belt at the end.
    const ys = points.slice(0, -1).map((point) => point.y);
    for (let i = 1; i < ys.length; i++) expect(ys[i] ?? 0).toBeLessThanOrEqual((ys[i - 1] ?? 0) + 1e-9);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(FLOOR_Y);
    expect(STATIONS.journey.end.y - FLOOR_Y).toBeLessThan(1);
  });
});

describe('ballAt', () => {
  it('follows the camera: start → first bead → last bead → the line', () => {
    expect(ballAt(-1, 0.2, 0.7)).toBe(0);
    expect(ballAt(0, 0.2, 0.7)).toBe(0);
    expect(ballAt(0.5, 0.2, 0.7)).toBeCloseTo(0.1, 9);
    expect(ballAt(1, 0.2, 0.7)).toBe(0.2);
    expect(ballAt(1.5, 0.2, 0.7)).toBeCloseTo(0.45, 9);
    expect(ballAt(2, 0.2, 0.7)).toBe(0.7);
    expect(ballAt(3, 0.2, 0.7)).toBe(1);
    expect(ballAt(5, 0.2, 0.7)).toBe(1);
  });
});
