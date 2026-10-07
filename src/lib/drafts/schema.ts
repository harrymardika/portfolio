/**
 * What the model must return for one case study draft (T8.2, ADR 0013), the JSON Schema sent to the
 * providers, and the checks that run on every answer before it can become a file. The README the
 * model reads is untrusted input, so its answer is treated as untrusted too.
 */
import { z } from 'astro/zod';

const text = (max: number) => z.string().trim().min(1).max(max);
const bilingual = (max: number) => z.strictObject({ en: text(max), id: text(max) });

export const draftSchema = z.strictObject({
  title: text(80),
  summary: bilingual(260),
  role: bilingual(60),
  tags: z.array(text(30)).max(6),
  metrics: z.array(z.strictObject({ value: text(20), label: bilingual(60) })).max(3),
  problem: text(900),
  approach: text(1500),
  result: z.array(text(300)).min(1).max(5),
});

export type Draft = z.infer<typeof draftSchema>;

const bilingualJson = {
  type: 'object',
  properties: { en: { type: 'string' }, id: { type: 'string' } },
  required: ['en', 'id'],
  additionalProperties: false,
} as const;

/** The same shape as JSON Schema, for providers that constrain their output (Groq strict mode). */
export const DRAFT_JSON_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Project name, max 80 characters' },
    summary: { ...bilingualJson, description: 'One or two sentences, max 260 characters each' },
    role: {
      ...bilingualJson,
      description: 'The owner’s role; "Developer" / "Pengembang" if the README does not say',
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      description: 'Up to 6 technologies named in the README',
    },
    metrics: {
      type: 'array',
      description: 'Up to 3 numbers stated in the README; empty if none',
      items: {
        type: 'object',
        properties: { value: { type: 'string' }, label: bilingualJson },
        required: ['value', 'label'],
        additionalProperties: false,
      },
    },
    problem: { type: 'string', description: 'English paragraph' },
    approach: { type: 'string', description: 'English paragraph' },
    result: { type: 'array', items: { type: 'string' }, description: '1 to 5 English bullet points' },
  },
  required: ['title', 'summary', 'role', 'tags', 'metrics', 'problem', 'approach', 'result'],
  additionalProperties: false,
} as const;

function* strings(value: unknown): Generator<string> {
  if (typeof value === 'string') yield value;
  else if (Array.isArray(value)) for (const item of value) yield* strings(item);
  else if (value && typeof value === 'object') for (const item of Object.values(value)) yield* strings(item);
}

/** Bare links to GitHub are allowed (the repository itself); they are removed before the checks below. */
const GITHUB_URL = /https:\/\/github\.com\/[\w.\-/]*/gi;

/**
 * The prompt asks for plain text, so anything Markdown or HTML could turn into markup, a link, or an
 * image is rejected outright rather than filtered: brackets (links, images, references), angle brackets
 * (HTML, autolinks), entities, `//` and `www.` (bare and protocol-relative links), URL schemes, and
 * e-mail addresses (GFM autolinks them). A README could try to smuggle any of these in through the model.
 */
const UNSAFE: [RegExp, string][] = [
  [/[[\]]/, 'contains Markdown link or image syntax'],
  [/[<>]/, 'contains HTML or an autolink'],
  [/&#?\w+;/, 'contains an HTML entity'],
  [/\/\/|\bwww\./i, 'contains a link'],
  [/\b(?:javascript|data|vbscript|file|mailto|tel|ftp|https?):/i, 'contains a URL scheme'],
  [/[\w.+-]+@[\w-]+\.[\w.-]+/, 'contains an e-mail address'],
];

export function unsafeContent(draft: Draft): string[] {
  const problems = new Set<string>();
  for (const value of strings(draft)) {
    const text = value.replace(GITHUB_URL, '');
    for (const [pattern, reason] of UNSAFE) if (pattern.test(text)) problems.add(reason);
  }
  return [...problems];
}

/** Digits of a metric value, e.g. "98.6%" → "98.6"; null when there are none. */
function numberIn(value: string): string | null {
  return /\d+(?:[.,]\d+)?/.exec(value)?.[0]?.replace(',', '.') ?? null;
}

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Keep only metrics whose number appears in the README as a whole number (not inside "v1.99" or
 * "12.5"): models invent plausible figures, and a wrong number on a portfolio is worse than none.
 * Single digits are dropped too; they match too much prose ("step 1") to prove anything.
 */
export function groundMetrics(draft: Draft, readme: string): Draft {
  // Read commas both ways: thousands ("1,600" → 1600) and Indonesian decimals ("0,97" → 0.97).
  const sources = [readme.replace(/(\d),(?=\d{3}\b)/g, '$1'), readme.replace(/(\d),(\d)/g, '$1.$2')];
  const metrics = draft.metrics.filter((metric) => {
    const number = numberIn(metric.value);
    if (!number || number.replace('.', '').length < 2) return false;
    const pattern = new RegExp(`(?<![\\d.])${escapeRegExp(number)}(?![\\d]|\\.\\d)`);
    return sources.some((source) => pattern.test(source));
  });
  return { ...draft, metrics };
}

/**
 * Normalize a model answer before validation: trim lists to their limits (an extra tag should not
 * discard a good draft) and turn line breaks into spaces so text cannot add headings, rules, or
 * break the bullet list; leading Markdown block markers are dropped.
 */
/** Typographic hyphens (U+2010, U+2011) and no-break spaces some models emit, as plain characters. */
function plainCharacters(value: unknown): unknown {
  if (typeof value === 'string') return value.replace(/[\u2010\u2011]/g, '-').replace(/[\u00a0\u202f]/g, ' ');
  if (Array.isArray(value)) return value.map(plainCharacters);
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, plainCharacters(item)]));
  return value;
}

export function normalizeAnswer(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const answer = { ...(plainCharacters(value) as Record<string, unknown>) };
  const flat = (text: unknown): unknown =>
    typeof text === 'string'
      ? text
          .replace(/\s+/g, ' ')
          .trim()
          .replace(/^[#>*+\-=\s]+/, '')
      : text;
  for (const key of ['problem', 'approach']) answer[key] = flat(answer[key]);
  if (Array.isArray(answer['result'])) answer['result'] = answer['result'].slice(0, 5).map(flat);
  if (Array.isArray(answer['tags'])) answer['tags'] = answer['tags'].slice(0, 6);
  if (Array.isArray(answer['metrics'])) answer['metrics'] = answer['metrics'].slice(0, 3);
  return answer;
}
