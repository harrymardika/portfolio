/** Pure geometry and scroll math for the journey path. */
import { clamp } from '@/scenes/core/math';

export interface Point3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/** Vertical extent of the path in world units (bottom to top). */
export const PATH_HEIGHT = 5.3;
/** Horizontal zig-zag amplitude in world units. */
export const PATH_SWING = 1;

/**
 * Milestone positions for `count` milestones: oldest at the bottom, climbing upward,
 * alternating left/right and front/back so the tube reads as a 3D path.
 */
export function pathPoints(count: number): Point3[] {
  if (count <= 0) return [];
  if (count === 1) return [{ x: 0, y: 0, z: 0 }];
  return Array.from({ length: count }, (_, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    return {
      x: side * PATH_SWING * (i === 0 || i === count - 1 ? 0.6 : 1),
      y: -PATH_HEIGHT / 2 + (PATH_HEIGHT * i) / (count - 1),
      z: side * 0.5,
    };
  });
}

/**
 * Scroll progress through the section, 0..1. It starts when the section's top is 75% down the
 * viewport, is about two thirds when the section is centered, and completes once the top has
 * scrolled 30% of the section height past the top of the viewport. At the very end of the page the
 * path always completes, even when the page is too short to scroll that far (e.g. on phones).
 */
export function sectionProgress(
  top: number,
  height: number,
  viewportHeight: number,
  atPageEnd = false,
): number {
  if (height <= 0 || atPageEnd) return 1;
  const start = viewportHeight * 0.75;
  return clamp((start - top) / (start + height * 0.3), 0, 1);
}

/** Milestone index `index` of `count` counts as reached once progress passes its position. */
export function isReached(index: number, count: number, progress: number): boolean {
  if (count <= 1) return progress > 0;
  return progress >= index / (count - 1) - 0.01;
}

/**
 * World offset and scale for the path group so labels (drawn to the right of each node) fit.
 * Wide stages center the path in the left half; narrow stages push it toward the left edge.
 */
export function pathPlacement(aspect: number): { x: number; scale: number } {
  if (aspect >= 1.1) return { x: -1.2, scale: 0.88 };
  if (aspect >= 0.75) return { x: -1.6, scale: 0.75 };
  return { x: -1.3, scale: 0.6 };
}
