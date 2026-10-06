/**
 * Keeps the browser editor (.pages.yml, ADR 0011) in step with the content schemas: every content file
 * has an editor entry, and every editor field matches a schema key, at every nesting level.
 */
import { describe, expect, it } from 'bun:test';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { load } from 'js-yaml';

import {
  awardSchema,
  certificationSchema,
  educationSchema,
  experienceSchema,
  homelabSchema,
  milestoneSchema,
  profileSchema,
  projectSchema,
  skillGroupSchema,
  trainingSchema,
} from '@/lib/content/schemas';
import { SLUG, YEAR_MONTH } from '@/lib/content/schemas/primitives';
import { githubConfigSchema } from '@/lib/github';

interface Field {
  name: string;
  type?: string;
  component?: string;
  fields?: Field[];
  required?: boolean;
  list?: boolean | { min?: number };
  default?: unknown;
  pattern?: string | { regex: string };
  options?: { values?: (string | { name: string })[] };
}
interface Entry {
  name: string;
  type: 'file' | 'collection';
  path: string;
  fields: Field[];
}
interface Config {
  components: Record<string, Omit<Field, 'name'>>;
  content: Entry[];
}

const ROOT = join(import.meta.dir, '..', '..');
const config = load(readFileSync(join(ROOT, '.pages.yml'), 'utf8')) as Config;

/** A field with its component definition merged in (field-level keys win, as in Pages CMS). */
function resolve(field: Field): Field {
  if (!field.component) return field;
  const component = config.components[field.component];
  if (!component) throw new Error(`Unknown component "${field.component}" on field "${field.name}"`);
  return { ...component, ...field };
}

interface ZodLike {
  _zod: { def: { type: string; [key: string]: unknown } };
  shape?: Record<string, ZodLike>;
  safeParse(value: unknown): { success: boolean };
}

/** The schema without optional/nullable/default/pipe wrappers (arrays and unions stay). */
function core(schema: ZodLike): ZodLike {
  const def = schema._zod.def;
  if (['optional', 'nullable', 'default', 'prefault'].includes(def.type))
    return core(def['innerType'] as ZodLike);
  if (def.type === 'pipe') return core(def['in'] as ZodLike);
  return schema;
}

/** True for a union of object variants, directly or as the elements of an array. */
function isUnion(schema: ZodLike): boolean {
  const inner = core(schema);
  const element = inner._zod.def.type === 'array' ? core(inner._zod.def['element'] as ZodLike) : inner;
  return element._zod.def.type === 'union';
}

const patternOf = (field: Field): RegExp | null =>
  field.pattern ? new RegExp(typeof field.pattern === 'string' ? field.pattern : field.pattern.regex) : null;

/** Field-level rules that have to agree with the schema, beyond the field name. */
function checkField(path: string, field: Field, schema: ZodLike, variant: boolean): string[] {
  const problems: string[] = [];
  const at = `${path}.${field.name}`;
  const listMin = typeof field.list === 'object' ? (field.list.min ?? 0) : 0;
  const editorRequired = field.required === true || listMin > 0;
  const schemaRequired = !schema.safeParse(undefined).success;
  // Inside a union of object variants (github include) each variant requires different keys; Zod checks those.
  if (!variant && editorRequired !== schemaRequired) {
    problems.push(
      `${at}: editor ${editorRequired ? 'requires' : 'allows leaving out'} a value the schema ${schemaRequired ? 'requires' : 'treats as optional'}`,
    );
  }
  const inner = core(schema);
  const isArray = inner._zod.def.type === 'array';
  if (Boolean(field.list) !== isArray)
    problems.push(`${at}: editor list=${Boolean(field.list)}, schema array=${isArray}`);
  const scalar = isArray ? core(inner._zod.def['element'] as ZodLike) : inner;
  if ((field.type === 'number') !== (scalar._zod.def.type === 'number')) {
    problems.push(`${at}: editor type "${field.type}" vs schema "${scalar._zod.def.type}"`);
  }
  if (field.type === 'select') {
    const values = (field.options?.values ?? []).map((value) =>
      typeof value === 'string' ? value : value.name,
    );
    const entries = Object.keys((scalar._zod.def['entries'] as Record<string, string> | undefined) ?? {});
    if (values.join() !== entries.join())
      problems.push(`${at}: select values [${values}] vs schema enum [${entries}]`);
  }
  // Pages CMS validates a blank optional field ("") against its pattern, so it must match.
  const pattern = patternOf(field);
  if (pattern && !editorRequired && !pattern.test(''))
    problems.push(`${at}: optional field's pattern rejects a blank value`);
  return problems;
}

/** The object shape inside optional/default/array/union/pipe wrappers, or null for scalars. */
function objectShape(schema: ZodLike): Record<string, ZodLike> | null {
  const def = schema._zod.def;
  switch (def.type) {
    case 'object':
      return schema.shape ?? null;
    case 'optional':
    case 'nullable':
    case 'default':
    case 'prefault':
      return objectShape(def['innerType'] as ZodLike);
    case 'array':
      return objectShape(def['element'] as ZodLike);
    case 'pipe':
      return objectShape(def['in'] as ZodLike) ?? objectShape(def['out'] as ZodLike);
    case 'union': {
      // The editor offers one object with the fields of every object variant (e.g. github include).
      const shapes = (def['options'] as ZodLike[]).map(objectShape).filter((shape) => shape !== null);
      return shapes.length > 0 ? Object.assign({}, ...shapes) : null;
    }
    default:
      return null;
  }
}

function shapeOf(schema: unknown): Record<string, ZodLike> {
  const shape = objectShape(schema as ZodLike);
  if (!shape) throw new Error('Expected an object schema');
  return shape;
}

/** Every CMS field name must be a schema key; every schema key must be editable (except `omit`). */
function compare(
  path: string,
  fields: Field[],
  shape: Record<string, ZodLike>,
  omit: string[] = [],
  variant = false,
): string[] {
  const problems: string[] = [];
  const names = fields.map((field) => field.name);
  for (const key of Object.keys(shape)) {
    if (!omit.includes(key) && !names.includes(key))
      problems.push(`${path}: schema key "${key}" has no editor field`);
  }
  for (const raw of fields) {
    const field = resolve(raw);
    const schema = shape[field.name];
    if (!schema) {
      if (!(path === 'projects' && field.name === 'body'))
        problems.push(`${path}: editor field "${field.name}" is not in the schema`);
      continue;
    }
    problems.push(...checkField(path, field, schema, variant));
    const nested = objectShape(schema);
    if (field.type === 'object' && field.fields) {
      if (!nested) problems.push(`${path}.${field.name}: editor has an object, schema has a scalar`);
      else problems.push(...compare(`${path}.${field.name}`, field.fields, nested, [], isUnion(schema)));
    } else if (nested && field.type !== 'object') {
      problems.push(`${path}.${field.name}: schema has an object, editor has "${field.type}"`);
    }
  }
  return problems;
}

const entry = (name: string): Entry => {
  const found = config.content.find((item) => item.name === name);
  if (!found) throw new Error(`.pages.yml has no "${name}" entry`);
  return found;
};

/** For list files, the single top-level list field holds the entries. */
const listFields = (name: string, key: string): Field[] =>
  resolve(entry(name).fields.find((field) => field.name === key) ?? { name: key }).fields ?? [];

describe('.pages.yml', () => {
  it('has an entry for every content file, pointing at files that exist', () => {
    const paths = config.content.map((item) => item.path);
    for (const file of readdirSync(join(ROOT, 'content')).filter((name) => name.endsWith('.yaml'))) {
      expect(paths).toContain(`content/${file}`);
    }
    expect(paths).toContain('content/projects');
    for (const path of paths) expect(existsSync(join(ROOT, path)), path).toBe(true);
  });

  it('matches the content schemas field by field', () => {
    const problems = [
      ...compare('profile', entry('profile').fields, shapeOf(profileSchema)),
      ...compare('homelab', entry('homelab').fields, shapeOf(homelabSchema)),
      ...compare('github', entry('github').fields, shapeOf(githubConfigSchema)),
      ...compare('projects', entry('projects').fields, shapeOf(projectSchema)),
      ...compare('experience', listFields('experience', 'items'), shapeOf(experienceSchema)),
      ...compare('education', listFields('education', 'items'), shapeOf(educationSchema)),
      ...compare('trainings', listFields('trainings', 'items'), shapeOf(trainingSchema)),
      ...compare('awards', listFields('awards', 'items'), shapeOf(awardSchema)),
      ...compare('certifications', listFields('certifications', 'items'), shapeOf(certificationSchema)),
      // `position` is added by the YAML parser from the file order, never edited.
      ...compare('skills', listFields('skills', 'groups'), shapeOf(skillGroupSchema), ['position']),
      ...compare('journey', listFields('journey', 'milestones'), shapeOf(milestoneSchema), ['position']),
    ];
    expect(problems).toEqual([]);
  });

  it('validates dates and identifiers exactly like the schemas', () => {
    const samples = [
      '2025-09',
      '2025-13',
      '2025-1',
      'present',
      'crowd-violence',
      'Crowd',
      'a--b',
      '-a',
      'a1',
      '',
    ];
    const cases: [string, RegExp][] = [
      ['slug', SLUG],
      ['yearMonth', YEAR_MONTH],
      ['endDate', /^(\d{4}-(0[1-9]|1[0-2])|present)$/],
    ];
    for (const [name, regex] of cases) {
      const pattern = patternOf({ name, ...config.components[name] });
      for (const sample of samples)
        expect(pattern?.test(sample), `${name} "${sample}"`).toBe(regex.test(sample));
      const optional = config.components[`optional${name[0]?.toUpperCase()}${name.slice(1)}`];
      if (optional) {
        const blankOk = patternOf({ name, ...optional });
        for (const sample of samples)
          expect(blankOk?.test(sample), `optional ${name} "${sample}"`).toBe(
            sample === '' || regex.test(sample),
          );
      }
    }
  });

  it('only references components that exist', () => {
    const walk = (fields: Field[]): void => {
      for (const field of fields) {
        if (field.component) expect(Object.keys(config.components)).toContain(field.component);
        if (field.fields) walk(field.fields);
      }
    };
    for (const item of config.content) walk(item.fields);
  });
});
