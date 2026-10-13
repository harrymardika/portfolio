/**
 * Room part: the journey thread (T13.5, ADR 0020). A thread leaves the bottom of the hero's aksara
 * sheet, runs down the wall through a bead for every milestone of the HTML timeline (Journey.astro),
 * then across the floor to the sorting line. A ball rides the thread as the camera travels down it;
 * beads it has passed glow, and their HTML items are marked reached. Clicking a bead opens the same
 * story as its HTML button.
 */
import {
  CatmullRomCurve3,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three';

import { disposeObject3D } from '../../core/dispose';
import { STATIONS, FLOOR_Y, vec3, type Vec3 } from '../world';

import type { ScenePalette } from '../../core/palette';
import type { RoomContext, RoomFrame, RoomPart, RoomTarget } from '../index';

/** Sizes in world units. */
const SIZE = { thread: 0.07, bead: 0.24, ring: 0.34, ringTube: 0.035, ball: 0.18 } as const;
const SAMPLES = 800;

/**
 * Bead positions for `count` milestones: the stations' beads when the count matches, otherwise as
 * many beads spread evenly between the first and the last station, alternating sides. Pure; tested.
 */
export function beadPositions(count: number): Vec3[] {
  const stations = STATIONS.journey.beads;
  if (count === stations.length) return [...stations];
  const first = stations[0] ?? vec3(-1.1, -6.5, -1.2);
  const last = stations[stations.length - 1] ?? vec3(-1.1, -18.5, -1.2);
  return Array.from({ length: count }, (_, i) => {
    const t = count > 1 ? i / (count - 1) : 0.5;
    return vec3(i % 2 === 0 ? first.x : -first.x, first.y + (last.y - first.y) * t, first.z);
  });
}

/** Points the thread passes through: from the sheet, through every bead, down to the line. Pure; tested. */
export function threadWaypoints(beads: readonly Vec3[]): Vec3[] {
  const { start, end } = STATIONS.journey;
  const last = beads[beads.length - 1] ?? start;
  return [
    start,
    vec3(0.6, start.y - 2.1, -1.1),
    ...beads,
    vec3(0.2, last.y - 3, -1.2),
    vec3(-1.5, FLOOR_Y + 2.5, -1.4),
    vec3(-3.5, FLOOR_Y + 0.12, 0.6),
    vec3(-7.5, FLOOR_Y + 0.12, 4.2),
    end,
  ];
}

/**
 * Where the ball is on the thread (0..1) for the camera's key position (camera.ts `keyPosition`):
 * from the start to the first bead while the camera comes down from the hero, from the first to the
 * last bead along the journey, then on to the sorting line. Pure; tested.
 */
export function ballAt(keys: number, firstBead: number, lastBead: number): number {
  const along = [0, firstBead, lastBead, 1];
  if (keys <= 0) return 0;
  if (keys >= along.length - 1) return 1;
  const i = Math.floor(keys);
  const a = along[i] ?? 0;
  const b = along[i + 1] ?? 1;
  return a + (b - a) * (keys - i);
}

interface Bead {
  readonly item: HTMLElement;
  readonly mesh: Mesh<SphereGeometry, MeshStandardMaterial>;
  readonly ring: Mesh<TorusGeometry, MeshStandardMaterial>;
  /** Position along the thread, 0..1. */
  readonly at: number;
}

export function createJourneyPart(slot: HTMLElement | null): RoomPart | null {
  if (!slot) return null;
  const items = [...slot.querySelectorAll<HTMLElement>('[data-milestone]')];
  if (items.length < 2) return null;

  const root = new Group();
  const threadMaterial = new MeshStandardMaterial({ roughness: 0.5 });
  const beadMaterial = new MeshStandardMaterial({ roughness: 0.35, emissiveIntensity: 0 });
  const ballMaterial = new MeshStandardMaterial({ roughness: 0.25, emissiveIntensity: 0.35 });

  const positions = beadPositions(items.length);
  const curve = new CatmullRomCurve3(
    threadWaypoints(positions).map((point) => new Vector3(point.x, point.y, point.z)),
    false,
    'catmullrom',
    0.4,
  );
  const samples = curve.getSpacedPoints(SAMPLES);
  /** Where a point lies along the thread, 0..1 (the nearest sample). */
  const along = (point: Vec3): number => {
    let best = 0;
    let distance = Number.POSITIVE_INFINITY;
    const target = new Vector3(point.x, point.y, point.z);
    samples.forEach((sample, i) => {
      const d = sample.distanceToSquared(target);
      if (d < distance) {
        distance = d;
        best = i;
      }
    });
    return best / SAMPLES;
  };

  const thread = new Mesh(new TubeGeometry(curve, 400, SIZE.thread, 10, false), threadMaterial);
  const ball = new Mesh(new SphereGeometry(SIZE.ball, 32, 24), ballMaterial);
  root.add(thread, ball);
  const beads: Bead[] = items.map((item, i) => {
    const position = positions[i] ?? vec3(0, 0, 0);
    const mesh = new Mesh(new SphereGeometry(SIZE.bead, 32, 24), beadMaterial.clone());
    const ring = new Mesh(new TorusGeometry(SIZE.ring, SIZE.ringTube, 10, 40), threadMaterial);
    mesh.position.set(position.x, position.y, position.z);
    ring.position.copy(mesh.position);
    root.add(mesh, ring);
    return { item, mesh, ring, at: along(position) };
  });
  const firstAt = beads[0]?.at ?? 0;
  const lastAt = beads[beads.length - 1]?.at ?? 1;

  let still = false;
  let built = false;
  let lastKeys = Number.NaN;
  let toScreen: RoomContext['toScreen'] = () => ({ x: 0, y: 0 });
  const world = new Vector3();

  const glow = (bead: Bead, reached: boolean): void => {
    bead.mesh.material.emissiveIntensity = reached ? 0.6 : 0;
    // Only touch the DOM when the state changes: this runs on every scroll frame.
    if (bead.item.dataset['reached'] !== String(reached)) bead.item.dataset['reached'] = String(reached);
  };

  const place = (keys: number): void => {
    const u = still ? 1 : ballAt(keys, firstAt, lastAt);
    ball.position.copy(curve.getPointAt(Math.min(0.999, Math.max(0, u))));
    for (const bead of beads) {
      glow(bead, still || u >= bead.at - 0.002);
      // Where the bead is drawn, for tests (like the sorting line's `data-detected-at`). Still mode
      // only: there it stays put, while an animated camera would rewrite it every frame.
      if (!still) continue;
      const point = toScreen(bead.mesh.getWorldPosition(world));
      const at = `${Math.round(point.x)} ${Math.round(point.y)}`;
      if (bead.item.dataset['beadAt'] !== at) bead.item.dataset['beadAt'] = at;
    }
  };

  return {
    slot,
    build(room: RoomContext) {
      built = true;
      still = room.mode === 'still';
      toScreen = room.toScreen;
      for (const node of [thread, ball, ...beads.flatMap((bead) => [bead.mesh, bead.ring])]) {
        node.castShadow = room.shadows;
        node.receiveShadow = room.shadows;
      }
      return root;
    },
    layout(room: RoomContext) {
      toScreen = room.toScreen;
      lastKeys = Number.NaN;
    },
    shown() {
      slot.dataset['roomReady'] = 'true';
    },
    update(frame: RoomFrame) {
      if (frame.keys !== lastKeys) {
        lastKeys = frame.keys;
        place(frame.keys);
      }
      return false;
    },
    recolor(palette: ScenePalette) {
      threadMaterial.color.setHex(palette.ink);
      for (const bead of beads) {
        bead.mesh.material.color.setHex(palette.amber);
        bead.mesh.material.emissive.setHex(palette.amber);
      }
      // The ball is paper white in both themes, like the hero prints.
      ballMaterial.color.setHex(palette['on-forest']);
      ballMaterial.emissive.setHex(palette.amber);
      lastKeys = Number.NaN;
    },
    targets(): RoomTarget[] {
      return beads.map((bead) => ({
        object: bead.mesh,
        onClick: () => bead.item.querySelector<HTMLButtonElement>('button[popovertarget]')?.click(),
      }));
    },
    dispose() {
      // Each bead has its own clone; the template is never added to the scene. A part that was never
      // built is not in the scene either, so the room cannot free its objects.
      beadMaterial.dispose();
      if (!built) disposeObject3D(root);
      for (const bead of beads) {
        delete bead.item.dataset['reached'];
        delete bead.item.dataset['beadAt'];
      }
      delete slot.dataset['roomReady'];
    },
  };
}
