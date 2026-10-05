/**
 * Schemas for GitHub sync (Phase 3): the owner's selection file, the subset of the REST API
 * response we use, and the generated cache that the site reads at build time.
 */
import { z } from 'astro/zod';

/** content/github.yaml */
export const githubConfigSchema = z.strictObject({
  username: z.string().trim().min(1),
  topic: z.string().trim().min(1),
  include: z.array(z.string().trim().min(1)).default([]),
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

/** A repository as the site uses it. */
export const githubRepoSchema = z.strictObject({
  name: z.string().min(1),
  description: z.string().nullable(),
  url: z.url(),
  homepage: z.url().nullable(),
  topics: z.array(z.string()),
  language: z.string().nullable(),
  stars: z.number().int().min(0),
  createdAt: z.string(),
  pushedAt: z.string().nullable(),
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
export type ApiRepo = z.infer<typeof apiRepoSchema>;
export type GithubRepo = z.infer<typeof githubRepoSchema>;
export type GithubCache = z.infer<typeof githubCacheSchema>;
