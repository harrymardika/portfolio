/**
 * A "Kind words" message sent through the form (T12.1, ADR 0017): checks shared by the stats service and
 * the form page. Nothing here is shown on the site until the owner approves it (D15). Pure.
 */
import { LOCALES, type Locale } from '@/lib/i18n/locales';

export const MESSAGE_LIMITS = {
  name: { min: 2, max: 80 },
  role: { min: 0, max: 120 },
  relationship: { min: 3, max: 120 },
  message: { min: 20, max: 600 },
  link: { min: 0, max: 200 },
} as const;

export type MessageField = keyof typeof MESSAGE_LIMITS | 'consent';
export type FieldProblem = 'required' | 'too-short' | 'too-long' | 'contact' | 'link' | 'consent';

export interface Submission {
  readonly lang: Locale;
  readonly name: string;
  readonly role: string | null;
  readonly relationship: string;
  readonly message: string;
  /** A public profile (https), or null. */
  readonly link: string | null;
}

export type SubmissionCheck =
  | { readonly ok: true; readonly submission: Submission }
  /** A filled honeypot: the caller pretends success so bots learn nothing. */
  | { readonly ok: false; readonly spam: true }
  | {
      readonly ok: false;
      readonly spam: false;
      readonly problems: Partial<Record<MessageField, FieldProblem>>;
    };

/**
 * Contact details and web addresses belong nowhere in the text: no phone, e-mail, or URL. Phone numbers
 * count digits only, so dates ("08-10-2024") and amounts ("Rp 62 000 000") pass while "0812.3456.7890",
 * "(0812) 3456-7890", and "+1 415 555 0100" do not. Domain endings are matched in lower case only, so
 * names such as ASP.NET or Socket.IO are not taken for addresses. The owner still reads every message.
 */
const PHONE_PATTERN = /(?:\+?\b62|\b0)8(?:[\s.\-()]*\d){7,}|\+\d(?:[\s.\-()]*\d){7,}/;
const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;
const URL_PATTERN = /https?:\/\/|www\.|\b[A-Za-z0-9-]+\.(?:com|net|org|io|id|co|me|app|dev|xyz)\b/;
/** Chat links are contact details too, even over https. */
const CHAT_HOSTS = /(^|\.)(wa\.me|whatsapp\.com|t\.me|telegram\.me|line\.me)$/i;

const text = (value: unknown): string =>
  typeof value === 'string' ? value.normalize('NFC').replace(/\s+/g, ' ').trim() : '';

/** The message keeps its line breaks (at most one blank line in a row). */
const paragraph = (value: unknown): string =>
  typeof value === 'string'
    ? value
        .normalize('NFC')
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map((line) => line.replace(/[ \t]+/g, ' ').trim())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    : '';

function lengthProblem(field: keyof typeof MESSAGE_LIMITS, value: string): FieldProblem | null {
  const { min, max } = MESSAGE_LIMITS[field];
  if (value.length === 0) return min > 0 ? 'required' : null;
  if (value.length < min) return 'too-short';
  if (value.length > max) return 'too-long';
  return null;
}

function linkProblem(value: string): FieldProblem | null {
  if (value === '') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || CHAT_HOSTS.test(url.hostname))
      return 'link';
    return null;
  } catch {
    return 'link';
  }
}

/**
 * Check a submission from JSON or a plain form post (field values as strings, the consent box as "on").
 * The honeypot field `hp_field` is hidden from people (a name autofill does not recognise); anything in
 * it marks the post as spam.
 */
export function checkSubmission(input: Readonly<Record<string, unknown>>): SubmissionCheck {
  if (text(input['hp_field']) !== '') return { ok: false, spam: true };
  const lang = LOCALES.find((locale) => locale === input['lang']) ?? 'en';
  const fields = {
    name: text(input['name']),
    role: text(input['role']),
    relationship: text(input['relationship']),
    message: paragraph(input['message']),
    link: text(input['link']),
  };
  const problems: Partial<Record<MessageField, FieldProblem>> = {};
  for (const field of Object.keys(fields) as (keyof typeof fields)[]) {
    const problem = lengthProblem(field, fields[field]);
    if (problem) problems[field] = problem;
  }
  for (const field of ['name', 'role', 'relationship', 'message'] as const) {
    const value = fields[field];
    if (
      !problems[field] &&
      (PHONE_PATTERN.test(value) || EMAIL_PATTERN.test(value) || URL_PATTERN.test(value))
    )
      problems[field] = 'contact';
  }
  const link = problems.link ?? linkProblem(fields.link);
  if (link) problems.link = link;
  const consent = input['consent'];
  if (consent !== true && consent !== 'on' && consent !== 'true') problems.consent = 'consent';

  if (Object.keys(problems).length > 0) return { ok: false, spam: false, problems };
  return {
    ok: true,
    submission: {
      lang,
      name: fields.name,
      role: fields.role || null,
      relationship: fields.relationship,
      message: fields.message,
      link: fields.link || null,
    },
  };
}
