/**
 * Room part: the hero prints (T13.4). The owner's photo print floats in front of a ruled sheet with
 * his name in Javanese script, at the hero's station on the wall (ADR 0020); both cast shadows on it.
 * Once, when they are ready, the face is detected (person → name) and then the thesis model reads the
 * sheet syllable by syllable. The prints keep the proportions of their HTML twin (HeroPrints.astro,
 * both from hero-config.ts), on a stage `STAGE_WIDTH` design pixels wide.
 */
import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  SphereGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  TextureLoader,
  type Material,
  type Texture,
} from 'three';

import { blobShadow, brackets, easeOut, fontsReady, label, MONO, paperFibers, SANS } from '../paper';
import { STATIONS } from '../world';
import {
  FACE_BOX,
  HERO_UNIT,
  PHOTO_PRINT,
  PRINT_DEPTH,
  printLayout,
  PRINTS,
  SEQUENCE,
  STAGE_WIDTH,
} from './hero-config';

import type { ScenePalette } from '../../core/palette';
import type { RoomContext, RoomFrame, RoomPart } from '../index';

/** How far the photo print floats in front of the sheet, and the sheet's curl (CSS px). */
const DEPTH = { ...PRINT_DEPTH, curl: 16, boxes: 10 } as const;
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

/** The opening (T14.2): the room starts dim, the hero's lamp flickers on, then detection starts. */
export const LAMP = {
  /** Light level of the dim room. */
  dim: 0.18,
  /** The lamp flickers at this time (s after the prints are drawn), then comes up to full. */
  flicker: 0.45,
  full: 1.15,
  /** The detection sequence starts this long after the prints are drawn. */
  detectFrom: 1.3,
  /** Where the lamp hangs, relative to the hero stage centre (design px, y up). */
  at: { x: 10, y: 300, z: 140 },
} as const;

/** The room's light level and the bulb's glow (0..1) at time `t` of the opening. Pure; tested. */
export function lampAt(t: number): { level: number; bulb: number; on: boolean } {
  if (t < LAMP.flicker) return { level: LAMP.dim, bulb: 0, on: false };
  // A short flicker: on, off, then up.
  if (t < LAMP.flicker + 0.08) return { level: 0.7, bulb: 1, on: false };
  if (t < LAMP.flicker + 0.16) return { level: LAMP.dim, bulb: 0.1, on: false };
  const k = easeOut((t - LAMP.flicker - 0.16) / (LAMP.full - LAMP.flicker - 0.16));
  return { level: LAMP.dim + (1 - LAMP.dim) * k, bulb: 1, on: k >= 1 };
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

  // The lamp hanging above the prints: cord, shade, and bulb (design px, like the prints).
  const lamp = new Group();
  const cordMaterial = new MeshStandardMaterial({ roughness: 0.6 });
  const shadeMaterial = new MeshStandardMaterial({ roughness: 0.55, side: DoubleSide });
  const bulbMaterial = new MeshStandardMaterial({ roughness: 0.2, emissiveIntensity: 0 });
  const pinMaterial = new MeshStandardMaterial({ roughness: 0.7 });
  {
    const cord = new Mesh(new CylinderGeometry(1.4, 1.4, 600, 8), cordMaterial);
    cord.position.y = 300 + 30;
    const shade = new Mesh(new ConeGeometry(52, 46, 32, 1, true), shadeMaterial);
    shade.position.y = 23;
    const bulb = new Mesh(new SphereGeometry(15, 24, 16), bulbMaterial);
    bulb.position.y = 4;
    lamp.add(cord, shade, bulb);
    lamp.position.set(LAMP.at.x, LAMP.at.y, LAMP.at.z);
    root.add(lamp);
  }
  /**
   * The opening: waiting for the prints, playing, or done. It plays only when the room starts with
   * the page at its top (not when it opens further down, e.g. at #contact, and the prints are only
   * built once the reader scrolls back up).
   */
  let intro: 'waiting' | 'playing' | 'done' = window.scrollY < window.innerHeight * 0.5 ? 'waiting' : 'done';
  let introStart = 0;
  let setLight: (level: number) => void = () => undefined;
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
          // The clothespins share one material, reused by the next assemble.
          if (material !== pinMaterial) material.dispose();
        }
      });
    }
  };

  const amber = (): number => palette?.amber ?? 0xf2b134;
  // Prints are white paper in both themes, like the HTML twins (`--on-forest`).
  const paper = (): number => palette?.['on-forest'] ?? 0xffffff;
  const ink = (): number => palette?.forest ?? 0x173d32;

  /** A clothespin holding a print at the middle of its top edge (`y`), just in front of it (`z`). */
  const clothespin = (y: number, z: number): Group => {
    const pin = new Group();
    for (const side of [-1, 1]) {
      const jaw = new Mesh(new BoxGeometry(10, 34, 5), pinMaterial);
      jaw.position.set(0, 4, side * 3.5);
      jaw.castShadow = shadows;
      pin.add(jaw);
    }
    pin.position.set(0, y, z);
    return pin;
  };

  const assemble = (): void => {
    if (!textures || size.photo.width === 0 || size.sheet.width === 0) return;
    clear(photo);
    clear(sheet);
    const shadowColor = palette?.['room-shadow'] ?? 0x0f2a33;

    // Photo print: white paper box, the photo inset with a deeper bottom margin.
    const { width: pw, height: ph } = size.photo;
    const print = new Mesh(
      new BoxGeometry(pw, ph, 3),
      new MeshStandardMaterial({ color: paper(), roughness: 0.85, bumpMap: paperFibers(), bumpScale: 1.5 }),
    );
    print.castShadow = shadows;
    const side = pw * (1 - 2 * PHOTO_PRINT.border);
    const picture = new Mesh(
      new PlaneGeometry(side, side),
      new MeshStandardMaterial({ map: textures.photo, roughness: 0.5 }),
    );
    const pictureY = ph / 2 - pw * PHOTO_PRINT.border - side / 2;
    picture.position.set(0, pictureY, 1.6);
    photo.add(print, picture, clothespin(ph / 2, 3));
    // A soft contact shadow behind the print; without a shadow map it is the only one, so darker.
    const photoBlob = blobShadow(pw * 1.25, ph * 1.2, shadowColor, shadows ? 0.16 : 0.4);
    photoBlob.position.set(pw * 0.08, -ph * 0.08, -DEPTH.photo - 6);
    photo.add(photoBlob);
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
      new MeshStandardMaterial({
        map: textures.sheet,
        color: paper(),
        roughness: 0.92,
        bumpMap: paperFibers(),
        bumpScale: 1.5,
      }),
    );
    page.castShadow = shadows;
    page.receiveShadow = shadows;
    sheet.add(page, clothespin(sh / 2, curl(0, sw) + 2));
    const sheetBlob = blobShadow(sw * 1.2, sh * 1.25, shadowColor, shadows ? 0.14 : 0.3);
    sheetBlob.position.set(sw * 0.05, -sh * 0.08, -12);
    sheet.add(sheetBlob);
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

  const lightBulb = (glow: number): void => {
    bulbMaterial.emissiveIntensity = glow * 2.2;
  };

  /**
   * The walls dim with the lamp (0 = lamp fully on, 1 = dark): a layer behind the canvas
   * (HomeRoom.astro), since the walls are the page's own background, not part of the 3D.
   */
  const darkWalls = (dark: number): void => {
    if (dark <= 0) document.documentElement.style.removeProperty('--room-dark');
    else document.documentElement.style.setProperty('--room-dark', dark.toFixed(3));
  };

  const onReplay = (): void => {
    // During the opening, detection still waits for the lamp.
    started = intro === 'playing' ? Math.max(clock, introStart + LAMP.detectFrom) : clock;
    invalidate();
  };

  return {
    slot,
    async build(room: RoomContext) {
      shadows = room.shadows;
      still = room.mode === 'still';
      invalidate = room.invalidate;
      setLight = room.setLight;
      palette = room.palette;
      // The opening plays once, in animated mode; otherwise the lamp is simply on.
      if (still) intro = 'done';
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
      const prints = printLayout(STAGE_WIDTH);
      root.scale.setScalar(HERO_UNIT);
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
      // Only now is the 3D on screen: hide the flat prints and start the opening (or the sequence).
      slot.dataset['roomReady'] = 'true';
      startPending = true;
      // The reader may have scrolled on while the prints were loading: then no opening.
      if (intro === 'waiting' && window.scrollY >= window.innerHeight * 0.5) intro = 'done';
      if (intro === 'waiting') {
        setLight(LAMP.dim);
        darkWalls(1);
        slot.dataset['lamp'] = 'off';
      } else {
        lightBulb(1);
        slot.dataset['lamp'] = 'on';
      }
    },
    update(frame: RoomFrame) {
      clock = frame.elapsed;
      if (startPending) {
        startPending = false;
        introStart = clock;
        intro = intro === 'waiting' ? 'playing' : intro;
        // After the opening, the face is detected once the lamp is on.
        started = intro === 'playing' ? clock + LAMP.detectFrom : clock;
      }
      let opening = false;
      if (intro === 'playing') {
        const state = lampAt(clock - introStart);
        setLight(state.level);
        lightBulb(state.bulb);
        darkWalls(state.on ? 0 : (1 - state.level) / (1 - LAMP.dim));
        if (state.on) {
          intro = 'done';
          slot.dataset['lamp'] = 'on';
        } else opening = true;
      }
      applySequence();
      return opening || (!still && !sequenceAt(clock - started, syllables.length).done);
    },
    recolor(next: ScenePalette) {
      palette = next;
      cordMaterial.color.setHex(next.ink);
      shadeMaterial.color.setHex(next.forest);
      pinMaterial.color.setHex(next.line);
      bulbMaterial.color.setHex(next['room-sun']);
      bulbMaterial.emissive.setHex(next['room-sun']);
      assemble();
    },
    dispose() {
      replay?.removeEventListener('click', onReplay);
      if (replay) replay.hidden = true;
      // An opening cut short must not leave the room dark.
      if (intro === 'playing') setLight(1);
      darkWalls(0);
      delete slot.dataset['roomReady'];
      delete slot.dataset['lamp'];
    },
  };
}
