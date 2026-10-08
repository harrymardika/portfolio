/**
 * The assistant's knowledge from the e2e build (T11.1, ADR 0014): it holds exactly the published case
 * studies (no drafts), nothing that looks like a phone number, and its build-time source is not served.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

import { publishedCaseStudies } from './helpers';
import { KNOWLEDGE_FILE, knowledgeSchema, knowledgeText, PHONE_PATTERN } from '../../src/lib/assistant';

// Written by the e2e build (playwright.config.ts); a deployed stack has no such folder.
test.skip(Boolean(process.env['E2E_BASE_URL']), 'Reads the local e2e build output');

const readKnowledge = () =>
  knowledgeSchema.parse(
    JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', 'build-meta-e2e', KNOWLEDGE_FILE), 'utf8')),
  );

test.describe('assistant knowledge', () => {
  test.skip(({ isMobile }) => isMobile, 'The build output does not depend on the viewport');

  test('covers exactly the published case studies, so drafts never reach the chatbot', () => {
    const keys = readKnowledge()
      .sections.map((section) => section.key)
      .filter((key) => key.startsWith('project/'));
    expect(keys.sort()).toEqual(
      publishedCaseStudies()
        .map(({ slug }) => `project/${slug}`)
        .sort(),
    );
  });

  test('contains nothing that looks like a phone number', () => {
    expect(knowledgeText(readKnowledge())).not.toMatch(PHONE_PATTERN);
  });

  test('links only to paths that exist on the site', () => {
    const { paths, sections } = readKnowledge();
    expect(sections.filter((section) => !paths.includes(section.path))).toEqual([]);
  });

  test('is not served by the site', async ({ request }) => {
    expect((await request.get('/assistant-knowledge.json')).status()).toBe(404);
  });
});
