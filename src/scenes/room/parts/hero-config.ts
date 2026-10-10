/**
 * Geometry shared by the hero prints' HTML (src/components/hero/HeroPrints.astro) and their 3D twins
 * (./hero.ts), so the 3D lands exactly where the HTML fallback was. Fractions, not pixels.
 */

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
