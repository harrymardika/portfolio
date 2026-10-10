/**
 * Room part: the hero prints (T13.4). The owner's photo print floats in front of a ruled sheet with
 * his name in Javanese script; both cast shadows on the page. Once, when they are ready, the face is
 * detected (person → name) and then the thesis model reads the sheet syllable by syllable. The HTML
 * twin (HeroPrints.astro) supplies every position and size, so the 3D lands where the HTML was.
 */
import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  TextureLoader,
  type Material,
  type Texture,
} from 'three';

import { blobShadow, brackets, easeOut, label } from '../paper';
import { FACE_BOX, PHOTO_PRINT, PRINTS, SEQUENCE } from './hero-config';

import type { ScenePalette } from '../../core/palette';
import type { RoomContext, RoomFrame, RoomPart } from '../index';

/** How far the photo print floats in front of the sheet, and the sheet's curl (CSS px). */
const DEPTH = { photo: 36, sheet: 0, curl: 16, boxes: 10 } as const;
/** Pointer tilt of both prints, radians. */
const TILT = { x: 0.1, y: 0.16 } as const;
const LABEL_HEIGHT = 18;
const MONO = '500 12px "IBM Plex Mono", ui-monospace, monospace';
const SANS = '600 12px "Plus Jakarta Sans Variable", system-ui, sans-serif';

export interface SheetBox {
  readonly cls: string;
  readonly latin: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** Box centre and size in CSS px relative to the centre of a print `width` × `height`, y up. */
export function boxOnPrint(
  box: { x: number; y: number; w: number; h: number },
  width: number,
  height: number,
): { x: number; y: number; width: number; height: number } {
  return {
    x: (box.x + box.w / 2 - 0.5) * width,
    y: (0.5 - box.y - box.h / 2) * height,
    width: box.w * width,
    height: box.h * height,
  };
}

/** The sheet's curl at horizontal offset `x` from its centre (CSS px): edges lift toward the viewer. */
export function curl(x: number, width: number, amount: number = DEPTH.curl): number {
  const u = width > 0 ? x / (width / 2) : 0;
  return amount * (u * u - 0.5);
}

/** Where the detection sequence stands at time `t` (seconds since the prints were ready). */
export function sequenceAt(t: number, syllables: number) {
  const faceIn = easeOut((t - SEQUENCE.faceIn) / 0.55);
  const boxes = Array.from({ length: syllables }, (_, i) =>
    easeOut((t - SEQUENCE.sheetFrom - i * SEQUENCE.sheetStep) / 0.3),
  );
  const readFrom = SEQUENCE.sheetFrom + syllables * SEQUENCE.sheetStep + SEQUENCE.readAfter;
  return {
    face: faceIn,
    person: t >= SEQUENCE.faceIn + 0.5 && t < SEQUENCE.personUntil ? 1 : 0,
    name: easeOut((t - SEQUENCE.personUntil) / 0.3),
    boxes,
    read: easeOut((t - readFrom) / 0.35),
    done: t > readFrom + 0.6,
  };
}

interface PrintMeasure {
  /** Centre in document px. */
  cx: number;
  cy: number;
  width: number;
  height: number;
}

function measure(element: HTMLElement): PrintMeasure {
  const box = element.getBoundingClientRect();
  // offsetWidth/Height ignore the CSS rotation; the centre is the same either way.
  return {
    cx: box.left + box.width / 2,
    cy: box.top + window.scrollY + box.height / 2,
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
}

function loadTexture(url: string): Promise<Texture> {
  return new TextureLoader().loadAsync(url).then((map) => {
    map.colorSpace = SRGBColorSpace;
    map.anisotropy = 8;
    return map;
  });
}

async function fontsReady(): Promise<void> {
  const load = Promise.all([document.fonts.load(MONO), document.fonts.load(SANS)]);
  await Promise.race([load, new Promise((resolve) => setTimeout(resolve, 1500))]);
}

/** Null when the slot or its data is missing; the HTML prints then simply stay. */
export function createHeroPart(slot: HTMLElement | null): RoomPart | null {
  if (!slot) return null;
  const photoElement = slot.querySelector<HTMLElement>('[data-print="photo"]');
  const sheetElement = slot.querySelector<HTMLElement>('[data-print="sheet"]');
  const replay = slot.querySelector<HTMLButtonElement>('[data-replay]');
  const { photoUrl, sheetUrl, boxes: boxesJson, person = 'person', name = '' } = slot.dataset;
  if (!photoElement || !sheetElement || !photoUrl || !sheetUrl || !boxesJson) return null;
  const syllables = JSON.parse(boxesJson) as SheetBox[];

  const root = new Group();
  const pivot = new Group();
  const photo = new Group();
  const sheet = new Group();
  pivot.add(sheet, photo);
  root.add(pivot);

  let textures: { photo: Texture; sheet: Texture } | null = null;
  let palette: ScenePalette | null = null;
  let size = { photo: { width: 0, height: 0 }, sheet: { width: 0, height: 0 } };
  let shadows = true;
  let started = 0;
  let clock = 0;
  /** The sequence starts on the first frame the prints are actually drawn. */
  let startPending = false;
  let still = false;
  let invalidate: () => void = () => undefined;

  // Detection overlays, rebuilt with the prints when their size changes.
  let faceBox: Mesh | null = null;
  let personTag: Mesh | null = null;
  let nameTag: Mesh | null = null;
  let sheetMarks: { box: Mesh; tag: Mesh; latin: Mesh }[] = [];

  const clear = (group: Group): void => {
    for (const child of [...group.children]) {
      group.remove(child);
      child.traverse((node) => {
        if (!(node instanceof Mesh)) return;
        node.geometry.dispose();
        const materials: Material[] = Array.isArray(node.material) ? node.material : [node.material];
        for (const material of materials) {
          // Photo and sheet textures are shared and live as long as the part; labels own theirs.
          const { map, alphaMap } = material as MeshStandardMaterial;
          for (const owned of [map, alphaMap]) {
            if (owned && owned !== textures?.photo && owned !== textures?.sheet) owned.dispose();
          }
          material.dispose();
        }
      });
    }
  };

  const amber = (): number => palette?.amber ?? 0xf2b134;
  // Prints are white paper in both themes, like the HTML twins (`--on-forest`).
  const paper = (): number => palette?.['on-forest'] ?? 0xffffff;
  const ink = (): number => palette?.forest ?? 0x173d32;

  const assemble = (): void => {
    if (!textures || size.photo.width === 0 || size.sheet.width === 0) return;
    clear(photo);
    clear(sheet);
    const shadowColor = palette?.['room-shadow'] ?? 0x0f2a33;

    // Photo print: white paper box, the photo inset with a deeper bottom margin.
    const { width: pw, height: ph } = size.photo;
    const print = new Mesh(
      new BoxGeometry(pw, ph, 3),
      new MeshStandardMaterial({ color: paper(), roughness: 0.85 }),
    );
    print.castShadow = shadows;
    const side = pw * (1 - 2 * PHOTO_PRINT.border);
    const picture = new Mesh(
      new PlaneGeometry(side, side),
      new MeshStandardMaterial({ map: textures.photo, roughness: 0.5 }),
    );
    const pictureY = ph / 2 - pw * PHOTO_PRINT.border - side / 2;
    picture.position.set(0, pictureY, 1.6);
    photo.add(print, picture);
    if (!shadows) {
      const blob = blobShadow(pw * 1.25, ph * 1.2, shadowColor, 0.4);
      blob.position.set(pw * 0.08, -ph * 0.08, -DEPTH.photo - 6);
      photo.add(blob);
    }
    const face = boxOnPrint(
      { x: FACE_BOX.x, y: FACE_BOX.y, w: FACE_BOX.width, h: FACE_BOX.height },
      side,
      side,
    );
    faceBox = brackets(face.width, face.height, amber());
    personTag = label(person, { font: MONO, color: ink(), background: amber(), height: LABEL_HEIGHT });
    nameTag = label(name, { font: SANS, color: ink(), background: amber(), height: LABEL_HEIGHT });
    const faceGroup = new Group();
    faceGroup.position.set(face.x, pictureY + face.y, DEPTH.boxes);
    for (const tag of [personTag, nameTag]) {
      const tagWidth = (tag.geometry as PlaneGeometry).parameters.width;
      tag.position.set(-face.width / 2 + tagWidth / 2, face.height / 2 + LABEL_HEIGHT / 2, 0.5);
    }
    faceGroup.add(faceBox, personTag, nameTag);
    photo.add(faceGroup);

    // Sheet: a curled plane with the aksara texture, and one box per syllable.
    const { width: sw, height: sh } = size.sheet;
    const geometry = new PlaneGeometry(sw, sh, 40, 4);
    const positions = geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i += 1) positions.setZ(i, curl(positions.getX(i), sw));
    geometry.computeVertexNormals();
    const page = new Mesh(
      geometry,
      new MeshStandardMaterial({ map: textures.sheet, color: paper(), roughness: 0.92 }),
    );
    page.castShadow = shadows;
    page.receiveShadow = shadows;
    sheet.add(page);
    if (!shadows) {
      const blob = blobShadow(sw * 1.2, sh * 1.25, shadowColor, 0.3);
      blob.position.set(sw * 0.05, -sh * 0.08, -12);
      sheet.add(blob);
    }
    sheetMarks = syllables.map((syllable) => {
      const b = boxOnPrint(syllable, sw, sh);
      const group = new Group();
      group.position.set(b.x, b.y, curl(b.x, sw) + DEPTH.boxes);
      const box = brackets(b.width, b.height, amber());
      const tag = label(syllable.cls, {
        font: MONO,
        color: ink(),
        background: amber(),
        height: LABEL_HEIGHT,
      });
      const latin = label(syllable.latin, {
        font: SANS,
        color: ink(),
        background: amber(),
        height: LABEL_HEIGHT,
      });
      const tagWidth = (tag.geometry as PlaneGeometry).parameters.width;
      tag.position.set(-b.width / 2 + tagWidth / 2, b.height / 2 + LABEL_HEIGHT / 2, 0.5);
      latin.position.set(0, -b.height / 2 - LABEL_HEIGHT / 2 - 2, 0.5);
      group.add(box, tag, latin);
      sheet.add(group);
      return { box, tag, latin };
    });
    applySequence();
  };

  const applySequence = (): void => {
    const t = still ? Number.POSITIVE_INFINITY : clock - started;
    const state = sequenceAt(t, syllables.length);
    const fade = (mesh: Mesh | null, opacity: number): void => {
      if (mesh) (mesh.material as MeshStandardMaterial).opacity = opacity;
    };
    if (faceBox) {
      const s = 1.9 - 0.9 * state.face;
      faceBox.scale.set(s, s, 1);
      fade(faceBox, state.face);
    }
    fade(personTag, state.person);
    fade(nameTag, state.name);
    sheetMarks.forEach((mark, i) => {
      const k = state.boxes[i] ?? 0;
      const s = 1.25 - 0.25 * k;
      mark.box.scale.set(s, s, 1);
      fade(mark.box, k);
      fade(mark.tag, easeOut(k * 1.5 - 0.5));
      fade(mark.latin, state.read);
    });
  };

  const onReplay = (): void => {
    started = clock;
    invalidate();
  };

  return {
    slot,
    async build(room: RoomContext) {
      shadows = room.shadows;
      still = room.mode === 'still';
      invalidate = room.invalidate;
      palette = room.palette;
      const [photoTexture, sheetTexture] = await Promise.all([
        loadTexture(photoUrl),
        loadTexture(sheetUrl),
        fontsReady(),
      ]);
      textures = { photo: photoTexture, sheet: sheetTexture };
      if (replay && !still) {
        replay.hidden = false;
        replay.addEventListener('click', onReplay);
      }
      return root;
    },
    layout(room: RoomContext) {
      const center = measure(slot.querySelector<HTMLElement>('.stage') ?? slot);
      const photoBox = measure(photoElement);
      const sheetBox = measure(sheetElement);
      root.scale.setScalar(room.wpp);
      root.position.set((-room.viewWidth / 2) * room.wpp, 0, 0);
      pivot.position.set(center.cx, -center.cy, 0);
      photo.position.set(photoBox.cx - center.cx, center.cy - photoBox.cy, DEPTH.photo);
      sheet.position.set(sheetBox.cx - center.cx, center.cy - sheetBox.cy, DEPTH.sheet);
      photo.rotation.z = (-PRINTS.photo.rotate * Math.PI) / 180;
      sheet.rotation.z = (-PRINTS.sheet.rotate * Math.PI) / 180;
      const changed =
        Math.abs(size.photo.width - photoBox.width) > 0.5 ||
        Math.abs(size.sheet.width - sheetBox.width) > 0.5;
      size = {
        photo: { width: photoBox.width, height: photoBox.height },
        sheet: { width: sheetBox.width, height: sheetBox.height },
      };
      if (changed) assemble();
    },
    shown() {
      // Only now is the 3D on screen: hide the flat prints and start the sequence.
      slot.dataset['roomReady'] = 'true';
      startPending = true;
    },
    update(frame: RoomFrame) {
      clock = frame.elapsed;
      if (startPending) {
        startPending = false;
        started = clock;
      }
      pivot.rotation.set(frame.pointer.y * TILT.x, frame.pointer.x * TILT.y, 0);
      applySequence();
      return !still && !sequenceAt(clock - started, syllables.length).done;
    },
    recolor(next: ScenePalette) {
      palette = next;
      assemble();
    },
    dispose() {
      replay?.removeEventListener('click', onReplay);
      if (replay) replay.hidden = true;
      delete slot.dataset['roomReady'];
    },
  };
}
