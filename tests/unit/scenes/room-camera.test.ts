import { describe, expect, it } from 'bun:test';

import {
  CAMERA_KEYS,
  fitDistance,
  flowAt,
  FOV,
  keyPosition,
  poseAt,
  poseFor,
  stopsFor,
  trackAt,
  wallColors,
  WIDE_MIN,
  type Sections,
} from '@/scenes/room/camera';

const desktop = { width: 1440, height: 900 };
const phone = { width: 412, height: 860 };

/** The home page's sections on a 900 px screen: hero, journey, projects, messages, contact. */
const H = 900;
const sections: Sections = {
  hero: { top: 73, height: H - 73 },
  journey: { top: H, height: 2.4 * H },
  projects: { top: 3.4 * H, height: 1.2 * H },
  messages: { top: 4.6 * H, height: H },
  contact: { top: 5.6 * H, height: H },
};
const maxScroll = 6.9 * H - H;

describe('fitDistance', () => {
  it('backs off until the width fills the usable part of the screen', () => {
    const d = fitDistance(6, FOV, 16 / 9, 0.5);
    // At that distance the visible width is twice the subject (half the screen is usable).
    const visible = 2 * d * Math.tan((FOV * Math.PI) / 360) * (16 / 9);
    expect(visible * 0.5).toBeCloseTo(6, 6);
  });

  it('is zero for degenerate screens', () => {
    expect(fitDistance(6, FOV, 0, 0.5)).toBe(0);
    expect(fitDistance(6, FOV, 1, 0)).toBe(0);
  });
});

describe('poseFor', () => {
  it('puts the camera along the key direction, never closer than the key distance', () => {
    const pose = poseFor(CAMERA_KEYS.hero, desktop);
    expect(pose.target).toEqual(CAMERA_KEYS.hero.wide.target);
    expect(pose.position.z - pose.target.z).toBeGreaterThanOrEqual(CAMERA_KEYS.hero.distance);
    expect(pose.position.x).toBeCloseTo(pose.target.x, 6);
  });

  it('moves the subject beside the copy on wide screens and above it on phones', () => {
    expect(poseFor(CAMERA_KEYS.journeyStart, desktop).offset.x).toBeLessThan(0);
    const narrow = poseFor(CAMERA_KEYS.journeyStart, phone);
    expect(narrow.offset.x).toBe(0);
    expect(narrow.offset.y).toBeGreaterThan(0);
  });

  it('follows the page layout when told, whatever the canvas width', () => {
    // At 1024 px the canvas is 1009 px wide (scrollbar), but the CSS already lays the page out wide.
    expect(poseFor(CAMERA_KEYS.projects, { width: 1009, height: 768, wide: true }).target).toEqual(
      CAMERA_KEYS.projects.wide.target,
    );
    expect(poseFor(CAMERA_KEYS.projects, { width: 1200, height: 768, wide: false }).target).toEqual(
      CAMERA_KEYS.projects.narrow.target,
    );
  });

  it('switches framing at the wide breakpoint', () => {
    expect(poseFor(CAMERA_KEYS.projects, { width: WIDE_MIN, height: 800 }).target).toEqual(
      CAMERA_KEYS.projects.wide.target,
    );
    expect(poseFor(CAMERA_KEYS.projects, { width: WIDE_MIN - 1, height: 800 }).target).toEqual(
      CAMERA_KEYS.projects.narrow.target,
    );
  });

  it('backs off on a narrow screen so the subject still fits', () => {
    const wide = poseFor(CAMERA_KEYS.projects, desktop);
    const narrow = poseFor(CAMERA_KEYS.projects, phone);
    const distance = (p: typeof wide) =>
      Math.hypot(p.position.x - p.target.x, p.position.y - p.target.y, p.position.z - p.target.z);
    // The phone frames a smaller part of the line, but its tall screen still needs more distance.
    expect(distance(narrow)).toBeGreaterThan(CAMERA_KEYS.projects.distance);
    expect(distance(wide)).toBeGreaterThanOrEqual(CAMERA_KEYS.projects.distance);
  });
});

describe('stopsFor', () => {
  it('reaches every key in page order, at increasing scroll positions within the page', () => {
    const stops = stopsFor(sections, H, maxScroll);
    expect(stops.map((stop) => stop.key)).toEqual([
      'hero',
      'journeyStart',
      'journeyEnd',
      'projects',
      'messages',
      'contact',
    ]);
    expect(stops[0]?.scroll).toBe(0);
    for (let i = 1; i < stops.length; i++)
      expect(stops[i]?.scroll ?? 0).toBeGreaterThan(stops[i - 1]?.scroll ?? 0);
    expect(stops.every((stop) => stop.scroll <= maxScroll)).toBe(true);
  });

  it('travels the journey while its section scrolls by, and stops at the other rooms', () => {
    const stops = stopsFor(sections, H, maxScroll);
    const at = (key: string) => stops.find((stop) => stop.key === key)?.scroll;
    expect(at('journeyStart')).toBe(H - H * 0.25);
    expect(at('journeyEnd')).toBe(H + 2.4 * H - H * 1.05);
    // Taller than the screen: when its top reaches the top. As tall: the same.
    expect(at('projects')).toBe(3.4 * H);
    expect(at('messages')).toBe(4.6 * H);
  });

  it('centres a section shorter than the screen', () => {
    const short = { ...sections, messages: { top: 4.6 * H, height: 0.8 * H } };
    const stop = stopsFor(short, H, maxScroll).find((s) => s.key === 'messages');
    expect(stop?.scroll).toBeCloseTo(4.6 * H - 0.1 * H, 6);
  });

  it('skips missing sections', () => {
    const { projects: _projects, ...rest } = sections;
    expect(stopsFor(rest, H, maxScroll).map((stop) => stop.key)).not.toContain('projects');
  });

  it('keeps positions increasing and reachable when the page ends early', () => {
    const end = 2 * H;
    const stops = stopsFor(sections, H, end);
    for (let i = 1; i < stops.length; i++)
      expect(stops[i]?.scroll ?? 0).toBeGreaterThan(stops[i - 1]?.scroll ?? 0);
    // The last room is reached at the very end of the page, never past it.
    expect(stops[stops.length - 1]?.scroll).toBe(end);
    expect(stops.every((stop) => stop.scroll <= end)).toBe(true);
  });
});

describe('trackAt and poseAt', () => {
  const stops = stopsFor(sections, H, maxScroll);

  it('sits on a key exactly at its stop, and eases in between', () => {
    const start = stops[1]?.scroll ?? 0;
    const end = stops[2]?.scroll ?? 0;
    expect(trackAt(0, stops)).toEqual({ from: 0, to: 1, local: 0 });
    expect(trackAt(start, stops)).toEqual({ from: 1, to: 2, local: 0 });
    const middle = trackAt((start + end) / 2, stops);
    expect(middle.from).toBe(1);
    expect(middle.local).toBeCloseTo(0.5, 6);
    // Smoothstep: slow near the keys.
    expect(trackAt(start + (end - start) * 0.1, stops).local).toBeLessThan(0.1);
  });

  it('holds the last key past the end of the page', () => {
    const last = trackAt(maxScroll * 2, stops);
    expect(last.to).toBe(stops.length - 1);
    expect(last.local).toBe(1);
  });

  it('interpolates the pose between two keys', () => {
    const start = stops[1]?.scroll ?? 0;
    const end = stops[2]?.scroll ?? 0;
    const a = poseFor(CAMERA_KEYS.journeyStart, desktop);
    const b = poseFor(CAMERA_KEYS.journeyEnd, desktop);
    const middle = poseAt(trackAt((start + end) / 2, stops), stops, desktop);
    expect(middle.target.y).toBeCloseTo((a.target.y + b.target.y) / 2, 6);
    expect(poseAt(trackAt(start, stops), stops, desktop).position).toEqual(a.position);
  });

  it('gives the hero pose with no stops at all', () => {
    expect(poseAt(trackAt(100, []), [], desktop)).toEqual(poseFor(CAMERA_KEYS.hero, desktop));
  });
});

describe('keyPosition and flowAt', () => {
  const stops = stopsFor(sections, H, maxScroll);

  it('counts keys in page order, also when a section is missing', () => {
    expect(keyPosition(trackAt(0, stops), stops)).toBe(0);
    const end = stops.find((stop) => stop.key === 'journeyEnd')?.scroll ?? 0;
    expect(keyPosition(trackAt(end, stops), stops)).toBe(2);
    const { projects: _projects, ...rest } = sections;
    const without = stopsFor(rest, H, maxScroll);
    const messages = without.find((stop) => stop.key === 'messages')?.scroll ?? 0;
    expect(keyPosition(trackAt(messages, without), without)).toBe(4);
  });

  it('runs the flow from 0 at the hero to 1 at the contact, in discrete steps', () => {
    expect(flowAt(trackAt(0, stops), stops)).toBe(0);
    expect(flowAt(trackAt(maxScroll, stops), stops)).toBe(1);
    const values = new Set<number>();
    for (let y = 0; y <= maxScroll; y += 7) values.add(flowAt(trackAt(y, stops), stops));
    expect(values.size).toBeLessThanOrEqual(41);
    for (const value of values) expect(Math.round(value * 40)).toBeCloseTo(value * 40, 6);
  });
});

describe('wallColors', () => {
  it('mixes the room tokens along top → mid → bottom', () => {
    expect(wallColors(0).a).toBe('color-mix(in srgb, var(--room-top), var(--room-mid) 0%)');
    expect(wallColors(1).c).toBe('color-mix(in srgb, var(--room-mid), var(--room-bottom) 100%)');
    expect(wallColors(0.5).b).toBe('color-mix(in srgb, var(--room-top), var(--room-mid) 100%)');
  });

  it('never leaves the path at the ends', () => {
    for (const flow of [0, 0.02, 0.98, 1]) {
      for (const color of Object.values(wallColors(flow))) {
        const percent = Number(/(\d+)%\)$/.exec(color)?.[1]);
        expect(percent).toBeGreaterThanOrEqual(0);
        expect(percent).toBeLessThanOrEqual(100);
      }
    }
  });
});
