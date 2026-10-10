/**
 * Small building blocks shared by the room's parts: text labels, detection brackets, and soft blob
 * shadows. Sizes are in CSS pixels; parts place them inside a group scaled by `worldPerPixel`.
 */
import {
  CanvasTexture,
  type ColorRepresentation,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';

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
