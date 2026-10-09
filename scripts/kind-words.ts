#!/usr/bin/env bun
/**
 * The "Kind words" workflow (T12.4, ADR 0017), run by .github/workflows/kind-words.yml:
 *   bun scripts/kind-words.ts publish   approved messages → translated → added to the one open pull
 *                                       request (branch kind-words/queue) → deleted from the server
 *   bun scripts/kind-words.ts notify    the number of messages waiting → one issue (GitHub e-mails the
 *                                       owner); never their text
 * Env: MESSAGES_ADMIN_TOKEN, SITE_URL (default https://harry.mardika.my.id), DRAFT_GEMINI_API_KEY and/or
 * DRAFT_GROQ_API_KEY (translation), GH_TOKEN (gh). The repository is public: logs and issues show ids and
 * counts only, never a message; the pull request holds only messages the owner already approved.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { failureReason, gemini, groq, parseJson, type Provider } from '../src/lib/ai';
import {
  appendEntry,
  checkTranslation,
  existingIds,
  messageEntry,
  TRANSLATION_JSON_SCHEMA,
  translationPrompt,
  type ApprovedMessage,
  type Translation,
} from '../src/lib/messages';

const ROOT = join(import.meta.dir, '..');
const MESSAGES_FILE = join(ROOT, 'content/messages.yaml');
/**
 * One branch and one open pull request for every approved message: separate pull requests would all
 * append to the end of content/messages.yaml and conflict as soon as one is merged.
 */
const BRANCH = 'kind-words/queue';
/** Each message's commit carries its server id, so a message is never added twice. */
const TRAILER = 'Kind-words-id:';
const MESSAGE_ID = /^[a-f0-9]{16}$/;
/** Keeps each hourly run short; the next run picks up the rest. */
const MAX_PER_RUN = 5;
const PENDING_LABEL = 'kind-words-pending';

const env = (name: string): string | undefined => process.env[name]?.trim() || undefined;
const site = env('SITE_URL') ?? 'https://harry.mardika.my.id';
const token = env('MESSAGES_ADMIN_TOKEN');
const mode = process.argv[2];

/**
 * Run a command with a minimal environment: the keys and the owner token stay in this process; only gh
 * gets the GitHub token. Throws with the command's error output (never the environment).
 */
function sh(command: string[], input?: string): string {
  const childEnv: Record<string, string> = {
    PATH: process.env['PATH'] ?? '',
    HOME: process.env['HOME'] ?? '',
  };
  if (command[0] === 'gh' && process.env['GH_TOKEN']) childEnv['GH_TOKEN'] = process.env['GH_TOKEN'];
  const result = Bun.spawnSync(command, {
    cwd: ROOT,
    env: childEnv,
    stdin: input === undefined ? 'ignore' : Buffer.from(input),
  });
  if (result.exitCode !== 0)
    throw new Error(
      `${command.slice(0, 3).join(' ')} failed: ${result.stderr.toString().trim().slice(0, 500)}`,
    );
  return result.stdout.toString();
}

async function api(path: string, method = 'GET'): Promise<Response> {
  const response = await fetch(new URL(path, site), {
    method,
    headers: { authorization: `Bearer ${token}`, 'user-agent': 'portfolio-kind-words-workflow' },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`${method} ${path} answered HTTP ${response.status}`);
  return response;
}

async function translate(
  providers: readonly Provider[],
  message: ApprovedMessage,
): Promise<Translation | null> {
  for (const provider of providers) {
    try {
      const checked = checkTranslation(
        parseJson(await provider.complete(translationPrompt(message))),
        message,
      );
      if (checked.ok) return checked.translation;
      console.log(`::warning::kind words: ${message.id}: ${provider.name}: ${checked.reason}`);
    } catch (error) {
      console.log(`::warning::kind words: ${message.id}: ${provider.name}: ${failureReason(error)}`);
    }
  }
  return null;
}

const PR_BODY = `Kesan & pesan dari formulir situs yang **sudah Anda setujui** di halaman tinjau. Setiap pesan ada di commit tersendiri; versi bahasa lainnya diterjemahkan AI. Pesan yang disetujui berikutnya ditambahkan ke PR ini selama masih terbuka.

**Merge PR ini = semua pesan di dalamnya langsung tayang** di bagian Kesan & pesan beranda (±20 menit setelah merge). Sebelum merge:

- [ ] Para penulisnya memang orang yang Anda kenal (cek tautan profil bila ada).
- [ ] Terjemahan wajar dan setia pada aslinya (✏️ Edit file di tab *Files changed* bila perlu; hapus entri yang tidak jadi ditayangkan).

Catatan: repo ini publik, jadi isi pesan sudah terbaca di PR ini sejak dibuka, juga bila PR ditutup tanpa merge. Salinan di server dihapus saat pesan masuk ke PR ini. Lihat ADR 0017 dan docs/10 §3.2.`;

/** Only the failing tests' names: the content tests print paths, never the text of a message. */
const failures = (error: unknown): string =>
  String((error as Error).message)
    .split('\n')
    .filter((line) => /\(fail\)|error:/.test(line))
    .slice(0, 5)
    .join(' | ');

/** Was this message already committed to main or to the queue branch? */
function alreadyIn(id: string, refs: readonly string[]): boolean {
  return sh(['git', 'log', '--format=%H', `--grep=${TRAILER} ${id}`, ...refs]).trim() !== '';
}

async function publish(): Promise<void> {
  const { messages } = (await (await api('/api/messages/approved')).json()) as {
    messages: ApprovedMessage[];
  };
  console.log(`kind words: ${messages.length} approved message(s) waiting for the pull request`);
  if (messages.length === 0) return;

  const providers: Provider[] = [];
  const geminiKey = env('DRAFT_GEMINI_API_KEY');
  const groqKey = env('DRAFT_GROQ_API_KEY');
  if (geminiKey) providers.push(gemini(geminiKey));
  if (groqKey)
    providers.push(
      groq(groqKey, { jsonSchema: { name: 'kind_words_translation', schema: TRANSLATION_JSON_SCHEMA } }),
    );
  if (providers.length === 0) throw new Error('set DRAFT_GEMINI_API_KEY and/or DRAFT_GROQ_API_KEY');

  sh([
    'gh',
    'label',
    'create',
    'kind-words',
    '--color',
    '8fc2a8',
    '--description',
    'Approved kind words',
    '--force',
  ]);
  sh(['git', 'fetch', '--quiet', 'origin', 'main']);
  // Decided by the open pull request, not by the branch: a branch without one (a closed pull request, or
  // a run that failed before opening it) starts again from main. Its messages are still on the server,
  // since a message is only deleted there once it is in an open pull request.
  const open = JSON.parse(
    sh(['gh', 'pr', 'list', '--head', BRANCH, '--state', 'open', '--json', 'number,url']),
  ) as { number: number; url: string }[];
  const pr = open[0];
  if (pr) sh(['git', 'fetch', '--quiet', 'origin', `${BRANCH}:refs/remotes/origin/${BRANCH}`]);
  sh(['git', 'checkout', '--quiet', '-B', BRANCH, pr ? `origin/${BRANCH}` : 'origin/main']);

  const done: string[] = [];
  const added: string[] = [];
  let failed = 0;
  try {
    for (const message of messages.slice(0, MAX_PER_RUN)) {
      if (!MESSAGE_ID.test(message.id)) {
        failed += 1;
        console.log('::warning::kind words: skipped a message with an unexpected id');
        continue;
      }
      if (alreadyIn(message.id, ['origin/main', 'HEAD'])) {
        done.push(message.id);
        continue;
      }
      const translation = await translate(providers, message);
      // Without a translation an English message still goes out (the Indonesian page then shows the
      // English text); an Indonesian one waits, since every text needs English.
      if (!translation && message.lang === 'id') {
        failed += 1;
        console.log(`::warning::kind words: ${message.id}: no usable translation; trying again next hour`);
        continue;
      }
      const current = await readFile(MESSAGES_FILE, 'utf8');
      try {
        const entry = messageEntry(message, translation, existingIds(current));
        await writeFile(MESSAGES_FILE, appendEntry(current, entry));
        // The content checks the build runs: schema, unique ids, no phone numbers, no stray asterisks.
        sh(['bun', 'test', 'tests/unit/content']);
      } catch (error) {
        await writeFile(MESSAGES_FILE, current);
        failed += 1;
        console.log(
          `::warning::kind words: ${message.id}: the entry fails the content checks: ${failures(error)}`,
        );
        continue;
      }
      sh(['git', 'add', MESSAGES_FILE]);
      sh([
        'git',
        '-c',
        'user.name=github-actions[bot]',
        '-c',
        'user.email=41898282+github-actions[bot]@users.noreply.github.com',
        'commit',
        '--quiet',
        '-m',
        `content(messages): add kind words from ${message.name}`,
        '-m',
        `${TRAILER} ${message.id}`,
      ]);
      added.push(message.id);
    }

    if (added.length > 0) {
      // A fresh queue replaces a branch left without a pull request.
      sh(['git', 'push', '--quiet', '--force-with-lease', 'origin', BRANCH]);
      if (pr) {
        sh(
          ['gh', 'pr', 'comment', String(pr.number), '--body-file', '-'],
          `${added.length} pesan baru ditambahkan ke PR ini.`,
        );
        console.log(`kind words: added ${added.length} message(s) to ${pr.url}`);
      } else {
        const url = sh(
          [
            'gh',
            'pr',
            'create',
            '--base',
            'main',
            '--head',
            BRANCH,
            '--label',
            'kind-words',
            '--title',
            'Kind words from the site form',
            '--body-file',
            '-',
          ],
          PR_BODY,
        ).trim();
        console.log(`kind words: opened ${url} with ${added.length} message(s)`);
      }
    }
  } finally {
    sh(['git', 'checkout', '--quiet', '--force', 'main']);
  }

  // Only now is every message in an open pull request (or already on main): the server copy can go.
  for (const id of [...done, ...added]) {
    try {
      await api(`/api/messages/${id}/published`, 'POST');
      console.log(`kind words: ${id}: removed from the server`);
    } catch (error) {
      failed += 1;
      console.log(`::warning::kind words: ${id}: ${(error as Error).message}; the next run retries`);
    }
  }
  if (failed > 0) process.exitCode = 1;
}

/** Open, update, or close the one issue that says how many messages wait. GitHub e-mails new issues and comments. */
async function notify(): Promise<void> {
  const { pending } = (await (await api('/api/messages/count')).json()) as { pending: number };
  console.log(`kind words: ${pending} message(s) waiting for review`);
  sh([
    'gh',
    'label',
    'create',
    PENDING_LABEL,
    '--color',
    'f2b134',
    '--description',
    'Kind words waiting',
    '--force',
  ]);
  const open = JSON.parse(
    sh(['gh', 'issue', 'list', '--label', PENDING_LABEL, '--state', 'open', '--json', 'number,title']),
  ) as { number: number; title: string }[];
  const issue = open[0];
  const title = `${pending} kesan & pesan menunggu tinjauan`;
  const review = new URL('/messages/review/', site).href;
  if (pending === 0) {
    if (issue) sh(['gh', 'issue', 'close', String(issue.number), '--comment', 'Semua pesan sudah ditinjau.']);
    return;
  }
  const body = `Ada **${pending}** kesan & pesan dari formulir situs yang menunggu keputusan Anda. Buka ${review} dan masukkan token pemilik (docs/10 §3.2).

Isi pesan sengaja tidak ditulis di sini, karena repo ini publik. Issue ini ditutup otomatis setelah semua pesan ditinjau.`;
  if (!issue) {
    sh(['gh', 'issue', 'create', '--label', PENDING_LABEL, '--title', title, '--body-file', '-'], body);
  } else if (issue.title !== title) {
    // A new comment (not just an edit) so GitHub e-mails the owner about the changed number.
    sh(['gh', 'issue', 'edit', String(issue.number), '--title', title]);
    sh(['gh', 'issue', 'comment', String(issue.number), '--body-file', '-'], body);
  }
}

if (!token) {
  console.log('::warning::kind words: set MESSAGES_ADMIN_TOKEN as a repository secret (docs/10 §3.2)');
} else if (mode === 'publish') {
  await publish();
} else if (mode === 'notify') {
  await notify();
} else {
  console.error('Usage: bun scripts/kind-words.ts publish|notify');
  process.exit(1);
}
