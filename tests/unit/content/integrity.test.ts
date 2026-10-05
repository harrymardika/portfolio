/**
 * Validates the real files in `content/` against the schemas, plus cross-file rules
 * Astro cannot express (unique ids, journey references). Runs in milliseconds, so
 * content mistakes are caught by `bun test` before a full build.
 */
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
} from '@/lib/content/schemas';
import { parseYamlList, parseYamlSingleton } from '@/lib/content/yaml';

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
  { file: 'skills.yaml', key: 'groups', schema: skillGroupSchema },
  { file: 'journey.yaml', key: 'milestones', schema: milestoneSchema },
] as const;

function readFrontmatter(path: string): unknown {
  const match = /^---\n([\s\S]*?)\n---/.exec(read(path));
  if (!match?.[1]) throw new Error(`${path} has no frontmatter`);
  return load(match[1]);
}

describe('content files', () => {
  it('profile.yaml matches the schema', () => {
    expectValid(profileSchema, parseYamlSingleton(read('profile.yaml'), 'profile')['profile'], 'profile.yaml');
  });

  for (const { file, key, schema } of LIST_FILES) {
    it(`${file} matches the schema and has unique ids`, () => {
      const items = parseYamlList(read(file), key);
      items.forEach((item, index) => expectValid(schema, item, `${file}[${index}]`));

      const ids = items.map((item) => item['id']);
      expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
    });
  }

  const projectFiles = readdirSync(join(CONTENT_DIR, 'projects')).filter(
    (name) => name.endsWith('.md') && !name.endsWith('.id.md'),
  );

  it('has at least one project', () => {
    expect(projectFiles.length).toBeGreaterThan(0);
  });

  for (const name of projectFiles) {
    it(`projects/${name} frontmatter matches the schema`, () => {
      expectValid(projectSchema, readFrontmatter(`projects/${name}`), `projects/${name}`);
    });
  }

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

  it('contains no phone numbers', () => {
    const files = [
      'profile.yaml',
      ...LIST_FILES.map(({ file }) => file),
      ...projectFiles.map((name) => `projects/${name}`),
    ];
    const phonePattern = /(\+?62|\b08)[\d\s-]{8,}/;
    expect(files.filter((file) => phonePattern.test(read(file)))).toEqual([]);
  });
});
