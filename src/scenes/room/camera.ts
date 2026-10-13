/**
 * The camera of the full-screen room (ADR 0020): one key per room (target, direction, distance, the
 * world width that must fit, and a view offset that moves the subject beside the copy), reached at
 * scroll positions taken from the page's sections. Between two keys the camera eases from one pose
 * to the next. Pure functions; tested in tests/unit/scenes/room-camera.test.ts.
 */
import { clamp, smoothstep } from '../core/math';
import { FLOOR_Y, STATIONS, vec3, type Vec3 } from './world';

/** Vertical field of view, degrees. */
export const FOV = 30;
/** From this viewport width (CSS px) the copy sits in a left column (the CSS `lg` breakpoint). */
export const WIDE_MIN = 1024;

export interface Framing {
  readonly target: Vec3;
  /** World width that must fit in the part of the view the subject may use. */
  readonly fit: number;
  /** View offset as fractions of the screen: x < 0 moves the subject right, y > 0 moves it up. */
  readonly offset: { readonly x: number; readonly y: number };
}

export interface CameraKey {
  /** From the target toward the camera (normalized when used). */
  readonly dir: Vec3;
  /** Closest the camera comes; it backs off further when the subject would not fit. */
  readonly distance: number;
  /** Wide screens: subject on the right of the copy column. */
  readonly wide: Framing;
  /** Phones and tablets: subject in the upper part, above the copy panel. */
  readonly narrow: Framing;
}

export type KeyName = 'hero' | 'journeyStart' | 'journeyEnd' | 'projects' | 'messages' | 'contact';

const beads = STATIONS.journey.beads;
const firstBead = beads[0] ?? vec3(0, -6.5, -1.2);
const lastBead = beads[beads.length - 1] ?? vec3(0, -18.5, -1.2);
const side = { x: -0.22, y: 0 } as const;
/** Middle of the Kind words notes (two rows at most, standing on the floor). */
const notesCentre = vec3(STATIONS.notes.x, STATIONS.notes.y + 1.6, STATIONS.notes.z);
const above = { x: 0, y: 0.24 } as const;

export const CAMERA_KEYS: Readonly<Record<KeyName, CameraKey>> = {
  hero: {
    dir: vec3(0, 0, 1),
    distance: 11,
    // The clothesline, nail to nail, and the lamp above it.
    wide: { target: vec3(STATIONS.hero.x, STATIONS.hero.y + 0.4, 0), fit: 7.9, offset: side },
    // Phones: a little more room above, so the lamp clears the header.
    narrow: { target: vec3(STATIONS.hero.x, STATIONS.hero.y + 1.1, 0), fit: 7.4, offset: above },
  },
  journeyStart: {
    dir: vec3(0.25, 0.12, 1),
    distance: 10,
    wide: { target: vec3(0, firstBead.y + 1, firstBead.z), fit: 4.6, offset: side },
    narrow: { target: vec3(0, firstBead.y + 1, firstBead.z), fit: 4.4, offset: above },
  },
  journeyEnd: {
    dir: vec3(0.25, 0.12, 1),
    distance: 10,
    wide: { target: vec3(0, lastBead.y + 0.5, lastBead.z), fit: 4.6, offset: side },
    narrow: { target: vec3(0, lastBead.y + 0.5, lastBead.z), fit: 4.4, offset: above },
  },
  projects: {
    dir: vec3(0, 0.8, 0.6),
    distance: 14,
    wide: { target: vec3(0.3, FLOOR_Y, STATIONS.sorting.z + 0.4), fit: 17.5, offset: { x: 0, y: -0.3 } },
    narrow: { target: vec3(-3.6, FLOOR_Y, STATIONS.sorting.z + 0.4), fit: 6.6, offset: { x: 0, y: 0.28 } },
  },
  messages: {
    dir: vec3(0.15, 0.2, 1),
    distance: 8,
    wide: { target: notesCentre, fit: 9, offset: side },
    narrow: { target: notesCentre, fit: 5, offset: above },
  },
  contact: {
    dir: vec3(-0.3, 0.42, 0.86),
    distance: 6.5,
    wide: { target: vec3(STATIONS.laptop.x, FLOOR_Y + 0.7, STATIONS.laptop.z), fit: 3.6, offset: side },
    narrow: { target: vec3(STATIONS.laptop.x, FLOOR_Y + 0.7, STATIONS.laptop.z), fit: 3.4, offset: above },
  },
};

/** The keys in page order. */
export const KEY_ORDER: readonly KeyName[] = [
  'hero',
  'journeyStart',
  'journeyEnd',
  'projects',
  'messages',
  'contact',
];

export interface View {
  readonly width: number;
  readonly height: number;
}

export interface Pose {
  readonly position: Vec3;
  readonly target: Vec3;
  readonly offset: { readonly x: number; readonly y: number };
}

const add = (a: Vec3, b: Vec3): Vec3 => vec3(a.x + b.x, a.y + b.y, a.z + b.z);
const scale = (a: Vec3, k: number): Vec3 => vec3(a.x * k, a.y * k, a.z * k);
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
const mixVec = (a: Vec3, b: Vec3, t: number): Vec3 =>
  vec3(mix(a.x, b.x, t), mix(a.y, b.y, t), mix(a.z, b.z, t));
const normalize = (a: Vec3): Vec3 => {
  const length = Math.hypot(a.x, a.y, a.z);
  return length > 0 ? scale(a, 1 / length) : vec3(0, 0, 1);
};

export const isWide = (view: View): boolean => view.width >= WIDE_MIN;

/** Distance at which a width `fit` fills `usable` of the screen width. */
export function fitDistance(fit: number, fovDegrees: number, aspect: number, usable: number): number {
  const half = Math.tan((fovDegrees * Math.PI) / 360);
  if (half <= 0 || aspect <= 0 || usable <= 0) return 0;
  return fit / 2 / (half * aspect * usable);
}

/** The camera pose for one key on this screen. */
export function poseFor(key: CameraKey, view: View): Pose {
  const wide = isWide(view);
  const framing = wide ? key.wide : key.narrow;
  const aspect = view.height > 0 ? view.width / view.height : 1;
  // Beside the copy column the subject has about half the screen; otherwise nearly all of it.
  const usable = wide && framing.offset.x !== 0 ? 0.56 : 0.95;
  const distance = Math.max(key.distance, fitDistance(framing.fit, FOV, aspect, usable));
  return {
    target: framing.target,
    position: add(framing.target, scale(normalize(key.dir), distance)),
    offset: framing.offset,
  };
}

export interface SectionBox {
  /** Document position (CSS px). */
  readonly top: number;
  readonly height: number;
}

export type Sections = Partial<Record<'hero' | 'journey' | 'projects' | 'messages' | 'contact', SectionBox>>;

/** A key and the scroll position (CSS px) where the camera reaches it. */
export interface Stop {
  readonly key: KeyName;
  readonly scroll: number;
}

/**
 * Where the camera reaches each key, from the sections' positions: the hero at the top, the journey
 * from just before its section until its end (the camera travels down the thread while it scrolls
 * by), and every other room when its section is centred on the screen. Sections that are missing
 * (no selected projects) are skipped. Positions never pass the end of the page and always increase;
 * on a page too short for them, the later rooms are squeezed in before its end rather than pushed
 * past it (where scrolling could never reach them).
 */
export function stopsFor(sections: Sections, viewHeight: number, maxScroll: number): Stop[] {
  const h = viewHeight;
  const centred = (box: SectionBox) => box.top + (box.height - h) / 2;
  const raw: { key: KeyName; scroll: number }[] = [{ key: 'hero', scroll: 0 }];
  if (sections.journey) {
    raw.push({ key: 'journeyStart', scroll: sections.journey.top - h * 0.25 });
    raw.push({ key: 'journeyEnd', scroll: sections.journey.top + sections.journey.height - h * 1.05 });
  }
  if (sections.projects) raw.push({ key: 'projects', scroll: centred(sections.projects) });
  if (sections.messages) raw.push({ key: 'messages', scroll: centred(sections.messages) });
  if (sections.contact)
    raw.push({ key: 'contact', scroll: sections.contact.top + Math.max(0, sections.contact.height - h) / 2 });
  const end = Math.max(0, maxScroll);
  const at = raw.map(({ scroll }) => clamp(scroll, 0, end));
  // Increasing from the top, then never past the end: each stop at least 1 px before the next.
  for (let i = 1; i < at.length; i++) at[i] = Math.max(at[i] ?? 0, (at[i - 1] ?? 0) + 1);
  for (let i = at.length - 1; i >= 0; i--) {
    const limit = i === at.length - 1 ? end : (at[i + 1] ?? end) - 1;
    at[i] = Math.min(at[i] ?? 0, limit);
  }
  return raw.map(({ key }, i) => ({ key, scroll: at[i] ?? 0 }));
}

/** Where the scroll position falls between two stops: their indices and the eased fraction. */
export interface Track {
  readonly from: number;
  readonly to: number;
  readonly local: number;
}

export function trackAt(scroll: number, stops: readonly Stop[]): Track {
  const last = stops.length - 1;
  if (last <= 0) return { from: 0, to: 0, local: 0 };
  let i = 0;
  while (i < last - 1 && scroll >= (stops[i + 1]?.scroll ?? Infinity)) i++;
  const a = stops[i]?.scroll ?? 0;
  const b = stops[i + 1]?.scroll ?? a + 1;
  return { from: i, to: i + 1, local: smoothstep(a, b, scroll) };
}

/** The camera pose at a point of the track. */
export function poseAt(
  track: Track,
  stops: readonly Stop[],
  view: View,
  keys: Readonly<Record<KeyName, CameraKey>> = CAMERA_KEYS,
): Pose {
  const from = stops[track.from];
  const to = stops[track.to] ?? from;
  if (!from || !to) return poseFor(keys.hero, view);
  const a = poseFor(keys[from.key], view);
  const b = poseFor(keys[to.key], view);
  const t = track.local;
  return {
    position: mixVec(a.position, b.position, t),
    target: mixVec(a.target, b.target, t),
    offset: { x: mix(a.offset.x, b.offset.x, t), y: mix(a.offset.y, b.offset.y, t) },
  };
}

/**
 * Position along the keys in page order (0 = hero … 5 = contact), continuous, so parts can follow
 * the camera (the journey ball rides the thread between the two journey keys).
 */
export function keyPosition(track: Track, stops: readonly Stop[]): number {
  const from = stops[track.from];
  const to = stops[track.to] ?? from;
  if (!from || !to) return 0;
  return mix(KEY_ORDER.indexOf(from.key), KEY_ORDER.indexOf(to.key), track.local);
}

/**
 * How far the camera is from the jade end (0) to the indigo end (1) of the room, in `steps` discrete
 * steps, so the wall colors change only now and then.
 */
export function flowAt(track: Track, stops: readonly Stop[], steps = 40): number {
  const last = stops.length - 1;
  if (last <= 0) return 0;
  const progress = clamp((track.from + track.local) / last, 0, 1);
  return Math.round(progress * steps) / steps;
}

/**
 * The three wall colors (`--room-a/b/c`, top, middle, and bottom of the screen) for a point of the
 * flow: CSS `color-mix()` of the room tokens along the same jade → indigo path as the page gradient
 * (room-top → room-mid → room-bottom), so the theme still decides the actual colors and the text
 * contrast checked for that path holds. `spread` is how much of the path one screen shows.
 */
export function wallColors(flow: number, spread = 0.12): { a: string; b: string; c: string } {
  const at = (point: number): string => {
    const q = clamp(point, 0, 1);
    return q <= 0.5
      ? `color-mix(in srgb, var(--room-top), var(--room-mid) ${Math.round(q * 200)}%)`
      : `color-mix(in srgb, var(--room-mid), var(--room-bottom) ${Math.round((q - 0.5) * 200)}%)`;
  };
  const centre = clamp(flow, spread / 2, 1 - spread / 2);
  return { a: at(centre - spread / 2), b: at(centre), c: at(centre + spread / 2) };
}
