import { describe, expect, it } from 'bun:test';

import {
  activeCards,
  cardAt,
  dropX,
  firstDetection,
  linePlan,
  pushers,
  TIMING,
  titleLines,
  wrapTitle,
} from '@/scenes/room/parts/sorting-plan';

describe('linePlan', () => {
  it('puts the camera before the bins, and every bin inside the belt', () => {
    for (const width of [360, 412, 768, 1040]) {
      const plan = linePlan(width, 4, [0, 1, 2, 3]);
      expect(plan.bins).toHaveLength(4);
      expect(plan.cameraX).toBeLessThan(plan.bins[0] ?? Number.NaN);
      for (const x of plan.bins) {
        expect(x + plan.binWidth / 2).toBeLessThanOrEqual(width / 2);
        expect(x - plan.binWidth / 2).toBeGreaterThan(plan.cameraX);
      }
      // Cards fit their bins.
      expect(plan.card.width).toBeLessThan(plan.binWidth);
    }
  });

  it('never feeds the same card again while it is still on the line', () => {
    const plan = linePlan(1040, 2, [1, 0, 1]);
    for (let t = 0; t < 60; t += 0.25) {
      const items = activeCards(plan, t).map((k) => k % plan.targets.length);
      expect(new Set(items).size).toBe(items.length);
    }
  });
});

describe('cardAt', () => {
  const plan = linePlan(1040, 3, [2, 0, 1]);

  it('drops in at the left end, rides at belt speed, and is detected under the camera', () => {
    expect(cardAt(plan, 0, 0).x).toBe(dropX(plan));
    expect(cardAt(plan, 0, 0).scale).toBe(0);
    const later = cardAt(plan, 2, 0);
    expect(later.x).toBeCloseTo(dropX(plan) + 2 * plan.speed);
    expect(later.y).toBe(0);
    const under = cardAt(plan, firstDetection(plan), 0);
    expect(under.x).toBeCloseTo(plan.cameraX);
    expect(under.detected).toBe(true);
    expect(cardAt(plan, firstDetection(plan) + 3, 0).detected).toBe(false);
  });

  it('is pushed toward the viewer into its own bin, then gone', () => {
    const binX = plan.bins[2] ?? 0;
    const arrive = (binX - dropX(plan)) / plan.speed;
    const pushing = cardAt(plan, arrive + TIMING.push * 0.5, 0);
    expect(pushing.x).toBe(binX);
    expect(pushing.z).toBeGreaterThan(0);
    expect(pushing.push).toBeCloseTo(0.5);
    expect(cardAt(plan, arrive + TIMING.push + 0.01, 0).gone).toBe(true);
    // Before its turn, a card is not on the line.
    expect(cardAt(plan, plan.interval - 0.01, 1).gone).toBe(true);
  });

  it('cycles through the targets', () => {
    const k = plan.targets.length;
    const first = cardAt(plan, 3, 0);
    const again = cardAt(plan, 3 + k * plan.interval, k);
    expect(again).toEqual(first);
  });
});

describe('pushers', () => {
  it('extends only the pusher of the bin being filled', () => {
    const plan = linePlan(1040, 3, [1]);
    const arrive = ((plan.bins[1] ?? 0) - dropX(plan)) / plan.speed;
    expect(pushers(plan, arrive - 0.5)).toEqual([0, 0, 0]);
    const mid = pushers(plan, arrive + TIMING.push * 0.5);
    expect(mid[0]).toBe(0);
    expect(mid[1]).toBeGreaterThan(0.9);
    expect(mid[2]).toBe(0);
  });
});

describe('an empty line', () => {
  it('has no cards', () => {
    const plan = linePlan(800, 0, []);
    expect(activeCards(plan, 10)).toEqual([]);
    expect(cardAt(plan, 10, 0).gone).toBe(true);
  });
});

describe('wrapTitle', () => {
  // One character = 1 unit, so widths are character counts.
  const measure = (text: string) => text.length;

  it('keeps a short title on one line', () => {
    expect(wrapTitle('Decklify', 20, 3, measure)).toEqual(['Decklify']);
  });

  it('breaks between words', () => {
    expect(wrapTitle('Real-time crowd violence detection', 16, 3, measure)).toEqual([
      'Real-time crowd',
      'violence',
      'detection',
    ]);
  });

  it('ends the last line with an ellipsis, cutting whole words first', () => {
    expect(wrapTitle('one two three four five six seven', 9, 2, measure)).toEqual(['one two', 'three…']);
  });

  it('breaks a long hyphenated word after its hyphen, without adding a space', () => {
    expect(wrapTitle('Multimodal crisis-detection', 10, 3, measure)).toEqual([
      'Multimodal',
      'crisis-',
      'detection',
    ]);
    expect(wrapTitle('Multimodal crisis-detection model', 10, 3, measure)).toEqual([
      'Multimodal',
      'crisis-',
      'detection…',
    ]);
    // When the hyphen break is where the ellipsis falls, the pieces join without a space.
    expect(wrapTitle('Multimodal crisis-detection', 10, 2, measure)).toEqual(['Multimodal', 'crisis-de…']);
  });

  it('cuts a single word that is still too wide', () => {
    expect(wrapTitle('Supercalifragilistic', 6, 3, measure)).toEqual(['Super…']);
  });

  it('returns nothing for an empty title or no room', () => {
    expect(wrapTitle('   ', 10, 3, measure)).toEqual([]);
    expect(wrapTitle('Decklify', 10, 0, measure)).toEqual([]);
  });
});

describe('titleLines', () => {
  it('counts the lines that fit below the year, at most the maximum', () => {
    // 20 px of room, 7 px text at 1.15 line height: 7, 15.05, 23.1 → two lines fit.
    expect(titleLines(20, 7, 1.15, 3)).toBe(2);
    expect(titleLines(100, 7, 1.15, 3)).toBe(3);
    expect(titleLines(5, 7, 1.15, 3)).toBe(0);
  });
});

describe('linePlan band fit', () => {
  it('shrinks the cards so the line stays inside a short band', () => {
    const tall = linePlan(900, 3, [0, 1, 2], 400);
    const short = linePlan(900, 3, [0, 1, 2], 220);
    expect(short.card.width).toBeLessThan(tall.card.width);
    expect(short.card.width * 1.2).toBeLessThanOrEqual(220 / 2 - 10 + 0.001);
  });

  it('never makes a card wider than its bin, even with six bins on a phone', () => {
    const plan = linePlan(340, 6, [0, 1, 2, 3, 4, 5], 200);
    expect(plan.card.width).toBeLessThan(plan.binWidth);
  });
});
