/**
 * Photo card geometry and motion. Shared by the 3D scene and the static HTML card
 * (src/components/hero/PhotoCard.astro) so both look the same.
 */

/** Card texture size in pixels; the card face keeps this aspect ratio. */
export const CARD_TEXTURE = { width: 640, height: 820, padding: 28, radius: 40 } as const;

/** Face detection box as fractions of the square photo (matches content/media/profile.jpg). */
export const FACE_BOX = { x: 0.3, y: 0.07, width: 0.39, height: 0.46 } as const;

/** One detection "lock" cycle in seconds: the box zooms in, holds, then releases. */
export const LOCK_PERIOD = 4;

export const MOTION = {
  /** Max card tilt toward the pointer, radians. */
  tiltY: 0.45,
  tiltX: 0.3,
  /** Idle sway amplitude and speed when the pointer is away. */
  swayAmplitude: 0.12,
  swaySpeed: 0.6,
  /** How quickly the card follows the pointer (see damp()). */
  followRate: 4,
  ringSpeed: 0.2,
  bobAmplitude: 0.15,
} as const;
