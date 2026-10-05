import { frameDelta } from './math';

export interface LoopOptions {
  /** Called once per frame with the clamped delta in seconds. */
  readonly step: (dt: number) => void;
  /** Called when `step` throws; the loop keeps running so one bad frame cannot kill the page. */
  readonly onError?: (error: unknown) => void;
  /** Injected for tests; defaults to the browser's animation frame API. */
  readonly requestFrame?: (callback: FrameRequestCallback) => number;
  readonly cancelFrame?: (handle: number) => void;
}

export interface Loop {
  /** Start or resume. Safe to call while running. */
  start(): void;
  /** Pause. Safe to call while stopped. */
  stop(): void;
  readonly running: boolean;
}

export function createLoop({
  step,
  onError = (error) => console.error(error),
  requestFrame = (cb) => requestAnimationFrame(cb),
  cancelFrame = (handle) => cancelAnimationFrame(handle),
}: LoopOptions): Loop {
  let handle: number | null = null;
  let previous: number | null = null;

  const tick: FrameRequestCallback = (now) => {
    // The first frame after (re)starting has no previous timestamp, so it advances by 0.
    const dt = previous === null ? 0 : frameDelta(previous, now);
    previous = now;
    try {
      step(dt);
    } catch (error) {
      onError(error);
    }
    handle = requestFrame(tick);
  };

  return {
    start() {
      if (handle !== null) return;
      previous = null;
      handle = requestFrame(tick);
    },
    stop() {
      if (handle === null) return;
      cancelFrame(handle);
      handle = null;
    },
    get running() {
      return handle !== null;
    },
  };
}
