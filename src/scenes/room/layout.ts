/**
 * Mapping between the page (CSS pixels, document coordinates) and the room's world units (ADR 0019).
 * The camera looks at the page plane (z = 0) from `distance` with a vertical field of view `fov`;
 * at that plane one CSS pixel is `worldPerPixel` world units, so 3D objects anchored to HTML elements
 * line up with them on every screen. Pure functions; tested in tests/unit/scenes/room-layout.test.ts.
 */
import { clamp } from '../core/math';

export interface PageRect {
  /** Document coordinates (CSS px): left/top include the scroll offset. */
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/** World units per CSS pixel on the page plane. */
export function worldPerPixel(viewHeight: number, distance: number, fovDegrees: number): number {
  if (viewHeight <= 0) return 0;
  return (2 * distance * Math.tan((fovDegrees * Math.PI) / 360)) / viewHeight;
}

/**
 * World position of a document point, inside the "page" group. The group itself is moved by
 * `pageOffset` every frame, so scrolling never rebuilds anything.
 */
export function pageToWorld(x: number, y: number, viewWidth: number, wpp: number): { x: number; y: number } {
  return { x: (x - viewWidth / 2) * wpp, y: -y * wpp };
}

/** Vertical position of the page group for a scroll position, so that page point y = scrollY + h/2 sits at 0. */
export function pageOffset(scrollY: number, viewHeight: number, wpp: number): number {
  return (scrollY + viewHeight / 2) * wpp;
}

/** Centre of a rectangle in world units (inside the page group). */
export function rectCenter(rect: PageRect, viewWidth: number, wpp: number): { x: number; y: number } {
  return pageToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2, viewWidth, wpp);
}

/** Uniform scale that fits an object of nominal world size into a rectangle, with a margin (0..1). */
export function fitScale(
  rect: Pick<PageRect, 'width' | 'height'>,
  nominal: { readonly width: number; readonly height: number },
  wpp: number,
  margin = 0,
): number {
  if (nominal.width <= 0 || nominal.height <= 0) return 0;
  const room = 1 - clamp(margin, 0, 0.9);
  return Math.min((rect.width * wpp * room) / nominal.width, (rect.height * wpp * room) / nominal.height);
}

/**
 * How far an element has travelled through the viewport: 0 when its top reaches the bottom edge,
 * 1 when its bottom leaves the top edge.
 */
export function viewProgress(
  rect: Pick<PageRect, 'top' | 'height'>,
  scrollY: number,
  viewHeight: number,
): number {
  const span = rect.height + viewHeight;
  if (span <= 0) return 0;
  return clamp((scrollY + viewHeight - rect.top) / span, 0, 1);
}

/** True when a rectangle is within `margin` CSS px of the viewport (rooms are built when near). */
export function isNear(
  rect: Pick<PageRect, 'top' | 'height'>,
  scrollY: number,
  viewHeight: number,
  margin: number,
): boolean {
  return rect.top < scrollY + viewHeight + margin && rect.top + rect.height > scrollY - margin;
}

/**
 * Index along a path whose sample points are ordered top to bottom (page y increasing), where the
 * path crosses the reading line `lineY` (document px). Returns a fraction 0..1 of the path.
 * Used to move the journey ball with the reader. `ys` must be non-decreasing.
 */
export function crossing(ys: readonly number[], lineY: number): number {
  const n = ys.length;
  if (n === 0) return 0;
  const first = ys[0] ?? 0;
  const last = ys[n - 1] ?? 0;
  if (n === 1 || lineY <= first) return 0;
  if (lineY >= last) return 1;
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if ((ys[mid] ?? 0) <= lineY) lo = mid;
    else hi = mid;
  }
  const a = ys[lo] ?? 0;
  const b = ys[hi] ?? 0;
  const t = b === a ? 0 : (lineY - a) / (b - a);
  return (lo + t) / (n - 1);
}
