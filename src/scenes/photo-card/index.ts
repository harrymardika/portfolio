/**
 * Hero photo card (docs/03-design-system.md §5): a card with the profile photo that tilts toward
 * the pointer, a face-detection frame that periodically "locks", and decorative spheres and ring.
 * Text and photo are drawn into canvas textures; colors come from the CSS token palette.
 */
import {
  BoxGeometry,
  CanvasTexture,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
} from 'three';

import { CARD_TEXTURE, FACE_BOX, MOTION } from './config';
import { fitScale, lockAmount, visibleHeight } from './layout';
import { damp } from '@/scenes/core/math';

import type { ScenePalette } from '@/scenes/core/palette';
import type { SceneModule, SceneSetup } from '@/scenes/core/types';

export interface PhotoCardContent {
  readonly photoUrl: string;
  readonly name: string;
  readonly role: string;
  readonly location: string;
  /** Label above the detection frame, e.g. "person · AI PM 0.99". */
  readonly detectionLabel: string;
}

/** Distance chosen so the 3D card matches the size of the static HTML card it replaces. */
const CAMERA = { fov: 40, distance: 7.5 } as const;
/** Card size in world units; height follows the texture aspect ratio. */
const CARD_WIDTH = 3.2;
const CARD_HEIGHT = (CARD_WIDTH * CARD_TEXTURE.height) / CARD_TEXTURE.width;
/** World size of the card plus ring and spheres, used to fit the stage. */
const CONTENT_SIZE = { width: 6.6, height: 6.2 } as const;

const css = (color: number): string => `#${color.toString(16).padStart(6, '0')}`;

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function createCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_TEXTURE.width;
  canvas.height = CARD_TEXTURE.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas is not available');
  return { canvas, ctx };
}

/** Card face: white card, square photo, name, role, and location chip. */
function drawFace(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  content: PhotoCardContent,
  palette: ScenePalette,
): void {
  const { width, height, padding, radius } = CARD_TEXTURE;
  const photoSize = width - padding * 2;
  ctx.clearRect(0, 0, width, height);
  roundedRect(ctx, 0, 0, width, height, radius);
  ctx.fillStyle = css(palette['on-forest']);
  ctx.fill();

  ctx.save();
  roundedRect(ctx, padding, padding, photoSize, photoSize, radius - 14);
  ctx.clip();
  ctx.drawImage(photo, padding, padding, photoSize, photoSize);
  ctx.restore();

  const textX = padding + 12;
  ctx.fillStyle = css(palette.forest);
  ctx.font = '400 44px "Young Serif", Georgia, serif';
  ctx.fillText(content.name, textX, 690, width - textX * 2);
  ctx.font = '600 24px "Plus Jakarta Sans Variable", system-ui, sans-serif';
  ctx.globalAlpha = 0.75;
  ctx.fillText(content.role, textX, 734, width - textX * 2);
  ctx.globalAlpha = 1;

  ctx.font = '700 20px "Plus Jakarta Sans Variable", system-ui, sans-serif';
  const chipWidth = ctx.measureText(content.location).width + 36;
  roundedRect(ctx, textX, 758, chipWidth, 34, 17);
  ctx.fillStyle = css(palette.amber);
  ctx.fill();
  ctx.fillStyle = css(palette.forest);
  ctx.fillText(content.location, textX + 18, 782);
}

/** Detection overlay: four corner brackets and a label, on a transparent texture the size of the card. */
function drawDetection(ctx: CanvasRenderingContext2D, label: string, palette: ScenePalette): void {
  const { width, height, padding } = CARD_TEXTURE;
  const photoSize = width - padding * 2;
  const x = padding + FACE_BOX.x * photoSize;
  const y = padding + FACE_BOX.y * photoSize;
  const w = FACE_BOX.width * photoSize;
  const h = FACE_BOX.height * photoSize;
  const arm = 30;
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = css(palette.amber);
  ctx.lineWidth = 6;
  for (const [cx, cy, dx, dy] of [
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(cx + dx * arm, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * arm);
    ctx.stroke();
  }
  ctx.font = '500 20px "IBM Plex Mono", ui-monospace, monospace';
  const labelWidth = ctx.measureText(label).width + 20;
  ctx.fillStyle = css(palette.amber);
  ctx.fillRect(x, y - 40, labelWidth, 32);
  ctx.fillStyle = css(palette.forest);
  ctx.fillText(label, x + 10, y - 17);
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  await image.decode();
  return image;
}

async function fontsReady(): Promise<void> {
  await Promise.all(
    ['400 44px "Young Serif"', '600 24px "Plus Jakarta Sans Variable"', '500 20px "IBM Plex Mono"'].map(
      (font) => document.fonts.load(font),
    ),
  );
}

export function createPhotoCard(setup: SceneSetup, content: PhotoCardContent): SceneModule {
  const { palette } = setup;
  const scene = new Scene();
  const camera = new PerspectiveCamera(CAMERA.fov, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA.distance);

  // Physically based light units (three r155+): brighter than the r128 prototype values.
  scene.add(new HemisphereLight(palette['on-forest'], palette.forest, 2.2));
  const sun = new DirectionalLight(palette['on-forest'], 2.4);
  sun.position.set(3, 5, 6);
  scene.add(sun);

  const root = new Group();
  scene.add(root);
  const card = new Group();
  root.add(card);

  const face = createCanvas();
  const faceTexture = new CanvasTexture(face.canvas);
  faceTexture.colorSpace = SRGBColorSpace;
  const facePlane = new Mesh(
    new PlaneGeometry(CARD_WIDTH, CARD_HEIGHT),
    new MeshBasicMaterial({ map: faceTexture, transparent: true }),
  );
  facePlane.position.z = 0.031;
  card.add(facePlane);
  card.add(
    new Mesh(
      new BoxGeometry(CARD_WIDTH * 0.985, CARD_HEIGHT * 0.985, 0.06),
      new MeshStandardMaterial({ color: palette['on-forest'], roughness: 0.6 }),
    ),
  );

  const detection = createCanvas();
  const detectionTexture = new CanvasTexture(detection.canvas);
  detectionTexture.colorSpace = SRGBColorSpace;
  const detectionMaterial = new MeshBasicMaterial({
    map: detectionTexture,
    transparent: true,
    depthWrite: false,
  });
  const detectionPlane = new Mesh(new PlaneGeometry(CARD_WIDTH, CARD_HEIGHT), detectionMaterial);
  detectionPlane.position.z = 0.035;
  detectionPlane.visible = false;
  card.add(detectionPlane);

  const ring = new Mesh(
    new TorusGeometry(2.9, 0.025, 8, 120),
    new MeshBasicMaterial({ color: palette['on-forest'], transparent: true, opacity: 0.25 }),
  );
  // Tilted so the near side of the orbit crosses the card below the face.
  ring.rotation.x = -1.35;
  root.add(ring);

  const spheres = (
    [
      [palette.amber, 0.32, -2.3, 1.9, 0.6],
      [palette['on-forest'], 0.18, 2.2, 2.3, 0.4],
      [palette.mint, 0.42, 2.3, -1.9, -0.6],
      [palette.amber, 0.14, -2, -2.3, 1],
    ] as const
  ).map(([color, radius, x, y, z], index) => {
    const sphere = new Mesh(
      new SphereGeometry(radius, 32, 24),
      new MeshStandardMaterial({ color, roughness: 0.35 }),
    );
    sphere.position.set(x, y, z);
    sphere.userData = { baseY: y, phase: index };
    root.add(sphere);
    return sphere;
  });

  void Promise.all([loadImage(content.photoUrl), fontsReady()])
    .then(([photo]) => {
      drawFace(face.ctx, photo, content, palette);
      drawDetection(detection.ctx, content.detectionLabel, palette);
      faceTexture.needsUpdate = true;
      detectionTexture.needsUpdate = true;
      detectionPlane.visible = true;
      setup.ready();
    })
    .catch((error: unknown) => console.error('Photo card texture failed to load', error));

  return {
    scene,
    camera,
    update({ dt, elapsed, pointer }) {
      const sway =
        pointer.x === 0 && pointer.y === 0 ? Math.sin(elapsed * MOTION.swaySpeed) * MOTION.swayAmplitude : 0;
      card.rotation.y = damp(card.rotation.y, pointer.x * MOTION.tiltY + sway, MOTION.followRate, dt);
      card.rotation.x = damp(card.rotation.x, pointer.y * MOTION.tiltX, MOTION.followRate, dt);
      ring.rotation.z += dt * MOTION.ringSpeed;
      for (const sphere of spheres) {
        const { baseY, phase } = sphere.userData as { baseY: number; phase: number };
        sphere.position.y = baseY + Math.sin(elapsed + phase) * MOTION.bobAmplitude;
      }
      // Still mode (elapsed stays 0) shows the frame fully locked.
      const lock = setup.mode === 'still' ? 1 : lockAmount(elapsed);
      detectionMaterial.opacity = 0.35 + 0.65 * lock;
      detectionPlane.scale.setScalar(1 + (1 - lock) * 0.06);
    },
    resize(width, height) {
      const aspect = width / height;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      root.scale.setScalar(
        fitScale(aspect, visibleHeight(CAMERA.fov, CAMERA.distance), CONTENT_SIZE.width, CONTENT_SIZE.height),
      );
    },
  };
}
