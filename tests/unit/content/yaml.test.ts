import { describe, expect, it } from 'bun:test';

import { parseYamlList, parseYamlSingleton } from '@/lib/content/yaml';

describe('parseYamlList', () => {
  it('returns the list under the given key', () => {
    expect(parseYamlList('items:\n  - id: a\n  - id: b\n', 'items')).toEqual([{ id: 'a' }, { id: 'b' }]);
  });

  it('explains the expected shape when the key is missing or not a list of objects', () => {
    expect(() => parseYamlList('groups: []\n', 'items')).toThrow('Expected a top-level "items:" list');
    expect(() => parseYamlList('items:\n  - just a string\n', 'items')).toThrow('list of objects');
  });
});

describe('parseYamlSingleton', () => {
  it('keys the object by id without adding an id field', () => {
    expect(parseYamlSingleton('name: Harry\n', 'profile')).toEqual({ profile: { name: 'Harry' } });
  });

  it('rejects a top-level list', () => {
    expect(() => parseYamlSingleton('- a\n', 'profile')).toThrow('Expected a YAML object');
  });
});

describe('parseYamlList withPosition', () => {
  it('records each entry position in file order', () => {
    expect(parseYamlList('items:\n  - id: b\n  - id: a\n', 'items', { withPosition: true })).toEqual([
      { id: 'b', position: 0 },
      { id: 'a', position: 1 },
    ]);
  });
});
