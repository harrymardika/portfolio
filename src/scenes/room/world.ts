/**
 * The room's fixed world (ADR 0020), in world units, after the approved "one room" artifact: a wall
 * behind the hero and the journey, a floor in front of it for the sorting line, the Kind words
 * notes, and the homelab laptop. Parts stand at their station; the camera (./camera.ts) travels
 * between them as the page scrolls. Plain data, shared by the parts and the camera keys.
 */

export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export const vec3 = (x: number, y: number, z: number): Vec3 => ({ x, y, z });

/** The floor's height; the wall stands at depth `WALL_Z` and rises from the floor. */
export const FLOOR_Y = -28;
export const WALL_Z = -2.2;
/** Size of the shadow-catching wall and floor. */
export const WALL = { width: 80, height: 44 } as const;
export const FLOOR = { width: 80, depth: 60 } as const;

/**
 * World units per design pixel. Parts keep their geometry in design pixels (the sizes they had on
 * the page in Phase 13) and scale their root by this, so the hero stage (600 px) is 5.1 units wide.
 */
export const DESIGN_UNIT = 0.0085;

/** Where each part stands. */
export const STATIONS = {
  /** Centre of the hero stage (photo print and aksara sheet), on the wall plane. */
  hero: vec3(0.3, -0.1, 0),
  /** The journey beads, top to bottom, just in front of the wall. */
  journey: {
    beads: [
      vec3(-1.1, -6.5, -1.2),
      vec3(1.1, -9.5, -1.2),
      vec3(-1.1, -12.5, -1.2),
      vec3(1.1, -15.5, -1.2),
      vec3(-1.1, -18.5, -1.2),
    ],
    /** The thread leaves the hero sheet here and ends at the start of the sorting line. */
    start: vec3(1.9, -2.1, -1.0),
    end: vec3(-9.4, FLOOR_Y + 0.5, 6),
  },
  /** Centre of the sorting line, on the floor. */
  sorting: vec3(0, FLOOR_Y, 6),
  /** Bottom centre of the Kind words notes, upright on the floor between the line and the laptop. */
  notes: vec3(-3.2, FLOOR_Y + 0.3, 11),
  /** The homelab laptop, on the floor. */
  laptop: vec3(0.6, FLOOR_Y, 16),
} as const;
