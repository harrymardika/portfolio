#!/usr/bin/env bun
/**
 * Draft case studies for new portfolio repositories with AI and open one pull request each
 * (T8.2, ADR 0013). Runs in .github/workflows/case-study-drafts.yml.
 *   bun run drafts --dry-run     print the drafts, push nothing
 * Env: DRAFT_GEMINI_API_KEY (first choice), DRAFT_GROQ_API_KEY (fallback; ADR 0015), GITHUB_TOKEN (API rate limit; in CI
 *      also used by git and `gh` to push the branch and open the pull request).
 */
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { load } from 'js-yaml';

import { parseFrontmatter } from '../src/lib/content/frontmatter';
import { pruneEmpty } from '../src/lib/content/yaml';
import { draftBranch, gemini, groq, runDrafts, type Provider, type PublishedDraft } from '../src/lib/drafts';
import { fetchPublicRepos, fetchReadme, githubConfigSchema } from '../src/lib/github';

const ROOT = join(import.meta.dir, '..');
const PROJECTS = join(ROOT, 'content/projects');
const DRY_RUN = process.argv.includes('--dry-run');
const env = (name: string): string | undefined => process.env[name] || undefined;

/**
 * Run a command with a minimal environment: the API keys stay in this process, so the content tests
 * (which read model-written files), git, and gh never see them. Only gh gets the GitHub token.
 * Throws with the command's output (never the environment) when it fails.
 */
function sh(command: string[], input?: string): string {
  const env: Record<string, string> = { PATH: process.env['PATH'] ?? '', HOME: process.env['HOME'] ?? '' };
  if (command[0] === 'gh' && process.env['GH_TOKEN']) env['GH_TOKEN'] = process.env['GH_TOKEN'];
  const result = Bun.spawnSync(command, {
    cwd: ROOT,
    env,
    stdin: input === undefined ? 'ignore' : Buffer.from(input),
  });
  if (result.exitCode !== 0) {
    throw new Error(
      `${command.slice(0, 3).join(' ')} failed: ${result.stderr.toString().trim().slice(0, 500)}`,
    );
  }
  return result.stdout.toString();
}

const config = githubConfigSchema.parse(
  pruneEmpty(load(await readFile(join(ROOT, 'content/github.yaml'), 'utf8'))),
);
const token = env('GITHUB_TOKEN');
const providers: Provider[] = [];
const geminiKey = env('DRAFT_GEMINI_API_KEY');
const groqKey = env('DRAFT_GROQ_API_KEY');
if (geminiKey) providers.push(gemini(geminiKey));
if (groqKey) providers.push(groq(groqKey));

function prBody(draft: PublishedDraft): string {
  const dropped = draft.droppedMetrics
    ? `\n> ${draft.droppedMetrics} angka dari jawaban AI dibuang karena tidak tertulis di README.\n`
    : '';
  return `Draf studi kasus otomatis untuk **[${draft.repo.name}](${draft.repo.html_url})**, ditulis oleh ${draft.provider} (\`${draft.model}\`) pada ${draft.date} dari README repo. File: \`content/projects/${draft.slug}.md\` dan terjemahannya \`content/projects/id/${draft.slug}.md\`.
${dropped}
**Merge PR ini = studi kasus langsung tayang** di situs (±20 menit setelah merge). Sebelum merge:

- [ ] Fakta, angka, dan peran sesuai kenyataan (AI hanya membaca README).
- [ ] Ringkasan dan isi bahasa Indonesia terdengar wajar.
- [ ] Tambahkan metrik, gambar, atau tautan demo jika ada (✏️ Edit file di tab *Files changed*).

Belum siap tayang? Biarkan PR ini terbuka dulu. Tutup PR ini tanpa merge jika repo tidak perlu studi kasus; jalankan workflow lagi untuk membuat draf baru setelah branch-nya dihapus. Lihat ADR 0013.`;
}

async function publish(draft: PublishedDraft): Promise<void> {
  const file = join(PROJECTS, `${draft.slug}.md`);
  const fileId = join(PROJECTS, 'id', `${draft.slug}.md`);
  if (DRY_RUN) {
    console.log(`\n===== ${draft.slug}.md (${draft.provider}) =====\n${draft.markdown}`);
    console.log(`\n===== id/${draft.slug}.md =====\n${draft.markdownId}`);
    return;
  }
  const branch = draftBranch(draft.slug);
  sh(['git', 'switch', '--quiet', '-c', branch, 'origin/main']);
  try {
    await writeFile(file, draft.markdown);
    await writeFile(fileId, draft.markdownId);
    // The content checks the build runs: schema, unique ids, no phone numbers.
    sh(['bun', 'test', 'tests/unit/content']);
    sh(['git', 'add', file, fileId]);
    sh([
      'git',
      '-c',
      'user.name=github-actions[bot]',
      '-c',
      'user.email=41898282+github-actions[bot]@users.noreply.github.com',
      'commit',
      '--quiet',
      '-m',
      `content(projects): add an AI draft case study for ${draft.repo.name}`,
    ]);
    sh(['git', 'push', '--quiet', 'origin', branch]);
    let url: string;
    try {
      url = sh(
        [
          'gh',
          'pr',
          'create',
          '--base',
          'main',
          '--head',
          branch,
          '--label',
          'ai-draft',
          '--title',
          `AI draft: case study for ${draft.repo.name}`,
          '--body-file',
          '-',
        ],
        prBody(draft),
      ).trim();
    } catch (error) {
      // A pushed branch without a pull request would make every later run skip this repo.
      sh(['git', 'push', '--quiet', 'origin', '--delete', branch]);
      throw error;
    }
    console.log(`drafts: opened ${url}`);
  } finally {
    // A committed draft lives on its branch; an unfinished one must not linger in main's working tree.
    await rm(file, { force: true });
    await rm(fileId, { force: true });
    sh(['git', 'checkout', '--quiet', '--force', 'main']);
  }
}

if (!DRY_RUN && providers.length > 0) {
  sh(['git', 'fetch', '--quiet', 'origin', 'main']);
  sh([
    'gh',
    'label',
    'create',
    'ai-draft',
    '--color',
    'f2b134',
    '--description',
    'AI-written draft, needs review',
    '--force',
  ]);
}

const summary = await runDrafts(config, providers, {
  listRepos: () => fetchPublicRepos(config.username, { token }),
  readme: (repo) => fetchReadme(config.username, repo.name, { token }),
  existing: async () =>
    Promise.all(
      (await readdir(PROJECTS))
        .filter((name) => name.endsWith('.md'))
        .map(async (name) => {
          const data = parseFrontmatter(await readFile(join(PROJECTS, name), 'utf8')).data as {
            links?: { repo?: string };
          };
          return { slug: name.replace(/\.md$/, ''), repo: data.links?.repo };
        }),
    ),
  draftBranches: async () => {
    try {
      return sh(['git', 'ls-remote', '--heads', 'origin', 'drafts/case-study-*'])
        .split('\n')
        .flatMap((line) => (line.includes('refs/heads/') ? [line.split('refs/heads/')[1] ?? ''] : []));
    } catch (error) {
      console.log(`::warning::drafts: could not list draft branches (${(error as Error).message})`);
      return [];
    }
  },
  publish,
  log: (message) => console.log(message),
  warn: (message) => console.log(`::warning::${message}`),
  today: () => new Date().toISOString().slice(0, 10),
});
if (providers.length === 0) {
  console.log(
    '::warning::drafts: set DRAFT_GEMINI_API_KEY and/or DRAFT_GROQ_API_KEY as repository secrets (ADR 0015)',
  );
}
console.log(`drafts: ${summary.drafted.length} drafted, ${summary.skipped.length} skipped`);
