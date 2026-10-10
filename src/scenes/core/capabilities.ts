/**
 * Decide whether a 3D scene should run (docs/03-design-system.md §6).
 * `decide3D` is pure; `detectCapabilities` reads the browser environment.
 */

export type Mode3D = 'animated' | 'still' | 'off';

export interface DeviceCapabilities {
  readonly webgl: boolean;
  /** WebGL runs on the CPU (no usable GPU): even one frame blocks the main thread for long. */
  readonly softwareRenderer?: boolean;
  readonly reducedMotion: boolean;
  readonly saveData: boolean;
  readonly hardwareConcurrency: number;
  /** The main pointer is a finger (phones, tablets): lighter 3D (no real-time shadows). */
  readonly coarsePointer?: boolean;
  /** Debugging and tests: `localStorage['3d:mode']` overrides the decision. */
  readonly forced?: Mode3D | null;
}

export type Decision3D =
  | { readonly mode: 'animated' }
  | { readonly mode: 'still'; readonly reason: 'reduced-motion' | 'forced' }
  | {
      readonly mode: 'off';
      readonly reason: 'no-webgl' | 'save-data' | 'low-power' | 'software-renderer' | 'forced';
    };

/** localStorage key that forces a mode, e.g. `localStorage.setItem('3d:mode', 'animated')`. */
export const FORCE_MODE_KEY = '3d:mode';
/** localStorage key that treats a CPU renderer as a GPU (tests run in headless Chromium, which has none). */
export const ASSUME_GPU_KEY = '3d:gpu';

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
  // Without a GPU even a single WebGL frame blocks the page (seconds of main-thread time measured in
  // CI); the static card is the same content, already on screen.
  if (caps.softwareRenderer) return { mode: 'off', reason: 'software-renderer' };
  if (caps.reducedMotion) return { mode: 'still', reason: 'reduced-motion' };
  return { mode: 'animated' };
}

/** Devices with at least this many logical cores, and a precise pointer, draw real-time shadows (ADR 0019). */
export const MIN_CORES_FOR_SHADOWS = 6;

/**
 * Whether the room renders real-time shadows. Phones report as many cores as laptops, so a coarse
 * (touch) pointer also means soft blob shadows instead. Unknown core counts (0) count as capable,
 * like `decide3D`. Save-Data never gets here: it turns the 3D off.
 */
export function realtimeShadows(
  caps: Pick<DeviceCapabilities, 'hardwareConcurrency' | 'coarsePointer'>,
): boolean {
  if (caps.coarsePointer) return false;
  return caps.hardwareConcurrency === 0 || caps.hardwareConcurrency >= MIN_CORES_FOR_SHADOWS;
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

function readStorage(win: Window, key: string): string | null {
  try {
    return win.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function forcedMode(win: Window): Mode3D | null {
  const value = readStorage(win, FORCE_MODE_KEY);
  return value === 'animated' || value === 'still' || value === 'off' ? value : null;
}

export function detectCapabilities(win: Window = window): DeviceCapabilities {
  const connection = (win.navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  const { webgl, softwareRenderer } = probeWebGL(win.document);
  return {
    webgl,
    softwareRenderer: softwareRenderer && readStorage(win, ASSUME_GPU_KEY) !== '1',
    forced: forcedMode(win),
    reducedMotion: win.matchMedia('(prefers-reduced-motion: reduce)').matches,
    saveData: connection?.saveData === true,
    hardwareConcurrency: win.navigator.hardwareConcurrency ?? 0,
    coarsePointer: win.matchMedia('(pointer: coarse)').matches,
  };
}
