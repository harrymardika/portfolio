/**
 * Decide whether a 3D scene should run (docs/03-design-system.md §6).
 * `decide3D` is pure; `detectCapabilities` reads the browser environment.
 */

export type Mode3D = 'animated' | 'still' | 'off';

export interface DeviceCapabilities {
  readonly webgl: boolean;
  /** WebGL runs on the CPU (no usable GPU), so every animated frame blocks the main thread. */
  readonly softwareRenderer?: boolean;
  readonly reducedMotion: boolean;
  readonly saveData: boolean;
  readonly hardwareConcurrency: number;
  /** Debugging and tests: `localStorage['3d:mode']` overrides the decision. */
  readonly forced?: Mode3D | null;
}

export type Decision3D =
  | { readonly mode: 'animated' }
  | { readonly mode: 'still'; readonly reason: 'reduced-motion' | 'software-renderer' | 'forced' }
  | { readonly mode: 'off'; readonly reason: 'no-webgl' | 'save-data' | 'low-power' | 'forced' };

/** localStorage key that forces a mode, e.g. `localStorage.setItem('3d:mode', 'animated')`. */
export const FORCE_MODE_KEY = '3d:mode';

/** Devices with this many logical cores or fewer get the static fallback. */
export const MIN_CORES_FOR_3D = 2;

export function decide3D(caps: DeviceCapabilities): Decision3D {
  if (caps.forced === 'off') return { mode: 'off', reason: 'forced' };
  if (!caps.webgl) return { mode: 'off', reason: 'no-webgl' };
  if (caps.forced === 'animated') return { mode: 'animated' };
  if (caps.forced === 'still') return { mode: 'still', reason: 'forced' };
  if (caps.saveData) return { mode: 'off', reason: 'save-data' };
  if (caps.hardwareConcurrency > 0 && caps.hardwareConcurrency <= MIN_CORES_FOR_3D) {
    return { mode: 'off', reason: 'low-power' };
  }
  if (caps.reducedMotion) return { mode: 'still', reason: 'reduced-motion' };
  // One frame is affordable on a CPU renderer; a continuous loop blocks the page (seconds of
  // main-thread time on machines without a GPU, measured in CI).
  if (caps.softwareRenderer) return { mode: 'still', reason: 'software-renderer' };
  return { mode: 'animated' };
}

/** CPU implementations of WebGL: SwiftShader (Chrome without a GPU), llvmpipe/softpipe (Linux), WARP (Windows). */
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render driver/i;

export function isSoftwareRenderer(renderer: string): boolean {
  return SOFTWARE_RENDERER.test(renderer);
}

/** Probe WebGL once; the probe canvas and its context are discarded immediately. */
export function probeWebGL(doc: Document = document): { webgl: boolean; softwareRenderer: boolean } {
  try {
    const canvas = doc.createElement('canvas');
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!context) return { webgl: false, softwareRenderer: false };
    // Chrome names the real renderer through this extension; Firefox and Safari in RENDERER itself.
    const info = context.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(
      context.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : context.RENDERER) ?? '',
    );
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return { webgl: true, softwareRenderer: isSoftwareRenderer(renderer) };
  } catch {
    return { webgl: false, softwareRenderer: false };
  }
}

function forcedMode(win: Window): Mode3D | null {
  try {
    const value = win.localStorage.getItem(FORCE_MODE_KEY);
    return value === 'animated' || value === 'still' || value === 'off' ? value : null;
  } catch {
    return null;
  }
}

export function detectCapabilities(win: Window = window): DeviceCapabilities {
  const connection = (win.navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return {
    ...probeWebGL(win.document),
    forced: forcedMode(win),
    reducedMotion: win.matchMedia('(prefers-reduced-motion: reduce)').matches,
    saveData: connection?.saveData === true,
    hardwareConcurrency: win.navigator.hardwareConcurrency ?? 0,
  };
}
