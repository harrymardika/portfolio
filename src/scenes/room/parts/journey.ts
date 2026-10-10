/**
 * Room part: the journey thread (T13.5). A thread leaves the bottom of the hero's aksara sheet and
 * runs down through a bead at every milestone of the HTML timeline (Journey.astro), then on toward
 * the next section. A ball rides the thread at the reader's eye line; beads it has passed glow, and
 * their HTML items are marked reached. Clicking a bead opens the same story as its HTML button.
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

import { crossing } from '../layout';
import { blobShadow } from '../paper';

import type { ScenePalette } from '../../core/palette';
import type { RoomContext, RoomFrame, RoomPart, RoomTarget } from '../index';

/** Sizes in CSS px. */
const SIZE = { thread: 3.2, bead: 9, ring: 14, ball: 7.5 } as const;
/** How far the thread swings sideways between beads (CSS px), alternating wide and narrow. */
const SWING = { wide: 48, narrow: 18 } as const;
/** Swings stop this far from the left edge of the page (CSS px), so the thread never leaves it. */
const EDGE = 12;
/** The reader's eye line, as a fraction of the viewport height from the top. */
export const EYE_LINE = 0.58;
const SAMPLES = 240;

export interface ThreadAnchors {
  /** Where the thread starts (document px), e.g. under the hero sheet. */
  readonly start: { x: number; y: number } | null;
  /** Bead centres (document px), top to bottom. */
  readonly beads: readonly { x: number; y: number }[];
  /** Where the thread ends (document px), e.g. at the next section. */
  readonly end: { x: number; y: number } | null;
  /** Text the thread must not cross on its way to the first bead (document px), e.g. the heading. */
  readonly avoid?: Box | null;
  /** Page width (CSS px); a detour stays inside it. */
  readonly viewWidth?: number;
}

export interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/** Clearance around avoided text (CSS px). */
const CLEARANCE = { side: 10, vertical: 28, edge: 12 } as const;

/**
 * Waypoints that take a straight segment from `from` (above) to `to` (below) around `box` on the side
 * with more room, or none when the segment does not cross it. On phones the journey heading spans
 * the page between the hero sheet and the first bead. Pure; tested.
 */
export function detour(
  from: { x: number; y: number },
  to: { x: number; y: number },
  box: Box,
  viewWidth: number,
): { x: number; y: number }[] {
  const top = Math.max(box.top, from.y);
  const bottom = Math.min(box.bottom, to.y);
  if (bottom <= top || to.y <= from.y) return [];
  const xAt = (y: number) => from.x + ((to.x - from.x) * (y - from.y)) / (to.y - from.y);
  const [lo, hi] = [Math.min(xAt(top), xAt(bottom)), Math.max(xAt(top), xAt(bottom))];
  if (hi < box.left - CLEARANCE.side || lo > box.right + CLEARANCE.side) return [];
  const right = box.right + CLEARANCE.side;
  const left = box.left - CLEARANCE.side;
  const x =
    viewWidth - right >= left ? Math.min(right, viewWidth - CLEARANCE.edge) : Math.max(left, CLEARANCE.edge);
  return [
    { x, y: box.top - CLEARANCE.vertical },
    { x, y: box.bottom + CLEARANCE.vertical },
  ];
}

/**
 * Points the thread passes through, in document px: start, then each bead, then the end. Between
 * two beads the thread swings to the left (away from the cards, which sit to the right of their
 * beads), alternately wide and narrow, never closer than `EDGE` to the page edge; other segments run straight. Before the first bead the thread
 * goes around `avoid` (see `detour`). Pure; tested.
 */
export function threadPoints(anchors: ThreadAnchors): { x: number; y: number }[] {
  const first = anchors.beads[0];
  const around =
    anchors.start && first && anchors.avoid
      ? detour(anchors.start, first, anchors.avoid, anchors.viewWidth ?? Number.POSITIVE_INFINITY)
      : [];
  const stops = [
    ...(anchors.start ? [anchors.start] : []),
    ...around,
    ...anchors.beads,
    ...(anchors.end ? [anchors.end] : []),
  ];
  const points: { x: number; y: number }[] = [];
  const isBead = (point: { x: number; y: number }) => anchors.beads.includes(point);
  let swings = 0;
  stops.forEach((stop, i) => {
    const next = stops[i + 1];
    points.push(stop);
    if (!next) return;
    if (isBead(stop) && isBead(next)) {
      const swing = swings % 2 === 0 ? SWING.wide : SWING.narrow;
      swings += 1;
      points.push({ x: Math.max(EDGE, Math.min(stop.x, next.x) - swing), y: (stop.y + next.y) / 2 });
    } else {
      points.push({ x: (stop.x + next.x) / 2, y: (stop.y + next.y) / 2 });
    }
  });
  return points;
}

/** Make a sequence non-decreasing (a curve may bulge back up a little near sharp turns). */
export function monotonic(values: readonly number[]): number[] {
  let max = Number.NEGATIVE_INFINITY;
  return values.map((value) => (max = Math.max(max, value)));
}

interface Bead {
  readonly item: HTMLElement;
  readonly mesh: Mesh<SphereGeometry, MeshStandardMaterial>;
  readonly ring: Mesh<TorusGeometry, MeshStandardMaterial>;
  /** Position along the thread, 0..1. */
  at: number;
}

export function createJourneyPart(
  slot: HTMLElement | null,
  options: { from?: HTMLElement | null; to?: HTMLElement | null; avoid?: HTMLElement | null } = {},
): RoomPart | null {
  if (!slot) return null;
  const items = [...slot.querySelectorAll<HTMLElement>('[data-milestone]')];
  if (items.length < 2) return null;

  const root = new Group();
  const threadMaterial = new MeshStandardMaterial({ roughness: 0.55 });
  const beadMaterial = new MeshStandardMaterial({ roughness: 0.35, emissiveIntensity: 0 });
  const ringMaterial = new MeshStandardMaterial({ roughness: 0.5 });
  const ballMaterial = new MeshStandardMaterial({
    roughness: 0.25,
    emissiveIntensity: 0.35,
  });
  let thread: Mesh<TubeGeometry, MeshStandardMaterial> | null = null;
  let ballShadow: ReturnType<typeof blobShadow> | null = null;
  const ball = new Mesh(new SphereGeometry(SIZE.ball, 24, 16), ballMaterial);
  root.add(ball);
  const beads: Bead[] = items.map((item) => {
    const mesh = new Mesh(new SphereGeometry(SIZE.bead, 24, 16), beadMaterial.clone());
    const ring = new Mesh(new TorusGeometry(SIZE.ring, 2, 10, 40), ringMaterial);
    root.add(mesh, ring);
    return { item, mesh, ring, at: 0 };
  });
  let samples: Vector3[] = [];
  let ys: number[] = [];
  let ballAt = 0;
  let shadows = true;
  let still = false;
  let palette: ScenePalette | null = null;

  /** Bead centre: the dot to the left of each milestone card (the HTML timeline's dot). */
  const beadAnchor = (item: HTMLElement): { x: number; y: number } => {
    const card = item.querySelector<HTMLElement>('.label') ?? item;
    const box = card.getBoundingClientRect();
    return { x: box.left - 18, y: box.top + window.scrollY + box.height / 2 };
  };
  const startAnchor = (): { x: number; y: number } | null => {
    if (!options.from) return null;
    const box = options.from.getBoundingClientRect();
    return { x: box.left + box.width * 0.2, y: box.bottom + window.scrollY - 6 };
  };
  const endAnchor = (): { x: number; y: number } | null => {
    if (!options.to) return null;
    const box = options.to.getBoundingClientRect();
    const last = items[items.length - 1];
    const x = last ? beadAnchor(last).x : box.left + 24;
    return { x, y: box.top + window.scrollY + 40 };
  };

  /** The rendered text of `options.avoid` (its line boxes, not its full-width block). */
  const avoidBox = (): Box | null => {
    if (!options.avoid) return null;
    const range = document.createRange();
    range.selectNodeContents(options.avoid);
    const rects = [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0);
    if (rects.length === 0) return null;
    return {
      left: Math.min(...rects.map((rect) => rect.left)),
      right: Math.max(...rects.map((rect) => rect.right)),
      top: Math.min(...rects.map((rect) => rect.top)) + window.scrollY,
      bottom: Math.max(...rects.map((rect) => rect.bottom)) + window.scrollY,
    };
  };

  const glow = (bead: Bead, reached: boolean): void => {
    bead.mesh.material.emissiveIntensity = reached ? 0.55 : 0;
    // Only touch the DOM when the state changes: this runs on every scroll frame.
    if (bead.item.dataset['reached'] !== String(reached)) bead.item.dataset['reached'] = String(reached);
  };

  const place = (scrollY: number, viewHeight: number): void => {
    if (samples.length === 0) return;
    ballAt = still ? 1 : crossing(ys, scrollY + viewHeight * EYE_LINE);
    const index = ballAt * (samples.length - 1);
    const a = samples[Math.floor(index)];
    const b = samples[Math.min(samples.length - 1, Math.ceil(index))];
    if (a && b) ball.position.lerpVectors(a, b, index - Math.floor(index)).setZ(SIZE.ball + 4);
    for (const bead of beads) glow(bead, still || bead.at <= ballAt + 0.002);
  };

  let lastScroll = Number.NaN;

  return {
    slot,
    build(room: RoomContext) {
      shadows = room.shadows;
      still = room.mode === 'still';
      palette = room.palette;
      for (const node of [ball, ...beads.flatMap((bead) => [bead.mesh, bead.ring])])
        node.castShadow = shadows;
      return root;
    },
    layout(room: RoomContext) {
      root.scale.setScalar(room.wpp);
      root.position.set((-room.viewWidth / 2) * room.wpp, 0, 0);
      const anchors: ThreadAnchors = {
        start: startAnchor(),
        beads: items.map(beadAnchor),
        end: endAnchor(),
        avoid: avoidBox(),
        viewWidth: room.viewWidth,
      };
      const curve = new CatmullRomCurve3(
        threadPoints(anchors).map((point) => new Vector3(point.x, -point.y, 0)),
        false,
        'centripetal',
      );
      if (thread) {
        root.remove(thread);
        thread.geometry.dispose();
      }
      thread = new Mesh(new TubeGeometry(curve, SAMPLES, SIZE.thread, 8, false), threadMaterial);
      thread.castShadow = shadows;
      root.add(thread);
      samples = curve.getSpacedPoints(SAMPLES);
      ys = monotonic(samples.map((point) => -point.y));
      anchors.beads.forEach((anchor, i) => {
        const bead = beads[i];
        if (!bead) return;
        bead.mesh.position.set(anchor.x, -anchor.y, 0);
        bead.ring.position.set(anchor.x, -anchor.y, 0);
        bead.at = crossing(ys, anchor.y);
      });
      lastScroll = Number.NaN;
      place(window.scrollY, room.viewHeight);
    },
    shown() {
      slot.dataset['roomReady'] = 'true';
    },
    update(frame: RoomFrame) {
      if (frame.scrollY !== lastScroll) {
        lastScroll = frame.scrollY;
        place(frame.scrollY, frame.room.viewHeight);
      }
      return false;
    },
    recolor(next: ScenePalette) {
      palette = next;
      threadMaterial.color.setHex(palette.ink);
      ringMaterial.color.setHex(palette.ink);
      for (const bead of beads) {
        bead.mesh.material.color.setHex(palette.amber);
        bead.mesh.material.emissive.setHex(palette.amber);
      }
      // The ball is paper white in both themes, like the hero prints.
      ballMaterial.color.setHex(palette['on-forest']);
      ballMaterial.emissive.setHex(palette.amber);
      if (!shadows && !ballShadow) {
        ballShadow = blobShadow(SIZE.ball * 4, SIZE.ball * 4, palette['room-shadow'], 0.3);
        ballShadow.position.set(6, -6, -2);
        ball.add(ballShadow);
      }
      ballShadow?.material.color.setHex(palette['room-shadow']);
    },
    targets(): RoomTarget[] {
      return beads.map((bead) => ({
        object: bead.mesh,
        onClick: () => bead.item.querySelector<HTMLButtonElement>('button[popovertarget]')?.click(),
      }));
    },
    dispose() {
      // Each bead has its own clone; the template is never added to the scene.
      beadMaterial.dispose();
      for (const bead of beads) delete bead.item.dataset['reached'];
      delete slot.dataset['roomReady'];
    },
  };
}
