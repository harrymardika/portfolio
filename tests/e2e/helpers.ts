/**
 * Shared e2e settings. Headless Chromium renders WebGL on the CPU (SwiftShader), so 3D scenes can
 * take a while to become ready when the whole suite runs in parallel; real visitors use a GPU.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Page } from '@playwright/test';

import { parseFrontmatter } from '../../src/lib/content/frontmatter';
import { compareProjects, isPublished } from '../../src/lib/content/projects';
import { projectSchema } from '../../src/lib/content/schemas/entities';

export const SCENE_READY_TIMEOUT = 30_000;

/** Make every WebGL context request fail, like a browser or device without WebGL. */
export async function disableWebGL(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...rest: unknown[]
    ) {
      return type.startsWith('webgl') ? null : original.call(this, type as '2d', ...(rest as []));
    } as typeof original;
  });
}

/**
 * Without a GPU the 3D stays off (src/scenes/core/capabilities.ts), and headless Chromium has none.
 * Tests of the 3D behavior treat its CPU renderer as a GPU (localStorage['3d:gpu']), so the rest of
 * the decision (reduced motion, low power) is still the real logic.
 */
export async function assumeGpu(page: Page): Promise<void> {
  await page.addInitScript(() => localStorage.setItem('3d:gpu', '1'));
}

/**
 * The published case studies in the order the site shows them, read from content/projects/ with the
 * site's own rules. Tests derive expectations from this, so publishing a new case study (for example
 * by merging an AI draft, ADR 0013) never breaks the deploy.
 */
export function publishedCaseStudies(): { title: string; featured: boolean }[] {
  const dir = join(import.meta.dirname, '..', '..', 'content', 'projects');
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md') && !name.endsWith('.id.md'))
    .map((name) => projectSchema.parse(parseFrontmatter(readFileSync(join(dir, name), 'utf8')).data))
    .filter(isPublished)
    .sort(compareProjects)
    .map(({ title, featured }) => ({ title, featured }));
}
