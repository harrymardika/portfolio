/**
 * Room part: the homelab laptop beside Contact (T13.6). The small laptop at home that serves this
 * site, open, its screen showing a simple drawing of the home page with the site's address (from the
 * slot's data). It turns slightly with the pointer. Decorative: the HTML caption says what it is.
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

import { rectCenter, type PageRect } from '../layout';
import { blobShadow, fontsReady, SANS } from '../paper';

import type { ScenePalette } from '../../core/palette';
import type { RoomContext, RoomFrame, RoomPart } from '../index';

/** Resting angles (radians): looking down at the keyboard, three-quarter view, lid tilted back. */
const POSE = { down: 0.42, turn: -0.42, lid: -0.24 } as const;
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

/** The screen: a browser bar with the site's address over a sketch of the home page. */
function drawScreen(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  host: string,
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
  g.fillText(host, w / 2, pill.y + pill.h / 2 + 0.5, pill.w * 0.9);
  for (const [i, color] of [palette.amber, palette.mint, palette.sage].entries()) {
    g.fillStyle = css(color);
    g.beginPath();
    g.arc(w * 0.04 + i * bar * 0.5, bar / 2, bar * 0.14, 0, Math.PI * 2);
    g.fill();
  }
  // Hero: name, sentence lines, two buttons on the left; photo print and sheet on the right.
  const left = w * 0.08;
  g.fillStyle = css(palette.ink);
  g.globalAlpha = 0.45;
  g.fillRect(left, h * 0.25, w * 0.22, h * 0.03);
  g.globalAlpha = 1;
  g.fillRect(left, h * 0.32, w * 0.4, h * 0.08);
  g.globalAlpha = 0.35;
  for (const [i, share] of [0.42, 0.36, 0.4].entries())
    g.fillRect(left, h * (0.47 + i * 0.06), w * share, h * 0.025);
  g.globalAlpha = 1;
  g.fillStyle = css(palette.amber);
  g.beginPath();
  g.roundRect(left, h * 0.71, w * 0.15, h * 0.08, h * 0.04);
  g.fill();
  g.strokeStyle = css(palette.ink);
  g.lineWidth = Math.max(1, h * 0.006);
  g.beginPath();
  g.roundRect(left + w * 0.17, h * 0.71, w * 0.15, h * 0.08, h * 0.04);
  g.stroke();
  g.fillStyle = css(palette.sage);
  g.fillRect(w * 0.64, h * 0.42, w * 0.28, h * 0.32);
  g.fillStyle = css(palette['on-forest']);
  g.fillRect(w * 0.56, h * 0.24, w * 0.2, h * 0.5);
  g.fillStyle = css(palette.forest);
  g.fillRect(w * 0.575, h * 0.27, w * 0.17, h * 0.34);
  g.strokeStyle = css(palette.amber);
  g.lineWidth = Math.max(1, h * 0.008);
  g.strokeRect(w * 0.615, h * 0.3, w * 0.09, h * 0.14);
}

export function createLaptopPart(slot: HTMLElement | null): RoomPart | null {
  if (!slot) return null;
  const host = slot.dataset['host'] ?? '';
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
      drawScreen(g, w, h, host, palette);
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

  return {
    slot,
    async build(room: RoomContext) {
      shadows = room.shadows;
      still = room.mode === 'still';
      palette = room.palette;
      await fontsReady();
      laptop.rotation.set(POSE.down, POSE.turn, 0);
      return root;
    },
    layout(room: RoomContext, rect: PageRect) {
      const center = rectCenter(rect, room.viewWidth, room.wpp);
      root.scale.setScalar(room.wpp);
      root.position.set(center.x, center.y, 0);
      const next = laptopSize(rect.width, rect.height);
      if (Math.round(next.width) !== Math.round(size.width)) {
        size = next;
        assemble();
      }
      // Above the caption at the bottom of the band.
      laptop.position.y = rect.height * 0.5 - size.lid * 1.05;
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
      screen?.dispose();
      delete slot.dataset['roomReady'];
    },
  };
}
