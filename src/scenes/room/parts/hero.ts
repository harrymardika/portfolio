/**
 * Room part: the hero prints (T13.4). The owner's photo print floats in front of a ruled sheet with
 * his name in Javanese script, at the hero's station on the wall (ADR 0020); both cast shadows on it.
 * Once, when they are ready, the face is detected (person → name) and then the thesis model reads the
 * sheet syllable by syllable. The prints keep the proportions of their HTML twin (HeroPrints.astro,
 * both from hero-config.ts), on a stage `STAGE_WIDTH` design pixels wide.
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

import { blobShadow, brackets, easeOut, fontsReady, label, MONO, SANS } from '../paper';
import { DESIGN_UNIT, STATIONS } from '../world';
import { FACE_BOX, PHOTO_PRINT, PRINTS, SEQUENCE } from './hero-config';

import type { ScenePalette } from '../../core/palette';
import type { RoomContext, RoomFrame, RoomPart } from '../index';

/** How far the photo print floats in front of the sheet, and the sheet's curl (CSS px). */
const DEPTH = { photo: 36, sheet: 0, curl: 16, boxes: 10 } as const;
/** Pointer tilt of both prints, radians. */
const TILT = { x: 0.1, y: 0.16 } as const;
const LABEL_HEIGHT = 18;

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

/** Width of the hero stage in design pixels (the size it had on the page in Phase 13). */
export const STAGE_WIDTH = 600;

export interface PrintBox {
  /** Centre relative to the stage centre, y up (design px). */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Where the two prints sit on a stage `stageWidth` wide, from the same fractions as the HTML prints.
 * The photo print is the photo plus its paper border (deeper at the bottom); the sheet keeps its
 * image's aspect (`sheetAspect` = height / width). Pure; tested.
 */
export function printLayout(stageWidth: number, sheetAspect: number): { photo: PrintBox; sheet: PrintBox } {
  const stageHeight = stageWidth / PRINTS.aspect;
  const place = (print: { left: number; top: number }, width: number, height: number): PrintBox => ({
    x: print.left * stageWidth + width / 2 - stageWidth / 2,
    y: stageHeight / 2 - (print.top * stageHeight + height / 2),
    width,
    height,
  });
  const photoWidth = PRINTS.photo.width * stageWidth;
  const sheetWidth = PRINTS.sheet.width * stageWidth;
  return {
    photo: place(PRINTS.photo, photoWidth, photoWidth * (1 - PHOTO_PRINT.border + PHOTO_PRINT.bottom)),
    sheet: place(PRINTS.sheet, sheetWidth, sheetWidth * sheetAspect),
  };
}

function loadTexture(url: string): Promise<Texture> {
  return new TextureLoader().loadAsync(url).then((map) => {
    map.colorSpace = SRGBColorSpace;
    map.anisotropy = 8;
    return map;
  });
}

/** Null when the slot or its data is missing; the HTML prints then simply stay. */
export function createHeroPart(slot: HTMLElement | null): RoomPart | null {
  if (!slot) return null;
  const replay = slot.querySelector<HTMLButtonElement>('[data-replay]');
  const { photoUrl, sheetUrl, boxes: boxesJson, person = 'person', name = '' } = slot.dataset;
  if (!photoUrl || !sheetUrl || !boxesJson) return null;
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
    layout() {
      if (size.photo.width > 0 || !textures) return;
      const image = textures.sheet.image as { width: number; height: number } | undefined;
      const aspect = image && image.width > 0 ? image.height / image.width : 1 / PRINTS.aspect;
      const prints = printLayout(STAGE_WIDTH, aspect);
      root.scale.setScalar(DESIGN_UNIT);
      root.position.set(STATIONS.hero.x, STATIONS.hero.y, STATIONS.hero.z);
      photo.position.set(prints.photo.x, prints.photo.y, DEPTH.photo);
      sheet.position.set(prints.sheet.x, prints.sheet.y, DEPTH.sheet);
      photo.rotation.z = (-PRINTS.photo.rotate * Math.PI) / 180;
      sheet.rotation.z = (-PRINTS.sheet.rotate * Math.PI) / 180;
      size = {
        photo: { width: prints.photo.width, height: prints.photo.height },
        sheet: { width: prints.sheet.width, height: prints.sheet.height },
      };
      assemble();
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
