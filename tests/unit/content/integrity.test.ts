/**
 * Validates the real files in `content/` against the schemas, plus cross-file rules
 * Astro cannot express (unique ids, journey references). Runs in milliseconds, so
 * content mistakes are caught by `bun test` before a full build.
 */
import { PHONE_PATTERN } from '@/lib/security/contact';
import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { load } from 'js-yaml';

import {
  awardSchema,
  certificationSchema,
  educationSchema,
  experienceSchema,
  milestoneSchema,
  profileSchema,
  projectSchema,
  skillGroupSchema,
  trainingSchema,
  messageSchema,
  cvVariantSchema,
} from '@/lib/content/schemas';
import { hasStrayStrongMarker } from '@/lib/content/emphasis';
import { parseFrontmatter } from '@/lib/content/frontmatter';
import { parseYamlList, parseYamlSingleton, pruneEmpty } from '@/lib/content/yaml';
import { fileSlug } from '@/lib/downloads';
import { githubConfigSchema } from '@/lib/github';

import type { z } from 'astro/zod';

const CONTENT_DIR = join(import.meta.dir, '../../../content');
const read = (path: string): string => readFileSync(join(CONTENT_DIR, path), 'utf8');

/** Parse with a schema and fail with every issue listed as `path: message`. */
function expectValid(schema: z.ZodType, data: unknown, label: string): void {
  const result = schema.safeParse(data);
  const issues = result.success
    ? []
    : result.error.issues.map((issue) => `${label} → ${issue.path.join('.')}: ${issue.message}`);
  expect(issues).toEqual([]);
}

const LIST_FILES = [
  { file: 'experience.yaml', key: 'items', schema: experienceSchema },
  { file: 'education.yaml', key: 'items', schema: educationSchema },
  { file: 'awards.yaml', key: 'items', schema: awardSchema },
  { file: 'trainings.yaml', key: 'items', schema: trainingSchema },
  { file: 'certifications.yaml', key: 'items', schema: certificationSchema },
  { file: 'skills.yaml', key: 'groups', schema: skillGroupSchema, withPosition: true },
  { file: 'journey.yaml', key: 'milestones', schema: milestoneSchema, withPosition: true },
  { file: 'messages.yaml', key: 'items', schema: messageSchema, withPosition: true, mayBeEmpty: true },
  { file: 'cv-variants.yaml', key: 'variants', schema: cvVariantSchema, withPosition: true, mayBeEmpty: true },
  // The e2e fixture (MESSAGES_FILE) must stay valid too, or the e2e build fails.
  {
    file: '../tests/fixtures/messages.yaml',
    key: 'items',
    schema: messageSchema,
    withPosition: true,
    mayBeEmpty: true,
  },
] as const;

function readFrontmatter(path: string): unknown {
  return parseFrontmatter(read(path)).data;
}

describe('content files', () => {
  it('profile.yaml matches the schema', () => {
    expectValid(profileSchema, parseYamlSingleton(read('profile.yaml'), 'profile')['profile'], 'profile.yaml');
  });

  it('github.yaml matches the schema', () => {
    expect(() => githubConfigSchema.parse(pruneEmpty(load(read('github.yaml'))))).not.toThrow();
  });

  for (const entry of LIST_FILES) {
    const { file, key, schema } = entry;
    it(`${file} matches the schema and has unique ids`, () => {
      const items = parseYamlList(read(file), key, {
        withPosition: 'withPosition' in entry,
        mayBeEmpty: 'mayBeEmpty' in entry,
      });
      items.forEach((item, index) => expectValid(schema, item, `${file}[${index}]`));

      const ids = items.map((item) => item['id']);
      expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
    });
  }

  const projectFiles = readdirSync(join(CONTENT_DIR, 'projects')).filter(
    (name) => name.endsWith('.md'),
  );

  it('has at least one project', () => {
    expect(projectFiles.length).toBeGreaterThan(0);
  });

  for (const name of projectFiles) {
    it(`projects/${name} frontmatter matches the schema`, () => {
      expectValid(projectSchema, readFrontmatter(`projects/${name}`), `projects/${name}`);
    });
  }

  it('every CV variant has its own PDF file name', () => {
    const variants = parseYamlList(read('cv-variants.yaml'), 'variants', { mayBeEmpty: true });
    const names = variants.map((variant) => fileSlug((variant['name'] as { en: string }).en));
    expect(names.filter((name, index) => names.indexOf(name) !== index)).toEqual([]);
  });

  it('every CV variant lists existing skill groups', () => {
    const groups = new Set(parseYamlList(read('skills.yaml'), 'groups').map((group) => group['id']));
    const variants = parseYamlList(read('cv-variants.yaml'), 'variants', { mayBeEmpty: true });
    const unknown = variants.flatMap((variant) =>
      ((variant['skills'] as string[] | undefined) ?? [])
        .filter((id) => !groups.has(id))
        .map((id) => `${String(variant['id'])}: ${id}`),
    );
    expect(unknown).toEqual([]);
  });

  it('every journey milestone `ref` points to an existing item', () => {
    const knownIds = new Set(
      ['experience.yaml', 'education.yaml', 'awards.yaml', 'trainings.yaml'].flatMap((file) =>
        parseYamlList(read(file), 'items').map((item) => item['id']),
      ),
    );
    const dangling = parseYamlList(read('journey.yaml'), 'milestones')
      .map((milestone) => milestone['ref'])
      .filter((ref) => ref !== undefined && !knownIds.has(ref));

    expect(dangling).toEqual([]);
  });

  it('pairs every **bold** marker, so no stray asterisks reach the site or the CV', () => {
    const strings = (value: unknown, path: string): [string, string][] =>
      typeof value === 'string'
        ? [[path, value]]
        : Array.isArray(value)
          ? value.flatMap((item, index) => strings(item, `${path}[${index}]`))
          : value && typeof value === 'object'
            ? Object.entries(value).flatMap(([key, item]) => strings(item, `${path}.${key}`))
            : [];
    const files = ['profile.yaml', ...LIST_FILES.map(({ file }) => file)];
    const all = files.flatMap((file) => strings(load(read(file)), file));
    expect(all.filter(([, text]) => hasStrayStrongMarker(text)).map(([path]) => path)).toEqual([]);
    // Only these fields render bold; anywhere else (tagline, titles, journey copy) asterisks would show.
    const renderedBold =
      /^profile\.yaml\.summary\.(en|id)$|^cv-variants\.yaml\.variants\[\d+\]\.summary\.(en|id)$|\.highlights\[\d+\]\.(en|id)$/;
    expect(all.filter(([path, text]) => text.includes('**') && !renderedBold.test(path)).map(([path]) => path)).toEqual([]);
  });

  it('has no text split by an unquoted comma inside { ... }', () => {
    // `{ en: A (b, c) }` parses as the key "c)" with a null value. Blank values are pruned before
    // validation (pruneEmpty, for the browser editor), so the text would be cut silently. Every real
    // key is a plain identifier, so anything else is a broken one-line mapping.
    const files = [
      ...readdirSync(CONTENT_DIR).filter((name) => name.endsWith('.yaml')),
      ...readdirSync(join(CONTENT_DIR, 'projects'))
        .filter((name) => name.endsWith('.md'))
        .map((name) => `projects/${name}`),
      ...readdirSync(join(CONTENT_DIR, 'projects', 'id'))
        .filter((name) => name.endsWith('.md'))
        .map((name) => `projects/id/${name}`),
    ];
    const broken: string[] = [];
    const walk = (node: unknown, path: string): void => {
      if (Array.isArray(node)) node.forEach((item, index) => walk(item, `${path}[${index}]`));
      else if (node !== null && typeof node === 'object') {
        // A text in two languages has only `en`, `id` (and `focus` on highlights); any other key
        // ("coaching", "SQL") is a split.
        if ('en' in node && Object.keys(node).some((key) => !['en', 'id', 'focus'].includes(key)))
          broken.push(`${path}: ${Object.keys(node).join(', ')}`);
        for (const [key, value] of Object.entries(node)) {
          if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) broken.push(`${path}: "${key}"`);
          walk(value, `${path}.${key}`);
        }
      }
    };
    for (const file of files) {
      const data = file.endsWith('.md') ? (parseFrontmatter(read(file)).data as unknown) : load(read(file));
      walk(data, file);
    }
    expect(broken).toEqual([]);
  });

  it('contains no phone numbers', () => {
    const files = [
      'profile.yaml',
      ...LIST_FILES.map(({ file }) => file),
      ...projectFiles.map((name) => `projects/${name}`),
    ];
    // The same rule as the kind-words form and its translations (src/lib/security/contact.ts).
    expect(files.filter((file) => PHONE_PATTERN.test(read(file)))).toEqual([]);
  });
});

describe('journey order', () => {
  it('lists milestones oldest first, as the 3D path expects', () => {
    const years = parseYamlList(read('journey.yaml'), 'milestones').map((m) => Number(m['year']));
    expect([...years].sort((a, b) => a - b)).toEqual(years);
  });
});
