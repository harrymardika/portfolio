/**
 * Schemas for GitHub sync (Phase 3): the owner's selection file, the subset of the REST API
 * response we use, and the generated cache that the site reads at build time.
 */
import { z } from 'astro/zod';

import { localizedText } from '@/lib/content/schemas/primitives';

const repoName = z.string().trim().min(1);

/**
 * One entry in `include`: a repo name, a repo with a bilingual description,
 * or a group of repos that form one project (shown as a single card; the first repo is the link).
 */
export const includeItemSchema = z.union([
  repoName,
  z.strictObject({ repo: repoName, description: localizedText.optional() }),
  z.strictObject({
    title: z.string().trim().min(1),
    repos: z.array(repoName).min(2, 'A group needs at least two repos; use a single entry otherwise'),
    description: localizedText.optional(),
  }),
]);

/** content/github.yaml */
export const githubConfigSchema = z.strictObject({
  username: z.string().trim().min(1),
  topic: z.string().trim().min(1),
  include: z.array(includeItemSchema).default([]),
  exclude: z.array(z.string().trim().min(1)).default([]),
  include_forks: z.boolean().default(false),
  include_archived: z.boolean().default(false),
});

/** One repository from GET /users/{user}/repos. Extra fields are ignored, not rejected. */
export const apiRepoSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  html_url: z.url(),
  homepage: z.string().nullable().optional(),
  topics: z.array(z.string()).default([]),
  language: z.string().nullable(),
  stargazers_count: z.number().int().min(0),
  fork: z.boolean(),
  archived: z.boolean(),
  private: z.boolean(),
  created_at: z.string(),
  pushed_at: z.string().nullable(),
});

/** A project from GitHub as the site uses it: one repository, or a group of repositories. */
export const githubRepoSchema = z.strictObject({
  /** Unique id: the repository name (the first repo for a group). */
  name: z.string().min(1),
  /** Display title for groups; null shows the repo name. */
  title: z.string().nullable(),
  /** Owner-written description from github.yaml; preferred over the GitHub description. */
  summary: localizedText.nullable(),
  description: z.string().nullable(),
  url: z.url(),
  homepage: z.url().nullable(),
  topics: z.array(z.string()),
  language: z.string().nullable(),
  stars: z.number().int().min(0),
  createdAt: z.string(),
  pushedAt: z.string().nullable(),
  /** Every repository in the project (one entry for a single repo). */
  members: z.array(z.strictObject({ name: z.string(), url: z.url() })).min(1),
});

/** src/data/generated/github.json */
export const githubCacheSchema = z.strictObject({
  generatedAt: z.string(),
  username: z.string(),
  /** Where the data came from; fixture data must never be reused as a fallback for real builds. */
  source: z.enum(['api', 'fixture']).default('api'),
  repos: z.array(githubRepoSchema),
});

export type GithubConfig = z.infer<typeof githubConfigSchema>;
export type IncludeItem = z.infer<typeof includeItemSchema>;
export type ApiRepo = z.infer<typeof apiRepoSchema>;
export type GithubRepo = z.infer<typeof githubRepoSchema>;
export type GithubCache = z.infer<typeof githubCacheSchema>;
