/**
 * Room part: the homelab laptop beside Contact (T13.6, T14.4). The small laptop at home that serves
 * this site, open on the floor at its station (ADR 0020), its screen showing the home page in small:
 * the site's address, the role line, the name, the CV button, the photo, and a live status line from
 * /api/health and /api/stats/summary (left out when they fail). It turns slightly with the pointer.
 * Decorative: the HTML caption says what it is.
 */
import {
  BoxGeometry,
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';

import { DESIGN_UNIT, FLOOR_Y, STATIONS } from '../world';
import { blobShadow, DISPLAY_FAMILY, fontsReady, SANS } from '../paper';

import type { ScenePalette } from '../../core/palette';
import type { RoomContext, RoomFrame, RoomPart } from '../index';

/** Resting angles (radians): three-quarter view, lid tilted back. The camera looks down on it. */
const POSE = { turn: -0.45, lid: -0.24 } as const;
/** Design size of the laptop's slot (px): the largest laptop `laptopSize` makes. */
const DESIGN = { width: 480, height: 360 } as const;
const POINTER_TURN = 0.12;

function css(value: number): string {
  return `#${value.toString(16).padStart(6, '0')}`;
}

/** Laptop size (CSS px) for a slot: as wide as fits, at most 320 px. */
export function laptopSize(
  slotWidth: number,
  slotHeight: number,
): { width: number; depth: number; lid: number } {
  const width = Math.max(120, Math.min(320, slotWidth * 0.66, slotHeight * 0.9));
  return { width, depth: width * 0.66, lid: width * 0.64 };
}

/** What the screen shows (T14.4): the home page in small, with the live status line. */
export interface ScreenContent {
  readonly host: string;
  readonly name: string;
  readonly role: string;
  readonly cv: string;
  /** "Online · 123 visitors in the last 30 days", or null while unknown or when the server is unreachable. */
  readonly status: string | null;
  readonly photo: CanvasImageSource | null;
}

/**
 * The status line from the site's own public endpoints, or null to leave it out: only when
 * /api/health answers, with the visitor count of the last 30 days when /api/stats/summary does too.
 * Pure; tested.
 */
export function statusLine(
  online: boolean,
  visitors: number | null,
  labels: { readonly online: string; readonly visitors: string },
  localeTag: string,
): string | null {
  if (!online) return null;
  if (visitors === null) return labels.online;
  const count = new Intl.NumberFormat(localeTag).format(visitors);
  // Like `fill()` in @/lib/i18n, kept here so the 3D bundle does not pull in the dictionary.
  return `${labels.online} · ${labels.visitors.replace('{count}', count)}`;
}

/** The 30-day visitor count from a /api/stats/summary response, or null when it is not one. */
export function visitorsOf(summary: unknown): number | null {
  const value = (summary as { visitors?: { last30Days?: unknown } } | null)?.visitors?.last30Days;
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
}

/** The screen: a browser bar with the site's address over the home page in small. */
function drawScreen(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  content: ScreenContent,
  palette: ScenePalette,
): void {
  g.fillStyle = css(palette.surface);
  g.fillRect(0, 0, w, h);
  // Browser bar and address.
  const bar = h * 0.11;
  g.fillStyle = css(palette.line);
  g.fillRect(0, 0, w, bar);
  g.fillStyle = css(palette['on-forest']);
  const pill = { x: w * 0.18, y: bar * 0.2, w: w * 0.64, h: bar * 0.6 };
  g.beginPath();
  g.roundRect(pill.x, pill.y, pill.w, pill.h, pill.h / 2);
  g.fill();
  g.fillStyle = css(palette.forest);
  g.font = SANS.replace('12px', `${Math.round(pill.h * 0.62)}px`);
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.fillText(content.host, w / 2, pill.y + pill.h / 2 + 0.5, pill.w * 0.9);
  g.textAlign = 'left';
  for (const [i, color] of [palette.amber, palette.mint, palette.sage].entries()) {
    g.fillStyle = css(color);
    g.beginPath();
    g.arc(w * 0.04 + i * bar * 0.5, bar / 2, bar * 0.14, 0, Math.PI * 2);
    g.fill();
  }
  // The hero, in small: role line, the name, the CV button; the photo print on the right.
  const left = w * 0.07;
  const textWidth = w * 0.5;
  g.textBaseline = 'alphabetic';
  g.fillStyle = css(palette.ink);
  g.globalAlpha = 0.75;
  g.font = SANS.replace('600 12px', `500 ${Math.round(h * 0.055)}px`);
  g.fillText(content.role, left, h * 0.27, textWidth);
  g.globalAlpha = 1;
  const size = Math.round(h * 0.14);
  g.font = `${size}px ${DISPLAY_FAMILY}`;
  const words = content.name.split(' ');
  const lines = words.length > 1 ? [words[0] ?? '', words.slice(1).join(' ')] : [content.name];
  lines.forEach((line, i) => g.fillText(line, left, h * 0.27 + size * (1.05 + i * 0.95), textWidth));
  const button = { x: left, y: h * 0.64, h: h * 0.1 };
  g.font = SANS.replace('12px', `${Math.round(button.h * 0.48)}px`);
  const buttonWidth = g.measureText(content.cv).width + button.h * 1.2;
  g.fillStyle = css(palette.amber);
  g.beginPath();
  g.roundRect(button.x, button.y, buttonWidth, button.h, button.h / 2);
  g.fill();
  g.fillStyle = css(palette.forest);
  g.textBaseline = 'middle';
  g.fillText(content.cv, button.x + button.h * 0.6, button.y + button.h / 2 + 0.5);
  // Photo print.
  const frame = { x: w * 0.62, y: h * 0.2, w: w * 0.3 };
  const border = frame.w * 0.06;
  const picture = frame.w - border * 2;
  g.fillStyle = css(palette['on-forest']);
  g.fillRect(frame.x, frame.y, frame.w, picture + border * 3.2);
  if (content.photo) g.drawImage(content.photo, frame.x + border, frame.y + border, picture, picture);
  else {
    g.fillStyle = css(palette.forest);
    g.fillRect(frame.x + border, frame.y + border, picture, picture);
  }
  // The live status line, only when the server answered.
  if (content.status) {
    const y = h * 0.88;
    g.fillStyle = css(palette.mint);
    g.beginPath();
    g.arc(left + h * 0.018, y, h * 0.018, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = css(palette.ink);
    g.font = SANS.replace('600 12px', `500 ${Math.round(h * 0.05)}px`);
    g.textBaseline = 'middle';
    g.fillText(content.status, left + h * 0.05, y + 0.5, w - left * 2 - h * 0.05);
  }
}

export function createLaptopPart(slot: HTMLElement | null): RoomPart | null {
  if (!slot) return null;
  const data = slot.dataset;
  const content: { -readonly [K in keyof ScreenContent]: ScreenContent[K] } = {
    host: data['host'] ?? '',
    name: data['name'] ?? '',
    role: data['role'] ?? '',
    cv: data['cv'] ?? '',
    status: null,
    photo: null,
  };
  const root = new Group();
  const laptop = new Group();
  root.add(laptop);

  const body = new MeshStandardMaterial({ roughness: 0.45, metalness: 0.35 });
  const keys = new MeshStandardMaterial({ roughness: 0.8 });
  const screenMaterial = new MeshBasicMaterial({ toneMapped: false });
  const led = new MeshStandardMaterial({ emissiveIntensity: 0.9 });
  let palette: ScenePalette | null = null;
  let shadows = true;
  let still = false;
  let size = { width: 0, depth: 0, lid: 0 };
  let screen: CanvasTexture | null = null;
  let blob: ReturnType<typeof blobShadow> | null = null;

  const paintScreen = (): void => {
    if (!palette || size.width === 0) return;
    const w = size.width - 16;
    const h = size.lid - 16;
    const scale = 3;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const g = canvas.getContext('2d');
    if (g) {
      g.scale(scale, scale);
      drawScreen(g, w, h, content, palette);
    }
    screen?.dispose();
    screen = new CanvasTexture(canvas);
    screen.colorSpace = SRGBColorSpace;
    screen.anisotropy = 4;
    screenMaterial.map = screen;
    screenMaterial.needsUpdate = true;
  };

  const assemble = (): void => {
    for (const child of [...laptop.children]) {
      laptop.remove(child);
      child.traverse((node) => {
        if (!(node instanceof Mesh)) return;
        node.geometry.dispose();
        // Shared materials (body, keys, screen, light) live as long as the part; the blob's are its own.
        if (node === blob) {
          node.material.alphaMap?.dispose();
          node.material.dispose();
        }
      });
    }
    blob = null;
    const { width, depth, lid } = size;
    const base = new Mesh(new BoxGeometry(width, 8, depth), body);
    base.castShadow = shadows;
    const keyboard = new Mesh(new PlaneGeometry(width * 0.86, depth * 0.5), keys);
    keyboard.rotation.x = -Math.PI / 2;
    keyboard.position.set(0, 4.1, -depth * 0.12);
    const pad = new Mesh(new PlaneGeometry(width * 0.3, depth * 0.24), keys);
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(0, 4.1, depth * 0.3);
    const light = new Mesh(new BoxGeometry(5, 2, 2), led);
    light.position.set(width * 0.38, 0, depth / 2 + 0.6);
    const hinge = new Group();
    hinge.position.set(0, 4, -depth / 2 + 3);
    hinge.rotation.x = POSE.lid;
    const lidMesh = new Mesh(new BoxGeometry(width, lid, 5), body);
    lidMesh.position.y = lid / 2;
    lidMesh.castShadow = shadows;
    const face = new Mesh(new PlaneGeometry(width - 16, lid - 16), screenMaterial);
    face.position.set(0, lid / 2 + 1, 2.6);
    hinge.add(lidMesh, face);
    laptop.add(base, keyboard, pad, light, hinge);
    if (!shadows && palette) {
      blob = blobShadow(width * 1.3, depth * 1.4, palette['room-shadow'], 0.3);
      blob.rotation.x = -Math.PI / 2;
      blob.position.set(8, -5, 6);
      laptop.add(blob);
    }
    paintScreen();
  };

  /**
   * The photo (the hero's texture) and the live status, fetched once from the site's own public
   * endpoints; nothing new is stored. A failure leaves the line out.
   */
  let disposed = false;
  /** A 5 s timeout where the browser has it (Safari before 16 does not). */
  const timeout = (): { signal?: AbortSignal } =>
    'timeout' in AbortSignal ? { signal: AbortSignal.timeout(5000) } : {};
  const loadScreen = (invalidate: () => void): void => {
    const photoUrl = document.querySelector<HTMLElement>('[data-room-slot="hero"]')?.dataset['photoUrl'];
    if (photoUrl) {
      const image = new Image();
      image.addEventListener('load', () => {
        if (disposed) return;
        content.photo = image;
        paintScreen();
        invalidate();
      });
      image.src = photoUrl;
    }
    // The summary may come from the browser cache (the service allows 5 minutes); health never does.
    const summary = (): Promise<unknown> =>
      fetch('/api/stats/summary', timeout()).then((response) =>
        response.ok ? response.json() : Promise.reject(new Error(String(response.status))),
      );
    void (async () => {
      const online = await fetch('/api/health', { cache: 'no-store', ...timeout() })
        .then((response) => response.ok)
        .catch(() => false);
      const visitors =
        online && data['stats'] === 'true' ? await summary().then(visitorsOf, () => null) : null;
      if (disposed) return;
      content.status = statusLine(
        online,
        visitors,
        { online: data['online'] ?? '', visitors: data['visitors'] ?? '' },
        data['locale'] ?? 'en-US',
      );
      // What the screen says, for tests and tools (the screen itself is a canvas).
      if (content.status) slot.dataset['screenStatus'] = content.status;
      slot.dataset['screenChecked'] = 'true';
      paintScreen();
      invalidate();
    })().catch(() => undefined);
  };

  return {
    slot,
    async build(room: RoomContext) {
      shadows = room.shadows;
      still = room.mode === 'still';
      palette = room.palette;
      loadScreen(room.invalidate);
      await fontsReady();
      laptop.rotation.set(0, POSE.turn, 0);
      return root;
    },
    layout() {
      root.scale.setScalar(DESIGN_UNIT);
      // The base (8 design px thick) rests on the floor.
      root.position.set(STATIONS.laptop.x, FLOOR_Y + 4 * DESIGN_UNIT, STATIONS.laptop.z);
      const next = laptopSize(DESIGN.width, DESIGN.height);
      if (Math.round(next.width) !== Math.round(size.width)) {
        size = next;
        assemble();
      }
    },
    shown() {
      slot.dataset['roomReady'] = 'true';
    },
    update(frame: RoomFrame) {
      if (!still) laptop.rotation.y = POSE.turn + frame.pointer.x * POINTER_TURN;
      return false;
    },
    recolor(next: ScenePalette) {
      palette = next;
      body.color.setHex(next.forest);
      keys.color.setHex(next['room-shadow']);
      led.color.setHex(next.mint);
      led.emissive.setHex(next.mint);
      blob?.material.color.setHex(next['room-shadow']);
      paintScreen();
    },
    dispose() {
      disposed = true;
      screen?.dispose();
      delete slot.dataset['roomReady'];
      delete slot.dataset['screenStatus'];
      delete slot.dataset['screenChecked'];
    },
  };
}
