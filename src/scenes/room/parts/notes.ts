/**
 * Room part: Kind words as paper notes taped up in the room (T13.6, ADR 0020), standing on the floor
 * at their station between the sorting line and the laptop, at most `MAX_NOTES`, rows growing upward.
 * The messages themselves are the HTML list beside them (Messages.astro), readable at any zoom; each
 * note only carries a large quotation mark and its writer's name, read from that HTML. Unlit paper in
 * the `--surface` token, like the HTML cards.
 */
import {
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';

import { KEY_ORDER } from '../camera';
import { DESIGN_UNIT, STATIONS } from '../world';
import { blobShadow, DISPLAY_FAMILY, fontsReady } from '../paper';
import { wrapTitle } from './sorting-plan';

import type { ScenePalette } from '../../core/palette';
import type { RoomFrame, RoomPart } from '../index';

/** A note's size, the gap between notes, and the tape (design px). */
const NOTE = { width: 300, height: 200, gap: 36, padding: 24 } as const;
const TAPE = { width: 64, height: 18 } as const;
const COLUMNS = 2;
/** Notes on the floor; more messages stay in the HTML list only. */
export const MAX_NOTES = 4;
/** The notes show while the camera is this close to their key, so they never sit behind other rooms. */
const NEAR_KEYS = 0.75;
const MESSAGES_KEY = KEY_ORDER.indexOf('messages');

/** A small, fixed tilt per note (radians), alternating, so the notes do not look like a grid. */
export function noteTilt(index: number): number {
  const tilts = [-0.035, 0.025, 0.04, -0.02];
  return tilts[index % tilts.length] ?? 0;
}

/**
 * Centre of note `index` of `count` (design px, y up from the floor), in rows of `COLUMNS` read top
 * to bottom; the bottom row stands on the floor and each row is centred left to right. Pure; tested.
 */
export function notePosition(index: number, count: number): { x: number; y: number } {
  const total = Math.max(count, 1);
  const columns = Math.min(COLUMNS, total);
  const rows = Math.ceil(total / columns);
  const column = index % columns;
  const row = Math.floor(index / columns);
  const inRow = Math.min(columns, total - row * columns);
  const stepX = NOTE.width + NOTE.gap;
  const stepY = NOTE.height + NOTE.gap;
  return {
    x: (column - (inRow - 1) / 2) * stepX,
    y: (rows - 1 - row) * stepY + NOTE.height / 2,
  };
}

function css(value: number): string {
  return `#${value.toString(16).padStart(6, '0')}`;
}

interface Note {
  readonly name: string;
  readonly paper: Mesh<PlaneGeometry, MeshBasicMaterial>;
  readonly shadow: ReturnType<typeof blobShadow>;
}

export function createNotesPart(slot: HTMLElement | null): RoomPart | null {
  if (!slot) return null;
  const cards = [...slot.querySelectorAll<HTMLElement>('figure')].slice(0, MAX_NOTES);
  if (cards.length === 0) return null;

  const root = new Group();
  const tapeMaterial = new MeshStandardMaterial({ transparent: true, opacity: 0.72, roughness: 0.6 });
  const notes: Note[] = cards.map((card, i) => {
    const group = new Group();
    const at = notePosition(i, cards.length);
    group.position.set(at.x, at.y, 0);
    group.rotation.z = noteTilt(i);
    const paper = new Mesh(
      new PlaneGeometry(NOTE.width, NOTE.height),
      new MeshBasicMaterial({ toneMapped: false }),
    );
    const tape = new Mesh(new PlaneGeometry(TAPE.width, TAPE.height), tapeMaterial);
    tape.rotation.z = -noteTilt(i) * 3;
    tape.position.set(0, NOTE.height / 2 - 2, 0.6);
    const shadow = blobShadow(NOTE.width * 1.04, NOTE.height * 1.06, 0x000000, 0.22);
    shadow.position.set(6, -8, -2);
    group.add(shadow, paper, tape);
    root.add(group);
    const name = card.querySelector('figcaption > :first-child')?.textContent?.replace('↗', '').trim() ?? '';
    return { name, paper, shadow };
  });

  /** A large quotation mark and the writer's name, in the theme's paper, amber, and ink. */
  const print = (note: Note, palette: ScenePalette): void => {
    const scale = 3;
    const canvas = document.createElement('canvas');
    canvas.width = NOTE.width * scale;
    canvas.height = NOTE.height * scale;
    const g = canvas.getContext('2d');
    if (g) {
      g.scale(scale, scale);
      g.fillStyle = css(palette.surface);
      g.fillRect(0, 0, NOTE.width, NOTE.height);
      g.textBaseline = 'top';
      g.fillStyle = css(palette.amber);
      g.font = `96px ${DISPLAY_FAMILY}`;
      g.fillText('“', NOTE.padding - 4, NOTE.padding - 18);
      g.fillStyle = css(palette.ink);
      g.font = `24px ${DISPLAY_FAMILY}`;
      const width = NOTE.width - NOTE.padding * 2;
      const lines = wrapTitle(note.name, width, 2, (text) => g.measureText(text).width);
      lines.forEach((line, i) =>
        g.fillText(line, NOTE.padding, NOTE.height - NOTE.padding - (lines.length - i) * 30),
      );
    }
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    map.anisotropy = 4;
    note.paper.material.map?.dispose();
    note.paper.material.map = map;
    note.paper.material.needsUpdate = true;
  };

  return {
    slot,
    async build() {
      await fontsReady();
      root.scale.setScalar(DESIGN_UNIT);
      root.position.set(STATIONS.notes.x, STATIONS.notes.y, STATIONS.notes.z);
      return root;
    },
    shown() {
      slot.dataset['roomReady'] = 'true';
    },
    update(frame: RoomFrame) {
      root.visible = Math.abs(frame.keys - MESSAGES_KEY) <= NEAR_KEYS;
      return false;
    },
    recolor(palette: ScenePalette) {
      tapeMaterial.color.setHex(palette.amber);
      for (const note of notes) {
        note.shadow.material.color.setHex(palette['room-shadow']);
        print(note, palette);
      }
    },
    dispose() {
      for (const note of notes) note.paper.material.map?.dispose();
      delete slot.dataset['roomReady'];
    },
  };
}
