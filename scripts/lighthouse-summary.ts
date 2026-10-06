#!/usr/bin/env bun
/**
 * Summarize the last `bun run lighthouse` run: median score per page and category, as a table on
 * stdout and, in GitHub Actions, in the job summary plus one annotation per page (annotations are
 * readable without signing in, so a failing run explains itself).
 *   bun run lighthouse:summary
 */
import { appendFile, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const REPORTS = join(import.meta.dir, '..', '.lighthouseci', 'reports');
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'] as const;

interface Report {
  finalDisplayedUrl: string;
  categories: Record<string, { score: number | null }>;
  audits: Record<string, { displayValue?: string }>;
}

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
};

const files = (await readdir(REPORTS).catch(() => [])).filter((file) => file.endsWith('.report.json'));
if (files.length === 0) {
  console.error(`No Lighthouse reports in ${REPORTS}. Run \`bun run lighthouse\` first.`);
  process.exit(1);
}

const byPage = new Map<string, Report[]>();
for (const file of files) {
  const report = JSON.parse(await readFile(join(REPORTS, file), 'utf8')) as Report;
  const path = new URL(report.finalDisplayedUrl).pathname;
  byPage.set(path, [...(byPage.get(path) ?? []), report]);
}

const rows = [...byPage]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, reports]) => {
    const scores = CATEGORIES.map((category) =>
      Math.round(median(reports.map((report) => (report.categories[category]?.score ?? 0) * 100))),
    );
    const tbt = reports.map((report) => report.audits['total-blocking-time']?.displayValue ?? '?').join(', ');
    return { path, scores, runs: reports.length, tbt };
  });

const table = [
  '| Page | Performance | Accessibility | Best practices | SEO | Runs | TBT per run |',
  '|---|---|---|---|---|---|---|',
  ...rows.map((row) => `| \`${row.path}\` | ${row.scores.join(' | ')} | ${row.runs} | ${row.tbt} |`),
].join('\n');
console.log(table);

const summaryFile = process.env['GITHUB_STEP_SUMMARY'];
if (summaryFile) {
  await appendFile(summaryFile, `## Lighthouse (median, mobile)\n\n${table}\n`);
  for (const row of rows) {
    const text = CATEGORIES.map((category, index) => `${category} ${row.scores[index]}`).join(', ');
    console.log(`::notice title=Lighthouse ${row.path}::${text}; TBT ${row.tbt}`);
  }
}
