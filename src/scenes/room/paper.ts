/**
 * Small building blocks shared by the room's parts: text labels, detection brackets, soft blob
 * shadows, and paper fibers. Sizes are in design pixels; parts place them inside a group scaled to
 * world units.
 */
import {
  CanvasTexture,
  type ColorRepresentation,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';

/** Label fonts: monospace only for machine output (detection labels, class names), docs/03 §3. */
export const MONO = '500 12px "IBM Plex Mono", ui-monospace, monospace';
export const SANS = '600 12px "Plus Jakarta Sans Variable", system-ui, sans-serif';
/** The display face (titles printed on paper), without a size. */
export const DISPLAY_FAMILY = '"Young Serif", Georgia, serif';

/** Wait (at most 1.5 s) for the canvas fonts, so text is not drawn in a fallback font. */
export async function fontsReady(): Promise<void> {
  const load = Promise.all([
    document.fonts.load(MONO),
    document.fonts.load(SANS),
    document.fonts.load(`400 15px ${DISPLAY_FAMILY}`),
  ]);
  await Promise.race([load, new Promise((resolve) => setTimeout(resolve, 1500))]);
}

/** Canvas pixels per CSS pixel for crisp labels. */
const RESOLUTION = 3;

function texture(canvas: HTMLCanvasElement): CanvasTexture {
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

function hex(value: number): string {
  return `#${value.toString(16).padStart(6, '0')}`;
}

export interface LabelStyle {
  /** CSS font, e.g. '500 12px "IBM Plex Mono"'; the size sets the label height. */
  readonly font: string;
  readonly color: number;
  readonly background?: number;
  /** Horizontal padding in CSS px. */
  readonly padX?: number;
  /** Label height in CSS px. */
  readonly height: number;
}

/** A flat text label, `height` px tall, as wide as its text. Its material starts fully opaque. */
export function label(text: string, style: LabelStyle): Mesh<PlaneGeometry, MeshBasicMaterial> {
  const padX = style.padX ?? 5;
  const measure = document.createElement('canvas').getContext('2d');
  if (measure) measure.font = style.font;
  const width = Math.ceil((measure?.measureText(text).width ?? text.length * 7) + padX * 2);
  const canvas = document.createElement('canvas');
  canvas.width = width * RESOLUTION;
  canvas.height = style.height * RESOLUTION;
  const g = canvas.getContext('2d');
  if (g) {
    g.scale(RESOLUTION, RESOLUTION);
    if (style.background !== undefined) {
      g.fillStyle = hex(style.background);
      g.fillRect(0, 0, width, style.height);
    }
    g.font = style.font;
    g.fillStyle = hex(style.color);
    g.textBaseline = 'middle';
    g.fillText(text, padX, style.height / 2 + 0.5);
  }
  const material = new MeshBasicMaterial({ map: texture(canvas), transparent: true, depthWrite: false });
  return new Mesh(new PlaneGeometry(width, style.height), material);
}

/** Detection corner brackets around a `width` × `height` px box (stroke and arm in px). */
export function brackets(
  width: number,
  height: number,
  color: number,
  stroke = 2,
  arm = 12,
): Mesh<PlaneGeometry, MeshBasicMaterial> {
  const canvas = document.createElement('canvas');
  const w = Math.max(1, Math.round(width * RESOLUTION));
  const h = Math.max(1, Math.round(height * RESOLUTION));
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d');
  if (g) {
    const t = stroke * RESOLUTION;
    const a = Math.min(arm * RESOLUTION, w / 2, h / 2);
    g.fillStyle = hex(color);
    for (const [x, y, sx, sy] of [
      [0, 0, 1, 1],
      [w, 0, -1, 1],
      [0, h, 1, -1],
      [w, h, -1, -1],
    ] as const) {
      g.fillRect(sx > 0 ? x : x - a, sy > 0 ? y : y - t, a, t);
      g.fillRect(sx > 0 ? x : x - t, sy > 0 ? y : y - a, t, a);
    }
    g.globalAlpha = 0.35;
    g.strokeStyle = hex(color);
    g.lineWidth = RESOLUTION;
    g.strokeRect(RESOLUTION / 2, RESOLUTION / 2, w - RESOLUTION, h - RESOLUTION);
  }
  const material = new MeshBasicMaterial({ map: texture(canvas), transparent: true, depthWrite: false });
  return new Mesh(new PlaneGeometry(width, height), material);
}

/** A soft dark blur, for devices without real-time shadows. */
export function blobShadow(width: number, height: number, color: ColorRepresentation, opacity = 0.35) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const g = canvas.getContext('2d');
  if (g) {
    const gradient = g.createRadialGradient(64, 64, 8, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gradient;
    g.fillRect(0, 0, 128, 128);
  }
  const material = new MeshBasicMaterial({
    alphaMap: texture(canvas),
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  return new Mesh(new PlaneGeometry(width, height), material);
}

/** Ease-out cubic on 0..1 (clamped). */
export function easeOut(k: number): number {
  const t = Math.min(1, Math.max(0, k));
  return 1 - (1 - t) ** 3;
}

/** A small, deterministic random sequence (mulberry32), so the paper looks the same on every visit. */
export function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Draw paper fibers: short, faint strokes in every direction, light and dark, over what is there. */
export function drawFibers(g: CanvasRenderingContext2D, width: number, height: number, strength = 1): void {
  const random = seeded(17);
  const count = Math.round((width * height) / 90);
  g.save();
  g.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const x = random() * width;
    const y = random() * height;
    const length = 2 + random() * 9;
    const angle = random() * Math.PI;
    const light = random() < 0.5;
    g.strokeStyle = light ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)';
    g.globalAlpha = (0.025 + random() * 0.05) * strength;
    g.lineWidth = 0.4 + random() * 0.8;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    g.stroke();
  }
  g.restore();
}

let fibers: CanvasTexture | null = null;

/**
 * A height map of paper fibers, shared by every lit paper in the room (bumpMap), stretched once over
 * each print: the prints catch the light like real paper. Created once and disposed with the scene;
 * three.js uploads it again if a new room uses it.
 */
export function paperFibers(): CanvasTexture {
  if (fibers) return fibers;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const g = canvas.getContext('2d');
  if (g) {
    g.fillStyle = 'rgb(128,128,128)';
    g.fillRect(0, 0, 256, 256);
    drawFibers(g, 256, 256, 4);
  }
  fibers = new CanvasTexture(canvas);
  return fibers;
}
