/**
 * HTTP API of the "Kind words" form and its moderation queue (T12.1, ADR 0017), served by the stats
 * service. Nothing sent here is shown on the site: the owner approves a message on a private page, and a
 * workflow turns it into a pull request (D15).
 *   POST /api/messages                  send a message (JSON, or a plain form post → 303 to a page)
 *   GET  /api/messages/pending          owner: messages waiting for a decision
 *   POST /api/messages/:id/approve      owner: approve one
 *   POST /api/messages/:id/reject       owner: reject one (deletes it)
 *   GET  /api/messages/approved         workflow: approved messages waiting for their pull request
 *   POST /api/messages/:id/published    workflow: its pull request is open (deletes it here)
 *   GET  /api/messages/count            workflow: how many are waiting (for the daily notification)
 * Owner and workflow calls need MESSAGES_ADMIN_TOKEN; without it the whole feature is off. Logs hold the
 * outcome only, never the text.
 */
import { randomUUID } from 'node:crypto';

import { localizePath } from '../../src/lib/i18n/routing';
import { checkSubmission, type FieldProblem, type MessageField } from '../../src/lib/messages/submission';
import { clientAddress, isBot, visitorHash } from '../../src/lib/stats/privacy';

import { MESSAGE_ID, type MessagesStore } from './messages-store';
import { bearer, sameToken } from './token';

export interface MessagesOptions {
  readonly store: MessagesStore;
  /** Host of the public site; messages must come from a page on it (Origin header). */
  readonly siteHost: string;
  /** Owner token; when empty the form is closed and the owner endpoints do not exist. */
  readonly adminToken?: string | undefined;
  readonly now?: () => Date;
  readonly perVisitorPerDay?: number;
  readonly maxPending?: number;
  readonly log?: (entry: Readonly<Record<string, unknown>>) => void;
}

/** Room for a full message with accents or emoji sent as a URL-encoded form (each byte becomes %XX). */
export const MAX_MESSAGE_BODY_BYTES = 8_192;

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });

/** A plain form post (no JavaScript) lands on a page that says what happened. */
const redirect = (path: string): Response =>
  new Response(null, { status: 303, headers: { location: path, 'cache-control': 'no-store' } });

function fromSite(origin: string | null, siteHost: string): boolean {
  if (!origin) return false;
  try {
    return new URL(origin).hostname === siteHost;
  } catch {
    return false;
  }
}

type Outcome =
  | { readonly status: 'sent' | 'spam' }
  | { readonly status: 'invalid'; readonly problems: Partial<Record<MessageField, FieldProblem>> }
  | { readonly status: 'limit' | 'full' | 'disabled' | 'forbidden' | 'too-large' | 'malformed' };

const HTTP_STATUS: Readonly<Record<Outcome['status'], number>> = {
  sent: 201,
  spam: 201,
  invalid: 400,
  limit: 429,
  full: 503,
  disabled: 503,
  forbidden: 403,
  'too-large': 413,
  malformed: 400,
};

const succeeded = (outcome: Outcome): boolean => outcome.status === 'sent' || outcome.status === 'spam';

type Body =
  | { readonly kind: 'fields'; readonly fields: Record<string, unknown> }
  | { readonly kind: 'too-large' | 'malformed' };

/** The form's fields from JSON, a URL-encoded post, or multipart. */
async function readBody(request: Request): Promise<Body> {
  if (Number(request.headers.get('content-length') ?? 0) > MAX_MESSAGE_BODY_BYTES)
    return { kind: 'too-large' };
  const type = request.headers.get('content-type') ?? '';
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_MESSAGE_BODY_BYTES) return { kind: 'too-large' };
  try {
    if (type.includes('application/json')) {
      const value: unknown = JSON.parse(text);
      return value && typeof value === 'object' && !Array.isArray(value)
        ? { kind: 'fields', fields: value as Record<string, unknown> }
        : { kind: 'malformed' };
    }
    if (!/application\/x-www-form-urlencoded|multipart\/form-data/.test(type)) return { kind: 'malformed' };
    const form = await new Response(text, { headers: { 'content-type': type } }).formData();
    return {
      kind: 'fields',
      fields: Object.fromEntries([...form.entries()].map(([key, value]) => [key, String(value)])),
    };
  } catch {
    return { kind: 'malformed' };
  }
}

export function createMessagesHandler(options: MessagesOptions): (request: Request) => Promise<Response> {
  const {
    store,
    siteHost,
    adminToken,
    now = () => new Date(),
    perVisitorPerDay = 3,
    maxPending = 100,
  } = options;
  const log = options.log ?? ((entry) => console.log(JSON.stringify(entry)));
  // Per-visitor counts with a random salt per UTC day, in memory only: nothing about a sender is stored.
  let day = { key: '', salt: '', counts: new Map<string, number>() };

  function allow(headers: Headers, at: Date): boolean {
    const key = at.toISOString().slice(0, 10);
    if (day.key !== key) day = { key, salt: randomUUID(), counts: new Map() };
    const visitor = visitorHash(day.salt, clientAddress(headers), '');
    const count = day.counts.get(visitor) ?? 0;
    if (count >= perVisitorPerDay) return false;
    day.counts.set(visitor, count + 1);
    return true;
  }

  async function submit(request: Request): Promise<Response> {
    const { headers } = request;
    const plainForm = !(headers.get('content-type') ?? '').includes('application/json');
    const body = await readBody(request);
    const fields = body.kind === 'fields' ? body.fields : null;
    const lang = fields?.['lang'] === 'id' ? 'id' : 'en';

    const outcome = ((): Outcome => {
      if (!fromSite(headers.get('origin'), siteHost) || isBot(headers.get('user-agent')))
        return { status: 'forbidden' };
      if (!adminToken) return { status: 'disabled' };
      if (!fields) return { status: body.kind === 'too-large' ? 'too-large' : 'malformed' };
      const checked = checkSubmission(fields);
      // A filled honeypot looks like success, so bots learn nothing; only the log tells them apart.
      if (!checked.ok && checked.spam) return { status: 'spam' };
      if (!checked.ok) return { status: 'invalid', problems: checked.problems };
      const at = now();
      store.purge(at);
      if (store.pendingCount() >= maxPending) return { status: 'full' };
      if (!allow(headers, at)) return { status: 'limit' };
      store.add(checked.submission, at);
      return { status: 'sent' };
    })();

    log({ event: 'message', status: outcome.status });
    if (plainForm)
      return redirect(localizePath(succeeded(outcome) ? '/messages/sent/' : '/messages/not-sent/', lang));
    if (succeeded(outcome)) return json({ ok: true }, HTTP_STATUS.sent);
    return json(
      outcome.status === 'invalid'
        ? { error: 'invalid', problems: outcome.problems }
        : { error: outcome.status },
      HTTP_STATUS[outcome.status],
    );
  }

  function owner(request: Request, pathname: string): Response {
    const at = now();
    if (request.method === 'GET') {
      store.purge(at);
      if (pathname === '/api/messages/pending') return json({ messages: store.pending() }, 200);
      if (pathname === '/api/messages/approved') return json({ messages: store.approved() }, 200);
      if (pathname === '/api/messages/count') return json({ pending: store.pendingCount() }, 200);
      return json({ error: 'not-found' }, 404);
    }
    const match = /^\/api\/messages\/([^/]+)\/(approve|reject|published)$/.exec(pathname);
    if (request.method !== 'POST' || !match) return json({ error: 'not-found' }, 404);
    const [, id = '', action] = match;
    if (!MESSAGE_ID.test(id)) return json({ error: 'not-found' }, 404);
    const done =
      action === 'approve'
        ? store.approve(id, at)
        : action === 'reject'
          ? store.reject(id)
          : store.published(id);
    log({ event: 'message', status: action });
    return done ? json({ ok: true }, 200) : json({ error: 'not-found' }, 404);
  }

  return async (request) => {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/messages' && request.method === 'POST') return submit(request);
    // Without a token the owner endpoints do not exist; a wrong token is refused before any lookup.
    if (!adminToken) return json({ error: 'not-found' }, 404);
    if (!sameToken(bearer(request.headers), adminToken)) {
      const refused = json({ error: 'unauthorized' }, 401);
      refused.headers.set('www-authenticate', 'Bearer');
      return refused;
    }
    return owner(request, pathname);
  };
}
