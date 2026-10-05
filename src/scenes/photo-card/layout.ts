import { smoothstep } from '@/scenes/core/math';

import { LOCK_PERIOD } from './config';

/**
 * Detection lock amount 0..1 at time `t`: fades in over the first 12% of the cycle,
 * holds, then releases over the last 10%.
 */
export function lockAmount(t: number, period = LOCK_PERIOD): number {
  const phase = (((t % period) + period) % period) / period;
  if (phase < 0.12) return smoothstep(0, 0.12, phase);
  if (phase > 0.9) return 1 - smoothstep(0.9, 1, phase);
  return 1;
}

/** World height visible at distance `distance` for a vertical field of view in degrees. */
export function visibleHeight(fovDegrees: number, distance: number): number {
  return 2 * distance * Math.tan((fovDegrees * Math.PI) / 360);
}

/**
 * Scale for the card group so the card (and its orbit ring) fits the stage.
 * `contentWidth`/`contentHeight` are the group's world size at scale 1.
 */
export function fitScale(
  aspect: number,
  viewHeight: number,
  contentWidth: number,
  contentHeight: number,
): number {
  if (!(aspect > 0)) return 1;
  const viewWidth = viewHeight * aspect;
  return Math.min(1, viewWidth / contentWidth, viewHeight / contentHeight);
}
