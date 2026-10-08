/**
 * Browser side of the "Ask Harry" chat (T11.4, ADR 0014): the conversation kept in sessionStorage for
 * one tab, the request body, and how a server response becomes a message. Pure and free of Zod and Node
 * APIs, so the lazily loaded widget stays small.
 */
import type { Locale } from '@/lib/i18n/locales';

export const ASK_URL = '/api/ask';
export const ASK_HEALTH_URL = '/api/ask/health';
/** sessionStorage keys: the conversation, and whether the feature is on (checked once per tab). */
export const CHAT_STORAGE_KEY = 'ask:chat';
export const ENABLED_STORAGE_KEY = 'ask:enabled';
/** Copies of the service's limits (ask.ts, which needs Zod); a unit test keeps them equal. */
export const HISTORY_SENT = 6;
export const QUESTION_MAX = 500;
export const HISTORY_TEXT_MAX = 1_500;
/** Messages kept for the tab; older ones are dropped. */
const MAX_STORED = 20;

export interface ChatLink {
  readonly href: string;
  readonly label: string;
}

/** `answer` comes from the model; `unavailable` and `limit` are the widget's own fallback notes. */
export type ChatMessage =
  | { readonly role: 'visitor'; readonly text: string }
  | {
      readonly role: 'assistant';
      readonly kind: 'answer';
      readonly text: string;
      readonly links: readonly ChatLink[];
    }
  | { readonly role: 'assistant'; readonly kind: 'unavailable' | 'limit' };

export type ReplyOutcome = 'answered' | 'unavailable' | 'limit';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Only same-site paths: never a scheme, a protocol-relative URL, or a backslash trick. */
const isSitePath = (href: unknown): href is string =>
  typeof href === 'string' && /^\/(?![/\\])[^\s]*$/.test(href);

function toLinks(value: unknown): ChatLink[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((link) =>
    isRecord(link) && isSitePath(link['href']) && typeof link['label'] === 'string' && link['label'] !== ''
      ? [{ href: link['href'], label: link['label'] }]
      : [],
  );
}

function toMessage(value: unknown): ChatMessage | null {
  if (!isRecord(value)) return null;
  if (value['role'] === 'visitor' && typeof value['text'] === 'string')
    return { role: 'visitor', text: value['text'] };
  if (value['role'] !== 'assistant') return null;
  if (value['kind'] === 'unavailable' || value['kind'] === 'limit')
    return { role: 'assistant', kind: value['kind'] };
  if (value['kind'] === 'answer' && typeof value['text'] === 'string') {
    return { role: 'assistant', kind: 'answer', text: value['text'], links: toLinks(value['links']) };
  }
  return null;
}

/** The stored conversation, or an empty one when missing or unreadable. */
export function loadChat(stored: string | null): ChatMessage[] {
  if (!stored) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.flatMap((item) => toMessage(item) ?? []).slice(-MAX_STORED) : [];
  } catch {
    return [];
  }
}

export const saveChat = (messages: readonly ChatMessage[]): string =>
  JSON.stringify(messages.slice(-MAX_STORED));

/** The POST body: the question plus the last earlier messages that carry text (fallback notes are skipped). */
export function askBody(messages: readonly ChatMessage[], question: string, lang: Locale): string {
  const history = messages
    .flatMap((message) =>
      message.role === 'visitor'
        ? [{ role: 'visitor', text: message.text }]
        : message.kind === 'answer'
          ? [{ role: 'assistant', text: message.text }]
          : [],
    )
    .slice(-HISTORY_SENT)
    .map((item) => ({ ...item, text: item.text.slice(0, HISTORY_TEXT_MAX) }));
  return JSON.stringify({ question: question.trim().slice(0, QUESTION_MAX), lang, history });
}

/**
 * Turn a response into the assistant's message. Anything other than a well-formed 200 answer (the service
 * off or down, a timeout, a proxy error page) shows the fallback with the CV and email; 429 says so.
 */
export function replyFrom(status: number, body: unknown): { message: ChatMessage; outcome: ReplyOutcome } {
  if (status === 429) return { message: { role: 'assistant', kind: 'limit' }, outcome: 'limit' };
  if (
    status === 200 &&
    isRecord(body) &&
    typeof body['answer'] === 'string' &&
    body['answer'].trim() !== ''
  ) {
    return {
      message: { role: 'assistant', kind: 'answer', text: body['answer'], links: toLinks(body['links']) },
      outcome: 'answered',
    };
  }
  return { message: { role: 'assistant', kind: 'unavailable' }, outcome: 'unavailable' };
}
