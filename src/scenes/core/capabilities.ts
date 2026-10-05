/**
 * Decide whether a 3D scene should run (docs/03-design-system.md §6).
 * `decide3D` is pure; `detectCapabilities` reads the browser environment.
 */

export interface DeviceCapabilities {
  readonly webgl: boolean;
  readonly reducedMotion: boolean;
  readonly saveData: boolean;
  readonly hardwareConcurrency: number;
}

export type Decision3D =
  | { readonly mode: 'animated' }
  | { readonly mode: 'still'; readonly reason: 'reduced-motion' }
  | { readonly mode: 'off'; readonly reason: 'no-webgl' | 'save-data' | 'low-power' };

/** Devices with this many logical cores or fewer get the static fallback. */
export const MIN_CORES_FOR_3D = 2;

export function decide3D(caps: DeviceCapabilities): Decision3D {
  if (!caps.webgl) return { mode: 'off', reason: 'no-webgl' };
  if (caps.saveData) return { mode: 'off', reason: 'save-data' };
  if (caps.hardwareConcurrency > 0 && caps.hardwareConcurrency <= MIN_CORES_FOR_3D) {
    return { mode: 'off', reason: 'low-power' };
  }
  if (caps.reducedMotion) return { mode: 'still', reason: 'reduced-motion' };
  return { mode: 'animated' };
}

/** True when a WebGL context can be created. The probe canvas is discarded immediately. */
export function hasWebGL(doc: Document = document): boolean {
  try {
    const canvas = doc.createElement('canvas');
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return context !== null;
  } catch {
    return false;
  }
}

export function detectCapabilities(win: Window = window): DeviceCapabilities {
  const connection = (win.navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return {
    webgl: hasWebGL(win.document),
    reducedMotion: win.matchMedia('(prefers-reduced-motion: reduce)').matches,
    saveData: connection?.saveData === true,
    hardwareConcurrency: win.navigator.hardwareConcurrency ?? 0,
  };
}
