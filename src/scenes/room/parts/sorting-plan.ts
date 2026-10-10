/**
 * Timeline of the sorting line (T13.6), pure and tested: where every card is at a given time. Cards
 * drop onto the belt at its left end, ride under the detection camera, and are pushed into the bin of
 * their category. Units are CSS px and seconds, in the belt's own frame: x along the belt (centre 0),
 * y up from the belt surface, z toward the viewer (belt centre line 0).
 */
import { clamp } from '../../core/math';
import { easeOut } from '../paper';

export interface LinePlan {
  readonly length: number;
  readonly cameraX: number;
  /** Centre x of each bin, left to right. */
  readonly bins: readonly number[];
  readonly binWidth: number;
  readonly card: { readonly width: number; readonly depth: number };
  readonly beltDepth: number;
  /** Bin depth (front to back). */
  readonly binDepth: number;
  /** Belt speed, px/s. */
  readonly speed: number;
  /** Time between two cards dropping onto the belt (s). */
  readonly interval: number;
  /** Bin index of each card, in the order they are fed. */
  readonly targets: readonly number[];
}

/** Seconds: a card dropping onto the belt, and being pushed into its bin. */
export const TIMING = { drop: 0.45, push: 0.7 } as const;

/** Plan the line for a band `width` px wide, `binCount` bins, and the bin index of every card. */
export function linePlan(width: number, binCount: number, targets: readonly number[]): LinePlan {
  const length = Math.max(width, 1);
  const cameraX = -length / 2 + length * 0.18;
  const regionStart = cameraX + Math.min(90, length * 0.15);
  const regionEnd = length / 2 - 6;
  const slot = (regionEnd - regionStart) / Math.max(binCount, 1);
  const bins = Array.from({ length: binCount }, (_, i) => regionStart + slot * (i + 0.5));
  const binWidth = Math.min(120, slot - 10);
  const cardWidth = clamp(binWidth * 0.72, 30, 84);
  const card = { width: cardWidth, depth: cardWidth * 0.68 };
  const speed = clamp(length * 0.07, 32, 72);
  const firstDrop = -length / 2 + card.width / 2 + 4;
  // A card stays on the line from its drop to the end of its push; the same card never rides twice
  // at once, so the interval grows when there are only a few cards.
  const longest = (Math.max(...bins, firstDrop) - firstDrop) / speed + TIMING.push;
  const spacing = (card.width * 2.2) / speed;
  const interval = Math.max(spacing, targets.length > 0 ? longest / targets.length + 0.05 : spacing);
  return {
    length,
    cameraX,
    bins,
    binWidth,
    card,
    beltDepth: card.depth * 1.7,
    binDepth: card.depth * 1.35,
    speed,
    interval,
    targets,
  };
}

/** Where the belt starts carrying a card (centre x). */
export function dropX(plan: LinePlan): number {
  return -plan.length / 2 + plan.card.width / 2 + 4;
}

export interface CardState {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  /** 0..1: appears while dropping, shrinks into the bin at the end of the push. */
  readonly scale: number;
  /** Under the camera: the detection box and label show. */
  readonly detected: boolean;
  /** 0..1 progress of the push into the bin, 0 while riding. */
  readonly push: number;
  /** Finished: no longer drawn. */
  readonly gone: boolean;
}

/** State of the card fed `k`-th (k ≥ 0, cycling through the targets) at time `t`. */
export function cardAt(plan: LinePlan, t: number, k: number): CardState {
  const target = plan.targets[k % Math.max(plan.targets.length, 1)] ?? 0;
  const binX = plan.bins[target] ?? plan.length / 2;
  const local = t - k * plan.interval;
  const x0 = dropX(plan);
  const ride = Math.max(0, binX - x0) / plan.speed;
  if (local < 0 || plan.targets.length === 0) {
    return { x: x0, y: 0, z: 0, scale: 0, detected: false, push: 0, gone: true };
  }
  if (local < ride) {
    const x = x0 + local * plan.speed;
    const drop = easeOut(local / TIMING.drop);
    return {
      x,
      y: (1 - drop) * 40,
      z: 0,
      scale: Math.min(1, drop * 1.5),
      detected: Math.abs(x - plan.cameraX) < plan.card.width * 0.6,
      push: 0,
      gone: false,
    };
  }
  const push = (local - ride) / TIMING.push;
  if (push >= 1) return { x: binX, y: 0, z: 0, scale: 0, detected: false, push: 1, gone: true };
  // Pushed forward off the belt, then dropping into the bin and out of sight.
  const across = plan.beltDepth / 2 + plan.binDepth / 2 + 4;
  const fall = clamp((push - 0.55) / 0.45, 0, 1);
  return {
    x: binX,
    y: -fall * 30,
    z: easeOut(push / 0.6) * across,
    scale: 1 - fall * 0.6,
    detected: false,
    push,
    gone: false,
  };
}

/** Indices `k` of the cards on the line at time `t`, oldest first. */
export function activeCards(plan: LinePlan, t: number): number[] {
  if (plan.targets.length === 0 || t < 0) return [];
  const newest = Math.floor(t / plan.interval);
  const active: number[] = [];
  for (let k = Math.max(0, newest - plan.targets.length); k <= newest; k += 1) {
    if (!cardAt(plan, t, k).gone) active.push(k);
  }
  return active;
}

/** The time at which the first card is right under the camera: the still frame, and the start. */
export function firstDetection(plan: LinePlan): number {
  return Math.max(0, plan.cameraX - dropX(plan)) / plan.speed;
}

/** How far each bin's pusher is extended (0..1) at time `t`: out during the first part of a push. */
export function pushers(plan: LinePlan, t: number): number[] {
  const out = plan.bins.map(() => 0);
  for (const k of activeCards(plan, t)) {
    const state = cardAt(plan, t, k);
    if (state.push <= 0) continue;
    const target = plan.targets[k % plan.targets.length] ?? 0;
    const reach = state.push < 0.5 ? easeOut(state.push / 0.5) : 1 - easeOut((state.push - 0.5) / 0.5);
    out[target] = Math.max(out[target] ?? 0, reach);
  }
  return out;
}
