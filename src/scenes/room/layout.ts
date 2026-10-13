/**
 * Page geometry the room still needs (ADR 0020): document rectangles of the HTML slots, which decide
 * when a part is built. Parts stand at fixed stations in the world (./world.ts), not over their HTML.
 * Pure; tested in tests/unit/scenes/room-layout.test.ts.
 */

export interface PageRect {
  /** Document coordinates (CSS px): left/top include the scroll offset. */
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/** True when a rectangle is within `margin` CSS px of the viewport (parts are built when near). */
export function isNear(
  rect: Pick<PageRect, 'top' | 'height'>,
  scrollY: number,
  viewHeight: number,
  margin: number,
): boolean {
  return rect.top < scrollY + viewHeight + margin && rect.top + rect.height > scrollY - margin;
}
