import type { Decision3D } from './capabilities';
import type { ScenePalette } from './palette';
import type { Camera, Scene } from 'three';

/** Returned by every `mount*` function (docs/02-architecture.md §6). */
export interface SceneHandle {
  /** Stop the loop and free GPU resources. Must be safe to call twice. */
  destroy(): void;
}

/** Per-frame input shared with scenes. */
export interface FrameContext {
  /** Seconds since the previous frame, clamped (0 on the first frame). */
  readonly dt: number;
  /** Seconds since mount. */
  readonly elapsed: number;
  /** Pointer over the stage, -1..1 (0,0 when the pointer is away). */
  readonly pointer: { readonly x: number; readonly y: number };
}

/** What a concrete scene (photo card, journey path) provides to `mountScene`. */
export interface SceneModule {
  readonly scene: Scene;
  readonly camera: Camera;
  /** Advance the animation. Not called in `still` mode except once after layout. */
  update(frame: FrameContext): void;
  /** React to a new canvas size in CSS pixels. */
  resize(width: number, height: number): void;
  /** Free resources that `disposeObject3D` cannot reach (DOM listeners, timers, canvas textures). */
  dispose?(): void;
}

export interface SceneSetup {
  readonly palette: ScenePalette;
  readonly mode: Exclude<Decision3D['mode'], 'off'>;
  /** Ask for one more frame; needed in `still` mode after async work such as a texture load. */
  readonly invalidate: () => void;
}
