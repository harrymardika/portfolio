/**
 * Shared mounting for every 3D scene: capability check, renderer, sizing, pointer tracking,
 * pausing off-screen, still frames for reduced motion, and cleanup.
 * Concrete scenes only build objects and animate them (see SceneModule).
 */
import { WebGLRenderer } from 'three';

import { decide3D, detectCapabilities, type Decision3D } from './capabilities';
import { disposeObject3D } from './dispose';
import { createLoop } from './loop';
import { cappedPixelRatio } from './math';
import { readPalette } from './palette';
import { normalizePointer } from './pointer';

import type { SceneHandle, SceneModule, SceneSetup } from './types';

export interface MountOptions {
  /** Element whose size the canvas follows and which receives pointer input. */
  readonly stage: HTMLElement;
  readonly canvas: HTMLCanvasElement;
  readonly create: (setup: SceneSetup) => SceneModule;
  /** Override detection (tests, debugging). */
  readonly decision?: Decision3D;
}

/** Returns null when 3D should stay off; the static HTML fallback then remains visible. */
export function mountScene({ stage, canvas, create, decision }: MountOptions): SceneHandle | null {
  const choice = decision ?? decide3D(detectCapabilities());
  stage.dataset['scene'] = choice.mode;
  if (choice.mode === 'off') return null;

  // Without a GPU every pixel is computed (and, in headless browsers, read back) by the CPU: render
  // the still frame at 1x and without multisampling, which cuts its cost roughly threefold.
  const software = choice.mode === 'still' && choice.reason === 'software-renderer';

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: !software, alpha: true, powerPreference: 'low-power' });
  } catch (error) {
    console.warn('3D disabled: could not create a WebGL renderer', error);
    stage.dataset['scene'] = 'off';
    return null;
  }
  renderer.setPixelRatio(software ? 1 : cappedPixelRatio(window.devicePixelRatio));
  // Checking each shader after linking waits synchronously for the GPU to compile it (hundreds of ms
  // on slow phones). Shaders are fixed at build time, so check them in development only; a broken
  // shader in production shows an empty canvas while the HTML labels stay readable.
  renderer.debug.checkShaderErrors = import.meta.env.DEV;

  const pointer = { x: 0, y: 0 };
  let elapsed = 0;
  let module: SceneModule | null = null;
  // Frames wait until the shaders are compiled (see compileAsync below).
  let compiled = false;
  let destroyed = false;

  const renderFrame = (dt: number): void => {
    if (!module || !compiled || destroyed) return;
    elapsed += dt;
    module.update({ dt, elapsed, pointer });
    renderer.render(module.scene, module.camera);
  };

  const loop = createLoop({ step: renderFrame });
  // Still mode renders on demand; requests in the same frame (resize, compile done, texture ready)
  // share one render instead of each paying for a full frame.
  let framePending = false;
  const invalidate = (): void => {
    if (choice.mode !== 'still' || framePending) return;
    framePending = true;
    requestAnimationFrame(() => {
      framePending = false;
      renderFrame(0);
    });
  };

  const ready = (): void => {
    stage.dataset['sceneReady'] = 'true';
    invalidate();
  };

  module = create({ palette: readPalette(), mode: choice.mode, invalidate, ready });
  // Compile every shader up front without blocking the main thread (KHR_parallel_shader_compile
  // where available). Otherwise the first frame compiles them synchronously: one long task that
  // can also coincide with the photo texture upload.
  const { scene, camera } = module;
  // Promise.resolve() also turns a synchronous throw inside compileAsync into a rejection.
  void Promise.resolve()
    .then(() => renderer.compileAsync(scene, camera))
    .catch((error: unknown) => console.warn('3D: shader precompile failed, compiling on first frame', error))
    .finally(() => {
      if (destroyed) return;
      compiled = true;
      invalidate();
    });

  const resize = (): void => {
    const { width, height } = stage.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    renderer.setSize(width, height, false);
    module?.resize(width, height);
    invalidate();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  resize();

  const onPointerMove = (event: PointerEvent): void => {
    Object.assign(pointer, normalizePointer(event.clientX, event.clientY, stage.getBoundingClientRect()));
  };
  const onPointerLeave = (): void => {
    Object.assign(pointer, { x: 0, y: 0 });
  };
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerleave', onPointerLeave);

  // Animate only while visible; still mode renders a single frame instead.
  const visibility = new IntersectionObserver(([entry]) => {
    if (choice.mode === 'still') return;
    if (entry?.isIntersecting) loop.start();
    else loop.stop();
  });
  visibility.observe(stage);
  if (choice.mode === 'still') invalidate();

  stage.dataset['scene'] = choice.mode;
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      loop.stop();
      visibility.disconnect();
      resizeObserver.disconnect();
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerleave', onPointerLeave);
      if (module) {
        module.dispose?.();
        disposeObject3D(module.scene);
      }
      renderer.dispose();
      delete stage.dataset['scene'];
      delete stage.dataset['sceneReady'];
    },
  };
}
