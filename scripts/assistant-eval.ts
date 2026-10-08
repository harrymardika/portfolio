#!/usr/bin/env bun
/**
 * Evaluate the "Ask Harry" assistant with real models (T11.5, ADR 0014): every case in
 * tests/eval/assistant-cases.yaml goes through the production setup (services/assistant/routes.ts: prompt,
 * provider, answer checks) and is graded (src/lib/assistant/eval.ts). Run by the manual workflow
 * assistant-eval.yml after a build; nothing is stored or sent anywhere except to the two providers.
 *   GEMINI_API_KEY, GROQ_API_KEY   keys (a provider without a key is skipped)
 *   --groq=all|subset|none         Groq answers every case, the cases marked `groq: true` (default), or none
 * Writes assistant-eval-report.md (and the GitHub job summary); exits 1 when a case fails.
 */
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { load } from 'js-yaml';

import { createRoutes, loadKnowledge } from '../services/assistant/routes';
import { failureReason, parseJson } from '../src/lib/ai';
import {
  buildAskPrompt,
  checkAnswer,
  evalCasesSchema,
  evalReport,
  gradeCase,
  type EvalCase,
  type EvalOutcome,
  type EvalRow,
} from '../src/lib/assistant';

import type { Route } from '../services/assistant/handler';

const ROOT = join(import.meta.dir, '..');
const env = (name: string): string | undefined => process.env[name]?.trim() || undefined;
const groqMode =
  /^--groq=(all|subset|none)$/.exec(process.argv.find((arg) => arg.startsWith('--groq=')) ?? '')?.[1] ??
  'subset';

/**
 * Minimum time between the starts of two requests to one provider, within the free tiers: Gemini's requests
 * per minute, and Groq's 8k tokens per minute for a ±5–6k-token question (ADR 0014).
 */
const INTERVAL_MS: Readonly<Record<string, number>> = { Gemini: 7_000, Groq: 62_000 };
const lastStart = new Map<string, number>();
const sleep = (ms: number): Promise<void> => new Promise((done) => setTimeout(done, ms));
async function pace(provider: string): Promise<void> {
  const wait = (lastStart.get(provider) ?? 0) + (INTERVAL_MS[provider] ?? 7_000) - Date.now();
  if (wait > 0) await sleep(wait);
  lastStart.set(provider, Date.now());
}

async function run(route: Route, testCase: EvalCase): Promise<EvalOutcome> {
  const request = { question: testCase.question, lang: testCase.lang, history: testCase.history };
  try {
    const raw = parseJson(
      await route.provider.complete(buildAskPrompt(route.knowledge, request, route.maxHistory)),
    );
    const checked = checkAnswer(raw, route.knowledge, testCase.lang);
    return checked.ok
      ? { status: 'answered', reply: checked.reply }
      : { status: 'rejected', reason: checked.reason };
  } catch (error) {
    return { status: 'error', reason: failureReason(error) };
  }
}

const cases = evalCasesSchema.parse(
  load(await readFile(join(ROOT, 'tests/eval/assistant-cases.yaml'), 'utf8')),
);
const knowledge = loadKnowledge(resolve(ROOT, env('BUILD_META_DIR') ?? 'build-meta'));
const routes = createRoutes({ geminiKey: env('GEMINI_API_KEY'), groqKey: env('GROQ_API_KEY') }, knowledge);
if (routes.length === 0) {
  console.error('Set GEMINI_API_KEY and/or GROQ_API_KEY.');
  process.exit(1);
}

const rows: EvalRow[] = [];
for (const testCase of cases) {
  for (const route of routes) {
    const name = route.provider.name;
    if (name === 'Groq' && (groqMode === 'none' || (groqMode === 'subset' && !testCase.groq))) continue;
    await pace(name);
    const outcome = await run(route, testCase);
    const problems = gradeCase(testCase, outcome);
    rows.push({ testCase, provider: name, outcome, problems });
    console.log(
      `${problems.length === 0 ? 'pass' : 'FAIL'}  ${testCase.id} (${name})${problems.length ? `: ${problems.join('; ')}` : ''}`,
    );
  }
}

const date = new Date().toISOString().slice(0, 10);
const asked = new Set(rows.map((row) => row.testCase.id)).size;
const report = evalReport(rows, `Assistant evaluation, ${date} (${asked} cases, Groq: ${groqMode})`);
await writeFile(join(ROOT, 'assistant-eval-report.md'), report);
const summary = env('GITHUB_STEP_SUMMARY');
if (summary) await appendFile(summary, report);
const failed = rows.filter((row) => row.problems.length > 0).length;
console.log(`\n${rows.length - failed}/${rows.length} passed`);
// Nothing asked (e.g. only a Groq key with --groq=none) is a failed run, not a green one.
process.exit(failed > 0 || rows.length === 0 ? 1 : 0);
