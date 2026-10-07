/**
 * YAML parsers that turn `content/*.yaml` files into the entry shapes Astro's `file()` loader expects.
 * Pure functions: no file system access, so they are shared by content.config.ts and the unit tests.
 */
import { load } from 'js-yaml';

type Entry = Record<string, unknown>;

function isRecord(value: unknown): value is Entry {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Plain `{}` objects only: a YAML timestamp parses to a Date, which has no own keys but is a value. */
const isPlainObject = (value: unknown): value is Entry =>
  isRecord(value) && Object.getPrototypeOf(value) === Object.prototype;

const isBlank = (value: unknown): boolean =>
  value === null ||
  value === undefined ||
  (typeof value === 'string' && value.trim() === '') ||
  (isPlainObject(value) && Object.keys(value).length === 0);

/**
 * Treat blank values as "not set": the browser editor (Pages CMS, ADR 0011) may save a cleared optional
 * field as `""`, `null`, or `{}`. Removing them lets the strict schemas apply their own defaults and
 * optionality instead of rejecting the file. Arrays keep their length except for blank items.
 */
export function pruneEmpty(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(pruneEmpty).filter((item) => !isBlank(item));
  if (!isPlainObject(value)) return value;
  const entries = Object.entries(value)
    .map(([key, item]) => [key, pruneEmpty(item)] as const)
    .filter(([, item]) => !isBlank(item));
  return Object.fromEntries(entries);
}

export interface ListOptions {
  /**
   * Add `position` (0-based index in the file) to every entry. Astro returns collection entries
   * sorted by id, so collections whose order is meaningful (journey, skills) need it to restore file order.
   */
  readonly withPosition?: boolean;
  /**
   * The list may be empty or missing (`items:` with nothing under it, as an editor saves a cleared list),
   * for files that start empty, such as messages.yaml.
   */
  readonly mayBeEmpty?: boolean;
}

/**
 * Parse a list file such as `experience.yaml` (`items:`) or `journey.yaml` (`milestones:`).
 * Throws with the expected key when the file does not have the documented shape.
 */
export function parseYamlList(
  text: string,
  key: string,
  { withPosition = false, mayBeEmpty = false }: ListOptions = {},
): Entry[] {
  const data = pruneEmpty(load(text));
  const found = isRecord(data) ? data[key] : undefined;
  const list = found === undefined && mayBeEmpty ? [] : found;
  if (!Array.isArray(list) || !list.every(isRecord)) {
    throw new Error(`Expected a top-level "${key}:" list of objects`);
  }
  return withPosition ? list.map((entry, position) => ({ ...entry, position })) : list;
}

/**
 * Parse a single-object file such as `profile.yaml` into one entry keyed by `id`.
 * The keyed-object form keeps `id` out of the entry data, so the schema stays strict.
 */
export function parseYamlSingleton(text: string, id: string): Record<string, Entry> {
  const data = pruneEmpty(load(text));
  if (!isRecord(data)) {
    throw new Error('Expected a YAML object at the top level');
  }
  return { [id]: data };
}
