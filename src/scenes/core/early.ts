import type { Decision3D } from './capabilities';

/**
 * The 3D decision, taken in <head> before the first paint (ADR 0020), so the home page can lay out its
 * full-screen rooms from the start instead of jumping after `load`. The function is self-contained (no
 * outer references) because BaseLayout inlines its source with `toString()`, so it is a copy of
 * `decide3D(detectCapabilities(win))` (./capabilities.ts): any change there must be made here too.
 * tests/unit/scenes/early.test.ts checks that both agree for every combination of inputs.
 */
export function earlyMode(win: Window): 'animated' | 'still' | 'off' {
  const read = (key: string): string | null => {
    try {
      return win.localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const forced = read('3d:mode');
  if (forced === 'off') return 'off';
  let webgl = false;
  let software = false;
  try {
    const canvas = win.document.createElement('canvas');
    const context = (canvas.getContext('webgl2') ??
      canvas.getContext('webgl')) as WebGLRenderingContext | null;
    if (context) {
      webgl = true;
      const info = context.getExtension('WEBGL_debug_renderer_info');
      const renderer = String(
        context.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : context.RENDERER) ?? '',
      );
      software = /swiftshader|llvmpipe|softpipe|software|basic render driver/i.test(renderer);
      context.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    webgl = false;
  }
  if (!webgl) return 'off';
  if (forced === 'animated' || forced === 'still') return forced;
  const connection = (win.navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData === true) return 'off';
  const cores = win.navigator.hardwareConcurrency ?? 0;
  if (cores > 0 && cores <= 2) return 'off';
  if (software && read('3d:gpu') !== '1') return 'off';
  if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'still';
  return 'animated';
}

/** Root attribute holding the early decision: `animated` or `still`; absent when the room does not run. */
export const ROOM_ATTRIBUTE = 'data-room-3d';

/** Set on the room's stage by HomeRoom as soon as its script runs (see the watchdog below). */
export const ROOM_START_ATTRIBUTE = 'data-room-start';
/** How long after `load` the room's script may take to start before the page falls back (ms). */
export const ROOM_START_GRACE = 4000;

/**
 * The inline <head> script: marks the root with the mode when the room will run. A watchdog then
 * removes the mark if the room's own script never started (it failed to load: a content blocker,
 * a network error, or an old cached page naming files a deploy replaced), so the page falls back to
 * its plain layout instead of keeping the room's empty, full-screen sections.
 */
export function earlyRoomScript(): string {
  const watchdog = `addEventListener('load',function(){setTimeout(function(){if(!document.querySelector('[${ROOM_START_ATTRIBUTE}]'))document.documentElement.removeAttribute('${ROOM_ATTRIBUTE}')},${ROOM_START_GRACE})})`;
  return `try{var m=(${earlyMode.toString()})(window);if(m!=='off'){document.documentElement.setAttribute('${ROOM_ATTRIBUTE}',m);${watchdog}}}catch(e){}`;
}

/**
 * The early decision as the head script left it on the root, or null when the room must not run
 * (decided off, or the script never ran: blocked, failed). It is authoritative, so WebGL is probed
 * once per page and the room never mounts on the plain layout.
 */
export function earlyDecision(root: Element): Decision3D | null {
  const mode = root.getAttribute(ROOM_ATTRIBUTE);
  if (mode === 'animated') return { mode: 'animated' };
  if (mode === 'still') return { mode: 'still', reason: 'reduced-motion' };
  return null;
}
