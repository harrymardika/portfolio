import { describe, expect, it } from 'bun:test';

import {
  cappedPixelRatio,
  clamp,
  createLoop,
  damp,
  decide3D,
  frameDelta,
  MAX_FRAME_DELTA,
  normalizePointer,
  parseCssColor,
  smoothstep,
} from '@/scenes/core';

describe('math', () => {
  it('clamps frame deltas to [0, MAX_FRAME_DELTA]', () => {
    expect(frameDelta(1000, 1016)).toBeCloseTo(0.016);
    expect(frameDelta(1000, 900)).toBe(0); // negative: first frame / clock skew
    expect(frameDelta(0, 10_000)).toBe(MAX_FRAME_DELTA); // background tab
  });

  it('damps toward the target independently of frame rate', () => {
    const oneStep = damp(0, 1, 5, 0.032);
    const twoSteps = damp(damp(0, 1, 5, 0.016), 1, 5, 0.016);
    expect(oneStep).toBeCloseTo(twoSteps, 10);
    expect(damp(0, 1, 5, 0)).toBe(0);
  });

  it('computes smoothstep and clamp', () => {
    expect(smoothstep(0, 1, -1)).toBe(0);
    expect(smoothstep(0, 1, 0.5)).toBe(0.5);
    expect(smoothstep(0, 1, 2)).toBe(1);
    expect(clamp(5, 0, 1)).toBe(1);
  });

  it('caps the pixel ratio and rejects invalid values', () => {
    expect(cappedPixelRatio(3)).toBe(2);
    expect(cappedPixelRatio(1.5)).toBe(1.5);
    expect(cappedPixelRatio(Number.NaN)).toBe(1);
    expect(cappedPixelRatio(0)).toBe(1);
  });
});

describe('decide3D', () => {
  const capable = { webgl: true, reducedMotion: false, saveData: false, hardwareConcurrency: 8 };

  it('animates on capable devices', () => {
    expect(decide3D(capable)).toEqual({ mode: 'animated' });
  });

  it('renders a still frame for reduced motion', () => {
    expect(decide3D({ ...capable, reducedMotion: true })).toEqual({
      mode: 'still',
      reason: 'reduced-motion',
    });
  });

  it('turns 3D off without WebGL, with Save-Data, or on low-power devices', () => {
    expect(decide3D({ ...capable, webgl: false })).toEqual({ mode: 'off', reason: 'no-webgl' });
    expect(decide3D({ ...capable, saveData: true })).toEqual({ mode: 'off', reason: 'save-data' });
    expect(decide3D({ ...capable, hardwareConcurrency: 2 })).toEqual({ mode: 'off', reason: 'low-power' });
  });

  it('treats an unknown core count as capable', () => {
    expect(decide3D({ ...capable, hardwareConcurrency: 0 })).toEqual({ mode: 'animated' });
  });
});

describe('parseCssColor', () => {
  it('parses hex and rgb() colors', () => {
    expect(parseCssColor(' #173D32 ')).toBe(0x173d32);
    expect(parseCssColor('#fff')).toBe(0xffffff);
    expect(parseCssColor('rgb(242, 177, 52)')).toBe(0xf2b134);
    expect(parseCssColor('rgb(242 177 52 / 50%)')).toBe(0xf2b134);
  });

  it('returns null for unsupported values', () => {
    expect(parseCssColor('')).toBeNull();
    expect(parseCssColor('green')).toBeNull();
  });
});

describe('normalizePointer', () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 };

  it('maps the element to -1..1 with 0 at the center', () => {
    expect(normalizePointer(200, 100, rect)).toEqual({ x: 0, y: 0 });
    expect(normalizePointer(100, 50, rect)).toEqual({ x: -1, y: -1 });
    expect(normalizePointer(300, 150, rect)).toEqual({ x: 1, y: 1 });
  });

  it('clamps outside positions and handles empty rects', () => {
    expect(normalizePointer(1000, -1000, rect)).toEqual({ x: 1, y: -1 });
    expect(normalizePointer(10, 10, { left: 0, top: 0, width: 0, height: 0 })).toEqual({ x: 0, y: 0 });
  });
});

describe('createLoop', () => {
  function fakeFrames() {
    const queue = new Map<number, FrameRequestCallback>();
    let next = 1;
    return {
      requestFrame: (cb: FrameRequestCallback) => {
        queue.set(next, cb);
        return next++;
      },
      cancelFrame: (handle: number) => void queue.delete(handle),
      /** Run every pending callback at time `now`. */
      flush(now: number) {
        const pending = [...queue.values()];
        queue.clear();
        pending.forEach((cb) => cb(now));
      },
      get pending() {
        return queue.size;
      },
    };
  }

  it('passes clamped deltas, starting from 0 after each start', () => {
    const frames = fakeFrames();
    const deltas: number[] = [];
    const loop = createLoop({ step: (dt) => deltas.push(dt), ...frames });

    loop.start();
    frames.flush(1000);
    frames.flush(1016);
    frames.flush(5000);
    loop.stop();
    loop.start();
    frames.flush(9000);

    expect(deltas.map((d) => Number(d.toFixed(3)))).toEqual([0, 0.016, 0.05, 0]);
  });

  it('is idempotent for start and stop', () => {
    const frames = fakeFrames();
    const loop = createLoop({ step: () => undefined, ...frames });

    loop.start();
    loop.start();
    expect(frames.pending).toBe(1);
    expect(loop.running).toBe(true);

    loop.stop();
    loop.stop();
    expect(frames.pending).toBe(0);
    expect(loop.running).toBe(false);
  });

  it('reports a throwing frame and keeps running', () => {
    const frames = fakeFrames();
    const errors: unknown[] = [];
    let calls = 0;
    const loop = createLoop({
      step: () => {
        calls += 1;
        if (calls === 1) throw new Error('boom');
      },
      onError: (error) => errors.push(error),
      ...frames,
    });

    loop.start();
    frames.flush(0);
    frames.flush(16);

    expect(errors).toHaveLength(1);
    expect(calls).toBe(2);
    expect(loop.running).toBe(true);
  });
});
