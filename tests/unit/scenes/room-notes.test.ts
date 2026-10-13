import { describe, expect, it } from 'bun:test';

import { MAX_NOTES, notePosition, noteTilt } from '@/scenes/room/parts/notes';

describe('notePosition', () => {
  const all = (count: number) => Array.from({ length: count }, (_, i) => notePosition(i, count));

  it('centres a single note and a single row', () => {
    expect(notePosition(0, 1).x).toBe(0);
    const [a, b] = all(2);
    expect((a?.x ?? 0) + (b?.x ?? 0)).toBe(0);
    expect(a?.y).toBe(b?.y);
  });

  it('stands the bottom row on the floor and stacks rows upward, read top to bottom', () => {
    for (let count = 1; count <= MAX_NOTES; count++) {
      const notes = all(count);
      const lowest = Math.min(...notes.map((note) => note.y));
      // The bottom row's centre is half a note above the floor: nothing sinks into it.
      expect(lowest).toBeGreaterThan(0);
      expect(notes.every((note) => note.y === lowest || note.y > lowest)).toBe(true);
      expect(notes[0]?.y).toBe(Math.max(...notes.map((note) => note.y)));
    }
  });

  it('puts two notes in a row and centres a lone note in the last row', () => {
    const three = all(3);
    expect(three[0]?.y).toBe(three[1]?.y);
    expect(three[2]?.y).toBeLessThan(three[0]?.y ?? 0);
    expect(three[2]?.x).toBe(0);
  });
});

describe('noteTilt', () => {
  it('turns notes only a little, alternating', () => {
    for (let i = 0; i < 8; i++) expect(Math.abs(noteTilt(i))).toBeLessThan(0.05);
    expect(Math.sign(noteTilt(0))).not.toBe(Math.sign(noteTilt(1)));
  });
});
