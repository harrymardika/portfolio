/**
 * YAML parsers that turn `content/*.yaml` files into the entry shapes Astro's `file()` loader expects.
 * Pure functions: no file system access, so they are shared by content.config.ts and the unit tests.
 */
import { load } from 'js-yaml';

type Entry = Record<string, unknown>;

function isRecord(value: unknown): value is Entry {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Parse a list file such as `experience.yaml` (`items:`) or `journey.yaml` (`milestones:`).
 * Throws with the expected key when the file does not have the documented shape.
 */
export function parseYamlList(text: string, key: string): Entry[] {
  const data: unknown = load(text);
  const list = isRecord(data) ? data[key] : undefined;
  if (!Array.isArray(list) || !list.every(isRecord)) {
    throw new Error(`Expected a top-level "${key}:" list of objects`);
  }
  return list;
}

/**
 * Parse a single-object file such as `profile.yaml` into one entry keyed by `id`.
 * The keyed-object form keeps `id` out of the entry data, so the schema stays strict.
 */
export function parseYamlSingleton(text: string, id: string): Record<string, Entry> {
  const data: unknown = load(text);
  if (!isRecord(data)) {
    throw new Error('Expected a YAML object at the top level');
  }
  return { [id]: data };
}
