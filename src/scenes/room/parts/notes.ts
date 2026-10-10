/**
 * Room part: Kind words as paper notes taped to the wall (T13.6). Each note sits exactly behind its
 * HTML message, whose text stays on top; once the notes are drawn the HTML cards drop their own
 * background and border (Messages.astro). The paper is unlit and takes the `--surface` token, so the
 * text keeps the same contrast as the HTML card in both themes.
 */
import { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry } from 'three';

import { blobShadow } from '../paper';

import type { ScenePalette } from '../../core/palette';
import type { RoomContext, RoomPart } from '../index';

/** Paper margin around the HTML card, and the tape size (CSS px). */
const MARGIN = 6;
const TAPE = { width: 64, height: 18 } as const;

/** A small, fixed tilt per note (radians), alternating, so the wall does not look like a grid. */
export function noteTilt(index: number): number {
  const tilts = [-0.012, 0.009, 0.015, -0.007];
  return tilts[index % tilts.length] ?? 0;
}

interface Note {
  readonly card: HTMLElement;
  readonly group: Group;
  readonly paper: Mesh<PlaneGeometry, MeshBasicMaterial>;
  readonly tape: Mesh<PlaneGeometry, MeshStandardMaterial>;
  readonly shadow: ReturnType<typeof blobShadow>;
}

export function createNotesPart(slot: HTMLElement | null): RoomPart | null {
  if (!slot) return null;
  const cards = [...slot.querySelectorAll<HTMLElement>('figure')];
  if (cards.length === 0) return null;

  const root = new Group();
  const paperMaterial = new MeshBasicMaterial({ toneMapped: false });
  const tapeMaterial = new MeshStandardMaterial({ transparent: true, opacity: 0.72, roughness: 0.6 });
  const notes: Note[] = cards.map((card, i) => {
    const group = new Group();
    group.rotation.z = noteTilt(i);
    const paper = new Mesh(new PlaneGeometry(1, 1), paperMaterial);
    const tape = new Mesh(new PlaneGeometry(TAPE.width, TAPE.height), tapeMaterial);
    tape.rotation.z = -noteTilt(i) * 6;
    tape.position.z = 0.6;
    const shadow = blobShadow(1, 1, 0x000000, 0.22);
    shadow.position.z = -1;
    group.add(shadow, paper, tape);
    root.add(group);
    return { card, group, paper, tape, shadow };
  });

  return {
    slot,
    build() {
      return root;
    },
    layout(room: RoomContext) {
      root.scale.setScalar(room.wpp);
      root.position.set((-room.viewWidth / 2) * room.wpp, 0, 0);
      for (const note of notes) {
        const box = note.card.getBoundingClientRect();
        const width = box.width + MARGIN * 2;
        const height = box.height + MARGIN * 2;
        note.group.position.set(box.left + box.width / 2, -(box.top + window.scrollY + box.height / 2), 0);
        note.paper.scale.set(width, height, 1);
        note.tape.position.y = height / 2 - 2;
        // A soft contact shadow, lower right, as if the paper sat just off the wall.
        note.shadow.scale.set(width * 1.04, height * 1.06, 1);
        note.shadow.position.set(5, -7, -1);
      }
    },
    shown() {
      slot.dataset['roomReady'] = 'true';
    },
    recolor(palette: ScenePalette) {
      paperMaterial.color.setHex(palette.surface);
      tapeMaterial.color.setHex(palette.amber);
      for (const note of notes) note.shadow.material.color.setHex(palette['room-shadow']);
    },
    dispose() {
      delete slot.dataset['roomReady'];
    },
  };
}
