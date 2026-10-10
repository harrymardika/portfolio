/**
 * Scene colors come from the CSS design tokens (src/styles/tokens.css), never from scene code,
 * so the 3D always matches the page theme.
 */

/** Token names (without `--`) a scene may read. */
export const PALETTE_TOKENS = [
  'forest',
  'amber',
  'sage',
  'surface',
  'ink',
  'on-forest',
  'line',
  'mint',
  'room-shadow',
  'room-sky',
  'room-ground',
  'room-sun',
] as const;
export type PaletteToken = (typeof PALETTE_TOKENS)[number];
export type ScenePalette = Readonly<Record<PaletteToken, number>>;

/** Parse `#rrggbb`, `#rgb`, or `rgb(r, g, b)` / `rgb(r g b)` into a 0xRRGGBB number. */
export function parseCssColor(value: string): number | null {
  const text = value.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(text)?.[1];
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
    return Number.parseInt(full, 16);
  }
  const rgb = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/.exec(text);
  if (rgb) {
    const [r, g, b] = rgb.slice(1, 4).map((part) => Math.min(255, Number(part)));
    return ((r ?? 0) << 16) | ((g ?? 0) << 8) | (b ?? 0);
  }
  return null;
}

/** Read every palette token from computed styles. Throws if a token is missing, naming it. */
export function readPalette(element: Element = document.documentElement): ScenePalette {
  const styles = getComputedStyle(element);
  const entries = PALETTE_TOKENS.map((token) => {
    const color = parseCssColor(styles.getPropertyValue(`--${token}`));
    if (color === null) throw new Error(`CSS token --${token} is missing or not a hex/rgb color`);
    return [token, color] as const;
  });
  return Object.fromEntries(entries) as ScenePalette;
}
