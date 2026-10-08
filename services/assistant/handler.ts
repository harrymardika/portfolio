/**
 * HTTP API of the "Ask Harry" assistant (T11.2, ADR 0014). `createHandler` maps a Request to a Response
 * with injected providers, knowledge, and clock, so it is tested without a server or a real model.
 *   POST /api/ask         one question → { answer, links } or { error }
 *   GET  /api/ask/health  liveness and whether the feature is on
 * Nothing is stored. Logs hold the status, the provider, and failure reasons, never the question or answer.
 */
import { randomUUID } from 'node:crypto';

import {
  askRequestSchema,
  buildAskPrompt,
  checkAnswer,
  createLimiter,
  type Knowledge,
} from '../../src/lib/assistant';
import { failureReason, parseJson, type Provider } from '../../src/lib/ai';
import { clientAddress, isBot, visitorHash } from '../../src/lib/stats/privacy';

/** A provider and the knowledge it gets: Gemini the full version, Groq the compact one. */
export interface Route {
  readonly provider: Provider;
  readonly knowledge: Knowledge;
  /** Earlier chat messages this provider gets (default all, up to 6); Groq gets fewer. */
  readonly maxHistory?: number;
}

export interface AssistantOptions {
  /** Kill switch (ASSISTANT_ENABLED): when false every question gets 503 "disabled". */
  readonly enabled: boolean;
  /** Host of the public site; questions must come from a page on it (Origin header). */
  readonly siteHost: string;
  /** Tried in order until one answer passes the checks. */
  readonly routes: readonly Route[];
  readonly limiter?: ReturnType<typeof createLimiter>;
  readonly now?: () => Date;
  readonly log?: (entry: Readonly<Record<string, unknown>>) => void;
}

export const MAX_BODY_BYTES = 8_192;

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });

function fromSite(origin: string | null, siteHost: string): boolean {
  if (!origin) return false;
  try {
    return new URL(origin).hostname === siteHost;
  } catch {
    return false;
  }
}

async function readJson(request: Request): Promise<unknown> {
  // Refuse a declared oversized body before reading it (server.ts also caps every body at this size).
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return undefined;
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function createHandler(options: AssistantOptions): (request: Request) => Promise<Response> {
  const { enabled, siteHost, routes, limiter = createLimiter(), now = () => new Date() } = options;
  const log = options.log ?? ((entry) => console.log(JSON.stringify(entry)));
  // A random salt per UTC day, in memory only: visitor ids cannot be reversed or joined across days.
  let salt = { day: '', value: '' };
  const saltFor = (at: Date): string => {
    const day = at.toISOString().slice(0, 10);
    if (salt.day !== day) salt = { day, value: randomUUID() };
    return salt.value;
  };

  async function ask(request: Request): Promise<Response> {
    const { headers } = request;
    // Other sites and bots are refused even while the feature is off.
    if (!fromSite(headers.get('origin'), siteHost) || isBot(headers.get('user-agent'))) {
      return json({ error: 'forbidden' }, 403);
    }
    if (!enabled) return json({ error: 'disabled' }, 503);
    const parsed = askRequestSchema.safeParse(await readJson(request));
    if (!parsed.success) return json({ error: 'invalid' }, 400);

    const at = now();
    // Address only: a changed User-Agent must not count as a new visitor for the limits.
    const acquired = limiter(visitorHash(saltFor(at), clientAddress(headers), ''), at);
    if (!acquired.ok) {
      log({ event: 'ask', status: 429, reason: acquired.reason });
      return json({ error: 'limit', reason: acquired.reason }, 429);
    }
    const started = Date.now();
    const failures: string[] = [];
    try {
      for (const { provider, knowledge, maxHistory } of routes) {
        try {
          const raw = parseJson(await provider.complete(buildAskPrompt(knowledge, parsed.data, maxHistory)));
          const checked = checkAnswer(raw, knowledge, parsed.data.lang);
          if (checked.ok) {
            log({ event: 'ask', status: 200, provider: provider.name, ms: Date.now() - started, failures });
            return json(checked.reply, 200);
          }
          failures.push(`${provider.name}: ${checked.reason}`);
        } catch (error) {
          failures.push(`${provider.name}: ${failureReason(error)}`);
        }
      }
      log({ event: 'ask', status: 503, ms: Date.now() - started, failures });
      return json({ error: 'unavailable' }, 503);
    } finally {
      acquired.release();
    }
  }

  return async (request) => {
    const { pathname } = new URL(request.url);
    try {
      if (pathname === '/api/ask' && request.method === 'POST') return await ask(request);
      if (pathname === '/api/ask/health' && request.method === 'GET') return json({ ok: true, enabled }, 200);
      return json({ error: 'not-found' }, 404);
    } catch (error) {
      log({ event: 'error', reason: failureReason(error) });
      return json({ error: 'unavailable' }, 500);
    }
  };
}
