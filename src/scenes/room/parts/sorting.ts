/**
 * Room part: the sorting line (T13.6), after the owner's Reclaimyt waste-sorting conveyor. Project
 * cards ride a belt under a detection camera that labels each with its field, then a pusher drops it
 * into that field's bin. Hovering a card (or tapping it once on a touch screen) shows its title;
 * clicking opens its case study, the same page as its row in the HTML index. Cards, bins, and labels
 * come from the slot's data (SelectedProjects.astro, content/), never from this file.
 */
import {
  BoxGeometry,
  CanvasTexture,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
  SRGBColorSpace,
  Vector3,
} from 'three';

import { isNear, rectCenter, type PageRect } from '../layout';
import { blobShadow, brackets, DISPLAY_FAMILY, fontsReady, label, MONO, SANS } from '../paper';
import {
  activeCards,
  cardAt,
  firstDetection,
  linePlan,
  pushers,
  titleLines,
  wrapTitle,
  type LinePlan,
} from './sorting-plan';

import type { ScenePalette } from '../../core/palette';
import type { RoomContext, RoomFrame, RoomPart, RoomTarget } from '../index';

interface CardData {
  readonly title: string;
  readonly href: string;
  readonly year: string;
  readonly bin: string;
}
interface BinData {
  readonly id: string;
  readonly label: string;
}

/** The line is tilted back so the camera looks down on the belt (radians). */
const TILT = 0.95;
const LABEL_HEIGHT = 18;
const TITLE_FONT = '600 13px "Plus Jakarta Sans Variable", system-ui, sans-serif';
/** Line height of the title printed on a card, as a multiple of its font size. */
const LINE_HEIGHT = 1.15;
/** Stripe period of the belt texture (CSS px). */
const STRIPE = 22;
/** A tapped card's title stays this long (ms). */
const TAP_HOLD = 4000;

function canvasTexture(width: number, height: number, draw: (g: CanvasRenderingContext2D) => void) {
  const scale = 3;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const g = canvas.getContext('2d');
  if (g) {
    g.scale(scale, scale);
    draw(g);
  }
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

/** Labels read as overlays: drawn after the machine and never hidden behind the camera arm. */
function onTop(mesh: Mesh): void {
  mesh.renderOrder = 10;
  for (const material of [mesh.material].flat()) material.depthTest = false;
}

function css(value: number): string {
  return `#${value.toString(16).padStart(6, '0')}`;
}

function parse<T>(json: string | undefined): T[] {
  try {
    const value: unknown = JSON.parse(json ?? '[]');
    return Array.isArray(value) ? (value as T[]) : [];
  } catch {
    return [];
  }
}

export function createSortingPart(slot: HTMLElement | null): RoomPart | null {
  if (!slot) return null;
  const cards = parse<CardData>(slot.dataset['cards']);
  const bins = parse<BinData>(slot.dataset['bins']);
  const binIndex = new Map(bins.map((bin, i) => [bin.id, i]));
  const targetsOf = cards.map((card) => binIndex.get(card.bin) ?? -1);
  if (cards.length === 0 || bins.length === 0 || targetsOf.includes(-1)) return null;

  const root = new Group();
  const line = new Group();
  line.rotation.x = TILT;
  root.add(line);
  const overlay = new Group(); // Upright labels, facing the viewer.
  root.add(overlay);

  let plan: LinePlan | null = null;
  let palette: ScenePalette | null = null;
  let shadows = true;
  let still = false;
  let invalidate: () => void = () => undefined;
  let toScreen: RoomContext['toScreen'] = () => ({ x: 0, y: 0 });
  let rect: PageRect = { left: 0, top: 0, width: 0, height: 0 };
  let width = 0;
  let bandHeight = 0;
  let clock = 0;

  // Rebuilt for each width (layout) and theme (recolor).
  let built: {
    cards: Mesh[];
    detect: Mesh;
    tags: Mesh[];
    titles: (Mesh | null)[];
    pushers: Mesh[];
    beltMap: CanvasTexture;
  } | null = null;
  let hovered = -1;
  let tapped = -1;
  let tapTimer = 0;
  let detected = -1;
  const world = new Vector3();

  const clearLine = (): void => {
    for (const group of [line, overlay]) {
      for (const child of [...group.children]) {
        group.remove(child);
        child.traverse((node) => {
          if (!(node instanceof Mesh)) return;
          node.geometry.dispose();
          for (const material of [node.material].flat()) {
            const maps = material as {
              map?: { dispose(): void } | null;
              alphaMap?: { dispose(): void } | null;
            };
            maps.map?.dispose();
            maps.alphaMap?.dispose();
            material.dispose();
          }
        });
      }
    }
    built = null;
  };

  /** The card's paper: an amber edge, the year, and the project title (up to three lines). */
  const paperFace = (card: CardData, w: number, d: number) =>
    canvasTexture(w, d, (g) => {
      if (!palette) return;
      g.fillStyle = css(palette['on-forest']);
      g.fillRect(0, 0, w, d);
      g.fillStyle = css(palette.amber);
      g.fillRect(0, 0, w, Math.max(3, d * 0.07));
      const pad = w * 0.08;
      g.textBaseline = 'top';
      g.fillStyle = css(palette.forest);
      g.globalAlpha = 0.7;
      g.font = `600 ${Math.max(6, d * 0.12)}px "Plus Jakarta Sans Variable", system-ui, sans-serif`;
      g.fillText(card.year, pad, d * 0.14);
      g.globalAlpha = 1;
      const size = Math.max(7, Math.min(15, d * 0.17));
      g.font = `${size}px ${DISPLAY_FAMILY}`;
      const top = d * 0.34;
      const lines = titleLines(d - top, size, LINE_HEIGHT, 3);
      for (const [i, text] of wrapTitle(
        card.title,
        w - pad * 2,
        lines,
        (t) => g.measureText(t).width,
      ).entries()) {
        g.fillText(text, pad, top + i * size * LINE_HEIGHT);
      }
    });

  const assemble = (): void => {
    const colors = palette;
    if (!colors || width <= 0) return;
    clearLine();
    plan = linePlan(width, bins.length, targetsOf, bandHeight);
    const { length, beltDepth, binDepth, binWidth, card } = plan;
    const machine = new MeshStandardMaterial({ color: colors.forest, roughness: 0.6, metalness: 0.15 });
    const rail = new MeshStandardMaterial({ color: colors.line, roughness: 0.5, metalness: 0.2 });
    const binMaterial = new MeshStandardMaterial({ color: colors.surface, roughness: 0.8 });
    const cast = (mesh: Mesh): Mesh => {
      mesh.castShadow = shadows;
      return mesh;
    };

    // Belt: a dark slab with a striped top that scrolls with the cards.
    const belt = cast(new Mesh(new BoxGeometry(length, 12, beltDepth), machine));
    belt.position.y = -6.2;
    const beltMap = canvasTexture(STRIPE, 8, (g) => {
      g.fillStyle = css(colors.forest);
      g.fillRect(0, 0, STRIPE, 8);
      g.fillStyle = css(colors.line);
      g.globalAlpha = 0.35;
      g.fillRect(0, 0, 2, 8);
    });
    beltMap.wrapS = RepeatWrapping;
    beltMap.repeat.x = length / STRIPE;
    const beltTop = new Mesh(
      new PlaneGeometry(length, beltDepth),
      new MeshStandardMaterial({ map: beltMap, roughness: 0.7 }),
    );
    beltTop.rotation.x = -Math.PI / 2;
    beltTop.position.y = 0.05;
    line.add(belt, beltTop);
    for (const side of [-1, 1]) {
      const edge = cast(new Mesh(new BoxGeometry(length, 6, 4), rail));
      edge.position.set(0, 2, side * (beltDepth / 2 + 2));
      line.add(edge);
    }

    // Detection camera on a post behind the belt, looking down.
    const back = -beltDepth / 2 - 10;
    const post = cast(new Mesh(new BoxGeometry(6, 120, 6), machine));
    post.position.set(plan.cameraX, 54, back);
    const arm = cast(new Mesh(new BoxGeometry(6, 6, -back), machine));
    arm.position.set(plan.cameraX, 112, back / 2);
    const head = cast(new Mesh(new BoxGeometry(30, 18, 22), machine));
    head.position.set(plan.cameraX, 100, 0);
    const lens = new Mesh(
      new BoxGeometry(10, 4, 10),
      new MeshStandardMaterial({ color: colors.amber, emissive: colors.amber, emissiveIntensity: 0.6 }),
    );
    lens.position.set(plan.cameraX, 90, 0);
    line.add(post, arm, head, lens);

    // Bins in front of the belt, each with its field's name; pushers behind the belt.
    const binHeight = 34;
    const binZ = beltDepth / 2 + binDepth / 2 + 6;
    const pusherMeshes: Mesh[] = [];
    plan.bins.forEach((x, i) => {
      const bin = new Group();
      bin.position.set(x, -binHeight / 2 - 8, binZ);
      const wall = 3;
      for (const [w, h, d, px, py, pz] of [
        [binWidth, wall, binDepth, 0, -binHeight / 2, 0],
        [binWidth, binHeight, wall, 0, 0, binDepth / 2],
        [binWidth, binHeight, wall, 0, 0, -binDepth / 2],
        [wall, binHeight, binDepth, -binWidth / 2, 0, 0],
        [wall, binHeight, binDepth, binWidth / 2, 0, 0],
      ] as const) {
        const panel = cast(new Mesh(new BoxGeometry(w, h, d), binMaterial));
        panel.position.set(px, py, pz);
        bin.add(panel);
      }
      const name = label(bins[i]?.label ?? '', { font: SANS, color: colors.ink, height: LABEL_HEIGHT });
      const nameWidth = (name.geometry as PlaneGeometry).parameters.width;
      name.scale.setScalar(Math.min(1, (binWidth * 0.94) / nameWidth));
      // Upright toward the viewer (the line is tilted back), just in front of the bin.
      name.rotation.x = -TILT;
      name.position.set(0, 2, binDepth / 2 + wall / 2 + 8);
      // Never cut by the bin's own walls.
      name.material.depthTest = false;
      name.renderOrder = 1;
      bin.add(name);
      line.add(bin);

      const pusher = cast(new Mesh(new BoxGeometry(card.width * 0.8, 12, 8), machine));
      pusher.position.set(x, 7, back + 2);
      pusherMeshes.push(pusher);
      line.add(pusher);
    });

    if (!shadows) {
      const blob = blobShadow(length * 1.05, beltDepth * 1.6, colors['room-shadow'], 0.25);
      blob.rotation.x = -Math.PI / 2;
      blob.position.set(10, -14, 8);
      line.add(blob);
    }

    // One card mesh per project, shown while it rides.
    const cardMeshes = cards.map((data) => {
      const sideMaterial = new MeshStandardMaterial({ color: colors['on-forest'], roughness: 0.85 });
      const topMaterial = new MeshStandardMaterial({
        map: paperFace(data, card.width, card.depth),
        roughness: 0.85,
      });
      const mesh = cast(
        new Mesh(new BoxGeometry(card.width, 3, card.depth), [
          sideMaterial,
          sideMaterial,
          topMaterial,
          sideMaterial,
          sideMaterial,
          sideMaterial,
        ]),
      );
      mesh.visible = false;
      line.add(mesh);
      return mesh;
    });

    const detect = brackets(card.width + 10, card.depth + 10, colors.amber);
    detect.rotation.x = -Math.PI / 2;
    detect.visible = false;
    line.add(detect);
    const tags = bins.map((bin) => {
      const tag = label(bin.label, {
        font: MONO,
        color: colors.forest,
        background: colors.amber,
        height: LABEL_HEIGHT,
      });
      tag.visible = false;
      onTop(tag);
      overlay.add(tag);
      return tag;
    });
    built = {
      cards: cardMeshes,
      detect,
      tags,
      titles: cards.map(() => null),
      pushers: pusherMeshes,
      beltMap,
    };
    // A still frame always shows the first card under the camera, whatever the new width.
    if (still) clock = firstDetection(plan);
  };

  /** The title label of card `i`, made on first use. */
  const titleOf = (i: number): Mesh | null => {
    if (!built || !palette) return null;
    const existing = built.titles[i];
    if (existing) return existing;
    const data = cards[i];
    if (!data) return null;
    const title = label(data.title, {
      font: TITLE_FONT,
      color: palette.ink,
      background: palette.surface,
      padX: 8,
      height: 26,
    });
    const maxWidth = width * 0.8;
    const titleWidth = (title.geometry as PlaneGeometry).parameters.width;
    if (titleWidth > maxWidth) title.scale.setScalar(maxWidth / titleWidth);
    title.visible = false;
    onTop(title);
    overlay.add(title);
    built.titles[i] = title;
    return title;
  };

  /** Overlay position (upright group) of a point given in the tilted line's frame. */
  const overlayPoint = (x: number, y: number, z: number): Vector3 =>
    world.set(x, y * Math.cos(TILT) - z * Math.sin(TILT), y * Math.sin(TILT) + z * Math.cos(TILT));

  /** Hidden cards also leave layer 0, so the pointer cannot hit them where they last were. */
  const showCard = (mesh: Mesh, on: boolean): void => {
    mesh.visible = on;
    mesh.layers.set(on ? 0 : 31);
  };

  const apply = (t: number): void => {
    const p = plan;
    if (!built || !p) return;
    built.beltMap.offset.x = -((t * p.speed) / STRIPE) % 1;
    for (const mesh of built.cards) showCard(mesh, false);
    let nowDetected = -1;
    const shown = new Set<number>();
    for (const k of activeCards(p, t)) {
      const i = k % cards.length;
      const state = cardAt(p, t, k);
      const mesh = built.cards[i];
      if (!mesh) continue;
      showCard(mesh, true);
      shown.add(i);
      mesh.position.set(state.x, 1.6 + state.y, state.z);
      mesh.scale.setScalar(Math.max(0.001, state.scale));
      if (state.detected) {
        nowDetected = i;
        built.detect.position.set(state.x, 3.4 + state.y, state.z);
      }
    }
    built.detect.visible = nowDetected >= 0;
    const bin = nowDetected >= 0 ? (targetsOf[nowDetected] ?? -1) : -1;
    const { detect } = built;
    built.tags.forEach((tag, i) => {
      tag.visible = i === bin;
      if (!tag.visible) return;
      const at = overlayPoint(detect.position.x, 4, -p.card.depth / 2 - 6);
      const tagWidth = (tag.geometry as PlaneGeometry).parameters.width;
      tag.position.set(at.x - p.card.width / 2 - 5 + tagWidth / 2, at.y + LABEL_HEIGHT / 2, at.z + 1);
    });
    pushers(p, t).forEach((reach, i) => {
      const pusher = built?.pushers[i];
      if (pusher) pusher.position.z = -p.beltDepth / 2 - 8 + reach * p.beltDepth * 0.75;
    });
    // Title of the hovered or tapped card, above it while it is on the belt.
    const active = tapped >= 0 ? tapped : hovered;
    built.titles.forEach((title, i) => {
      if (title) title.visible = false;
      if (i !== active || !shown.has(i)) return;
      const shownTitle = titleOf(i);
      const mesh = built?.cards[i];
      if (!shownTitle || !mesh) return;
      const at = overlayPoint(mesh.position.x, mesh.position.y + 30, mesh.position.z - p.card.depth / 2);
      const half = ((shownTitle.geometry as PlaneGeometry).parameters.width * shownTitle.scale.x) / 2;
      const x = Math.min(Math.max(at.x, -width / 2 + half), width / 2 - half);
      shownTitle.position.set(x, at.y + 34, at.z + 2);
      shownTitle.visible = true;
    });
    if (nowDetected !== detected) {
      detected = nowDetected;
      reportDetected();
    }
  };

  /**
   * Which card the camera is looking at, and where it is on screen. Updated only when the detected
   * card changes (and once shown), so the position is exact in still mode only; e2e tests use it.
   */
  const reportDetected = (): void => {
    const mesh = detected >= 0 ? built?.cards[detected] : undefined;
    const data = detected >= 0 ? cards[detected] : undefined;
    if (!mesh || !data) {
      delete slot.dataset['detected'];
      delete slot.dataset['detectedAt'];
      return;
    }
    slot.dataset['detected'] = data.href;
    const point = toScreen(mesh.getWorldPosition(new Vector3()));
    slot.dataset['detectedAt'] = `${Math.round(point.x)} ${Math.round(point.y)}`;
  };

  const select = (i: number): void => {
    tapped = i;
    window.clearTimeout(tapTimer);
    if (i >= 0) {
      tapTimer = window.setTimeout(() => {
        tapped = -1;
        apply(clock);
        invalidate();
      }, TAP_HOLD);
    }
    apply(clock);
    invalidate();
  };

  return {
    slot,
    async build(room: RoomContext) {
      shadows = room.shadows;
      still = room.mode === 'still';
      invalidate = room.invalidate;
      toScreen = room.toScreen;
      palette = room.palette;
      await fontsReady();
      // Start just before the first card reaches the camera; a still frame shows it detected.
      clock = still ? firstDetection(linePlanFor()) : Math.max(0, firstDetection(linePlanFor()) - 1.6);
      return root;
    },
    layout(room: RoomContext, next: PageRect) {
      rect = next;
      toScreen = room.toScreen;
      const center = rectCenter(next, room.viewWidth, room.wpp);
      root.scale.setScalar(room.wpp);
      root.position.set(center.x, center.y, 0);
      // A little above the band's centre, so the line's shadow ends before the project rows.
      line.position.y = 30;
      overlay.position.y = 30;
      if (
        Math.round(next.width) !== Math.round(width) ||
        Math.round(next.height) !== Math.round(bandHeight)
      ) {
        width = next.width;
        bandHeight = next.height;
        if (palette) assemble();
      }
      apply(clock);
    },
    shown() {
      slot.dataset['roomReady'] = 'true';
      reportDetected();
    },
    update(frame: RoomFrame) {
      if (still) return false;
      if (!isNear(rect, frame.scrollY, frame.room.viewHeight, 0)) return false;
      clock += Math.min(frame.dt, 0.1);
      apply(clock);
      return true;
    },
    recolor(next: ScenePalette) {
      palette = next;
      if (width > 0) assemble();
      apply(clock);
    },
    targets(): RoomTarget[] {
      return (built?.cards ?? []).map((mesh, i) => ({
        object: mesh,
        onHover: (on: boolean) => {
          hovered = on ? i : hovered === i ? -1 : hovered;
          apply(clock);
          invalidate();
        },
        onClick: (_event: MouseEvent, pointerType: string) => {
          const data = cards[i];
          if (!data || !mesh.visible) return;
          // A first tap on a touch screen shows the title; the second opens the case study.
          if (pointerType !== 'mouse' && tapped !== i) {
            select(i);
            return;
          }
          window.location.assign(data.href);
        },
      }));
    },
    dispose() {
      window.clearTimeout(tapTimer);
      delete slot.dataset['roomReady'];
      delete slot.dataset['detected'];
      delete slot.dataset['detectedAt'];
    },
  };

  /** The plan for the current slot width (before the first layout, the slot's own width). */
  function linePlanFor(): LinePlan {
    const box = slot?.getBoundingClientRect();
    return linePlan(width || box?.width || 0, bins.length, targetsOf, bandHeight || box?.height || 0);
  }
}
