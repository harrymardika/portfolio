import { describe, expect, it } from 'bun:test';

import { decide3D, detectCapabilities, MIN_CORES_FOR_3D } from '@/scenes/core/capabilities';
import {
  earlyDecision,
  earlyMode,
  earlyRoomScript,
  ROOM_ATTRIBUTE,
  ROOM_START_ATTRIBUTE,
  ROOM_START_GRACE,
} from '@/scenes/core/early';

interface FakeOptions {
  webgl: boolean;
  renderer: string;
  forced: string | null;
  assumeGpu: boolean;
  saveData: boolean;
  cores: number;
  reduced: boolean;
  /** Parts of the browser that throw when used. */
  throws?: 'storage' | 'getContext' | 'getParameter';
}

/** A Window with just what the two decisions read. */
function fakeWindow(o: FakeOptions): Window {
  const context = {
    RENDERER: 0x1f01,
    getExtension: (name: string) =>
      name === 'WEBGL_debug_renderer_info'
        ? { UNMASKED_RENDERER_WEBGL: 0x9246 }
        : { loseContext: () => undefined },
    getParameter: () => {
      if (o.throws === 'getParameter') throw new Error('lost context');
      return o.renderer;
    },
  };
  const storage = new Map<string, string>();
  if (o.forced) storage.set('3d:mode', o.forced);
  if (o.assumeGpu) storage.set('3d:gpu', '1');
  return {
    document: {
      createElement: () => ({
        getContext: () => {
          if (o.throws === 'getContext') throw new Error('blocked');
          return o.webgl ? context : null;
        },
      }),
    },
    localStorage: {
      getItem: (key: string) => {
        if (o.throws === 'storage') throw new Error('SecurityError');
        return storage.get(key) ?? null;
      },
    },
    navigator: { hardwareConcurrency: o.cores, connection: { saveData: o.saveData } },
    matchMedia: (query: string) => ({ matches: query.includes('reduced-motion') ? o.reduced : false }),
  } as unknown as Window;
}

const base: FakeOptions = {
  webgl: true,
  renderer: 'ANGLE (NVIDIA)',
  forced: null,
  assumeGpu: false,
  saveData: false,
  cores: 8,
  reduced: false,
};

describe('earlyMode', () => {
  it('agrees with decide3D for every combination of inputs', () => {
    const renderers = [
      'ANGLE (NVIDIA)',
      'Google SwiftShader',
      'llvmpipe (LLVM 15.0.7, 256 bits)',
      'softpipe',
      'Microsoft Basic Render Driver',
    ];
    const cores = [0, 1, MIN_CORES_FOR_3D, MIN_CORES_FOR_3D + 1, 8, 64];
    let cases = 0;
    for (const webgl of [true, false])
      for (const renderer of renderers)
        for (const forced of [null, 'off', 'still', 'animated'])
          for (const assumeGpu of [false, true])
            for (const saveData of [false, true])
              for (const count of cores)
                for (const reduced of [false, true]) {
                  const win = fakeWindow({
                    webgl,
                    renderer,
                    forced,
                    assumeGpu,
                    saveData,
                    cores: count,
                    reduced,
                  });
                  expect(earlyMode(win)).toBe(decide3D(detectCapabilities(win)).mode);
                  cases += 1;
                }
    expect(cases).toBe(2 * renderers.length * 4 * 2 * 2 * cores.length * 2);
  });

  for (const throws of ['storage', 'getContext', 'getParameter'] as const) {
    it(`agrees with decide3D when ${throws} throws`, () => {
      for (const forced of [null, 'off', 'animated']) {
        const win = fakeWindow({ ...base, forced, throws });
        expect(earlyMode(win)).toBe(decide3D(detectCapabilities(win)).mode);
      }
    });
  }
});

describe('earlyRoomScript', () => {
  /** Run the script against a fake page; returns the root's attributes and the page's timers. */
  const run = (options: FakeOptions, started = false) => {
    const attributes = new Map<string, string>();
    const win = fakeWindow(options);
    const listeners: (() => void)[] = [];
    const timers: { fn: () => void; ms: number }[] = [];
    const document = {
      ...win.document,
      documentElement: {
        setAttribute: (k: string, v: string) => attributes.set(k, v),
        removeAttribute: (k: string) => attributes.delete(k),
      },
      querySelector: (selector: string) => (selector === `[${ROOM_START_ATTRIBUTE}]` && started ? {} : null),
    };
    new Function('window', 'document', 'addEventListener', 'setTimeout', earlyRoomScript())(
      win,
      document,
      (type: string, fn: () => void) => type === 'load' && listeners.push(fn),
      (fn: () => void, ms: number) => timers.push({ fn, ms }),
    );
    const load = () => {
      for (const fn of listeners) fn();
      for (const timer of timers) timer.fn();
    };
    return { attributes, load, timers };
  };

  it('is self-contained, so its source can run inline in <head>, and marks the root with the mode', () => {
    expect(earlyRoomScript()).toContain(ROOM_ATTRIBUTE);
    expect(run(base).attributes.get(ROOM_ATTRIBUTE)).toBe('animated');
    expect(run({ ...base, reduced: true }).attributes.get(ROOM_ATTRIBUTE)).toBe('still');
    expect(run({ ...base, webgl: false }).attributes.has(ROOM_ATTRIBUTE)).toBe(false);
  });

  it('falls back to the plain layout when the room script never starts after load', () => {
    const failed = run(base, false);
    failed.load();
    expect(failed.timers[0]?.ms).toBe(ROOM_START_GRACE);
    expect(failed.attributes.has(ROOM_ATTRIBUTE)).toBe(false);
    const started = run(base, true);
    started.load();
    expect(started.attributes.get(ROOM_ATTRIBUTE)).toBe('animated');
  });
});

describe('earlyDecision', () => {
  const root = (value: string | null) => ({ getAttribute: () => value }) as unknown as Element;

  it('reads the mode the head script left on the root', () => {
    expect(earlyDecision(root('animated'))?.mode).toBe('animated');
    expect(earlyDecision(root('still'))?.mode).toBe('still');
  });

  it('is null when the script decided off or never ran', () => {
    expect(earlyDecision(root(null))).toBeNull();
    expect(earlyDecision(root(''))).toBeNull();
  });
});
