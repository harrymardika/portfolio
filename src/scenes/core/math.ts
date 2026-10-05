/** Small numeric helpers for animation. Pure and framework-free. */

/** Longest frame step the simulation accepts, in seconds (~20 fps). */
export const MAX_FRAME_DELTA = 0.05;

/** Highest device pixel ratio rendered; beyond 2 costs GPU time with little visible gain. */
export const MAX_PIXEL_RATIO = 2;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Frame delta in seconds, clamped to [0, MAX_FRAME_DELTA].
 * Negative deltas (first frame, clock skew) and long pauses (background tab) would otherwise
 * make animations jump or crash path lookups, as happened in the theme prototype.
 */
export function frameDelta(previousMs: number, nowMs: number): number {
  return clamp((nowMs - previousMs) / 1000, 0, MAX_FRAME_DELTA);
}

/** Frame-rate independent easing of `current` toward `target`. Higher `rate` reacts faster. */
export function damp(current: number, target: number, rate: number, dt: number): number {
  return target + (current - target) * Math.exp(-rate * dt);
}

/** Hermite smoothstep between edges, returning 0..1. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function cappedPixelRatio(devicePixelRatio: number, max = MAX_PIXEL_RATIO): number {
  return clamp(Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1, 1, max);
}
