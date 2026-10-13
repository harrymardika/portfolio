/**
 * Geometry shared by the hero prints' HTML (src/components/hero/HeroPrints.astro) and their 3D twins
 * (./hero.ts): fractions, so both keep the same composition. Also where the 3D prints hang in the
 * room (ADR 0020), which the journey thread (./journey.ts) needs: it is the clothesline they hang on.
 */
import sheetData from '../../../../content/media/aksara-sheet.json';
import { STATIONS, vec3, type Vec3 } from '../world';

/** Face box as fractions of the square photo (matches content/media/profile.jpg). */
export const FACE_BOX = { x: 0.3, y: 0.07, width: 0.39, height: 0.46 } as const;

/** The photo print: white border on three sides and a deeper bottom margin, as fractions of its width. */
export const PHOTO_PRINT = { border: 0.045, bottom: 0.14 } as const;

/** Where each print sits in the hero stage (fractions of the stage) and how it is turned (degrees). */
export const PRINTS = {
  /** Stage aspect ratio, width / height. */
  aspect: 6 / 4.4,
  photo: { left: 0, top: 0.03, width: 0.45, rotate: -3 },
  sheet: { left: 0.37, top: 0.33, width: 0.63, rotate: 2.5 },
} as const;

/**
 * The photo print's padding as fractions of the hero stage's width: CSS percentage padding is
 * measured against the containing block (the stage), not the print itself.
 */
export function photoPrintPadding(): { side: number; bottom: number } {
  return { side: PHOTO_PRINT.border * PRINTS.photo.width, bottom: PHOTO_PRINT.bottom * PRINTS.photo.width };
}

/** Detection sequence, in seconds from the moment the prints are ready. */
export const SEQUENCE = {
  faceIn: 0.6,
  personUntil: 1.9,
  sheetFrom: 2.4,
  sheetStep: 0.42,
  /** The transliteration appears once every syllable is boxed. */
  readAfter: 0.3,
} as const;

/** Width of the hero stage in design pixels (the size it had on the page in Phase 13). */
export const STAGE_WIDTH = 600;
/** World units per design pixel for the hero: the sheet is about 3.5 units wide, like the preview. */
export const HERO_UNIT = 0.0094;
/** How far each print stands in front of the stage plane (design px). */
export const PRINT_DEPTH = { photo: 36, sheet: 0 } as const;
/** The aksara sheet's aspect (height / width), from its image (content/media/aksara-sheet.json). */
const SHEET_ASPECT = sheetData.height / sheetData.width;

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
export function printLayout(
  stageWidth: number,
  sheetAspect: number = SHEET_ASPECT,
): { photo: PrintBox; sheet: PrintBox } {
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

/**
 * The clothespins, in world units: the middle of each print's top edge (turned with the print), where
 * the line holds it. The photo's pin comes first. Pure; tested.
 */
export function heroPins(): [Vec3, Vec3] {
  const prints = printLayout(STAGE_WIDTH);
  const pin = (box: PrintBox, degrees: number, depth: number): Vec3 => {
    const turn = (-degrees * Math.PI) / 180;
    // The top centre (0, h/2) turned about the print's centre.
    const x = box.x - Math.sin(turn) * (box.height / 2);
    const y = box.y + Math.cos(turn) * (box.height / 2);
    return vec3(
      STATIONS.hero.x + x * HERO_UNIT,
      STATIONS.hero.y + y * HERO_UNIT,
      STATIONS.hero.z + depth * HERO_UNIT,
    );
  };
  return [
    pin(prints.photo, PRINTS.photo.rotate, PRINT_DEPTH.photo),
    pin(prints.sheet, PRINTS.sheet.rotate, PRINT_DEPTH.sheet),
  ];
}
