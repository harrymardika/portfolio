import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'bun:test';

import { createHandler } from '../../../services/stats/handler';
import { createMessagesHandler, type MessagesOptions } from '../../../services/stats/messages';
import {
  APPROVED_RETENTION_DAYS,
  MessagesStore,
  RETENTION_DAYS,
} from '../../../services/stats/messages-store';
import { StatsStore } from '../../../services/stats/store';

const TOKEN = 'owner-token-0123456789';
const BROWSER = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140 Safari/537.36';
const body = {
  lang: 'en',
  name: 'Rina Wijaya',
  relationship: 'My manager at Example Co',
  message: 'Harry turned a messy dataset into a model our team actually used every week.',
  consent: true,
};

let store: MessagesStore;
let stats: StatsStore | undefined;
afterEach(() => {
  store?.close();
  stats?.close();
  stats = undefined;
});

function setup(overrides: Partial<MessagesOptions> = {}) {
  store = new MessagesStore();
  const logs: Record<string, unknown>[] = [];
  let clock = new Date('2026-10-09T03:00:00Z');
  const handler = createMessagesHandler({
    store,
    siteHost: 'example.com',
    adminToken: TOKEN,
    now: () => clock,
    log: (entry) => void logs.push({ ...entry }),
    ...overrides,
  });
  return { handler, logs, setClock: (at: string) => (clock = new Date(at)) };
}

const send = (value: unknown, headers: Record<string, string> = {}) =>
  new Request('http://stats/api/messages', {
    method: 'POST',
    headers: {
      origin: 'https://example.com',
      'user-agent': BROWSER,
      'cf-connecting-ip': '203.0.113.7',
      'content-type': 'application/json',
      ...headers,
    },
    body: typeof value === 'string' ? value : JSON.stringify(value),
  });

const owner = (path: string, method = 'GET', token = TOKEN) =>
  new Request(`http://stats${path}`, { method, headers: { authorization: `Bearer ${token}` } });

describe('sending a message', () => {
  it('queues a valid message as pending and logs only the outcome', async () => {
    const { handler, logs } = setup();
    const response = await handler(send(body));
    expect(response.status).toBe(201);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const [message] = store.pending();
    expect(message).toMatchObject({ name: 'Rina Wijaya', role: null, link: null, approvedAt: null });
    expect(message?.id).toMatch(/^[a-f0-9]{16}$/);
    expect(JSON.stringify(logs)).not.toContain('Rina');
    expect(logs).toEqual([{ event: 'message', status: 'sent' }]);
  });

  it('answers a plain form post with a redirect to the page in its language', async () => {
    const { handler } = setup();
    const form = (fields: Record<string, string>) =>
      send(new URLSearchParams(fields).toString(), { 'content-type': 'application/x-www-form-urlencoded' });
    const sent = await handler(form({ ...body, lang: 'id', consent: 'on' }));
    expect([sent.status, sent.headers.get('location')]).toEqual([303, '/id/messages/sent/']);
    const invalid = await handler(form({ ...body, consent: '' }));
    expect([invalid.status, invalid.headers.get('location')]).toEqual([303, '/messages/not-sent/']);
    expect(store.pending()).toHaveLength(1);
  });

  it('pretends a honeypot post succeeded but stores nothing, and logs it as spam', async () => {
    const { handler, logs } = setup();
    const response = await handler(send({ ...body, website: 'https://spam.example' }));
    expect(response.status).toBe(201);
    expect(store.pendingCount()).toBe(0);
    expect(logs).toEqual([{ event: 'message', status: 'spam' }]);
  });

  it('reads multipart posts and answers unreadable bodies as malformed, not too large', async () => {
    const { handler } = setup();
    const form = new FormData();
    for (const [key, value] of Object.entries({ ...body, consent: 'on' })) form.set(key, String(value));
    const multipart = new Request('http://stats/api/messages', {
      method: 'POST',
      headers: { origin: 'https://example.com', 'user-agent': BROWSER, 'cf-connecting-ip': '203.0.113.7' },
      body: form,
    });
    expect([(await handler(multipart)).status, store.pendingCount()]).toEqual([303, 1]);
    expect(await (await handler(send('{not json'))).json()).toEqual({ error: 'malformed' });
    expect((await handler(send('[1,2]'))).status).toBe(400);
    const plain = await handler(send('hello', { 'content-type': 'text/plain' }));
    expect([plain.status, plain.headers.get('location')]).toEqual([303, '/messages/not-sent/']);
  });

  it('does not count invalid posts against the daily limit', async () => {
    const { handler } = setup();
    for (let i = 0; i < 5; i++) await handler(send({ ...body, consent: false }));
    expect((await handler(send(body))).status).toBe(201);
  });

  it('refuses other sites, bots, oversized bodies, and invalid fields', async () => {
    const { handler } = setup();
    expect((await handler(send(body, { origin: 'https://evil.example' }))).status).toBe(403);
    expect((await handler(send(body, { origin: '' }))).status).toBe(403);
    expect((await handler(send(body, { 'user-agent': 'curl/8.0' }))).status).toBe(403);
    expect((await handler(send({ ...body, message: 'x'.repeat(9_000) }))).status).toBe(413);
    expect((await handler(send(body, { 'content-length': '9000' }))).status).toBe(413);
    const invalid = await handler(send({ ...body, message: 'Call me at 0812 3456 7890, a great mentor!' }));
    expect([invalid.status, await invalid.json()]).toEqual([
      400,
      { error: 'invalid', problems: { message: 'contact' } },
    ]);
    expect(store.pendingCount()).toBe(0);
  });

  it('allows three messages per visitor per day and caps the queue', async () => {
    const { handler, setClock } = setup({ maxPending: 4 });
    for (let i = 0; i < 3; i++) expect((await handler(send(body))).status).toBe(201);
    expect((await handler(send(body))).status).toBe(429);
    // Another visitor still gets in, until the queue is full.
    expect((await handler(send(body, { 'cf-connecting-ip': '198.51.100.9' }))).status).toBe(201);
    expect((await handler(send(body, { 'cf-connecting-ip': '198.51.100.10' }))).status).toBe(503);
    // A new day resets the per-visitor count, but the queue is still full.
    setClock('2026-10-10T03:00:00Z');
    expect(await (await handler(send(body))).json()).toEqual({ error: 'full' });
  });

  it('keeps the form closed without an owner token', async () => {
    const { handler } = setup({ adminToken: undefined });
    expect(await (await handler(send(body))).json()).toEqual({ error: 'disabled' });
    expect((await handler(owner('/api/messages/pending'))).status).toBe(404);
  });
});

describe('moderation', () => {
  it('needs the owner token, even for unknown paths', async () => {
    const { handler } = setup();
    const refused = await handler(owner('/api/messages/pending', 'GET', 'wrong'));
    expect([refused.status, refused.headers.get('www-authenticate')]).toEqual([401, 'Bearer']);
    expect((await handler(new Request('http://stats/api/messages/count'))).status).toBe(401);
    expect((await handler(owner('/api/messages/anything', 'GET', 'wrong'))).status).toBe(401);
    expect((await handler(owner('/api/messages/0123456789abcdef/approve', 'POST'))).status).toBe(404);
  });

  it('approves, rejects (deleting), and deletes an approved message once its pull request is open', async () => {
    const { handler } = setup();
    await handler(send(body));
    await handler(send({ ...body, name: 'Budi Santoso' }));
    const pending = (await (await handler(owner('/api/messages/pending'))).json()) as {
      messages: { id: string; name: string }[];
    };
    const [rina, budi] = pending.messages;
    expect(await (await handler(owner('/api/messages/count'))).json()).toEqual({ pending: 2 });

    expect((await handler(owner(`/api/messages/${rina?.id}/approve`, 'POST'))).status).toBe(200);
    expect((await handler(owner(`/api/messages/${rina?.id}/approve`, 'POST'))).status).toBe(404); // only once
    expect((await handler(owner(`/api/messages/${budi?.id}/reject`, 'POST'))).status).toBe(200);
    expect(store.pending()).toEqual([]);

    const approved = (await (await handler(owner('/api/messages/approved'))).json()) as {
      messages: { id: string; approvedAt: string }[];
    };
    expect(approved.messages.map((m) => [m.id, m.approvedAt])).toEqual([
      [String(rina?.id), '2026-10-09T03:00:00.000Z'],
    ]);
    // A pending message cannot be marked published, and an approved one cannot be rejected.
    expect((await handler(owner(`/api/messages/${rina?.id}/reject`, 'POST'))).status).toBe(404);
    expect((await handler(owner(`/api/messages/${rina?.id}/published`, 'POST'))).status).toBe(200);
    expect(store.approved()).toEqual([]);
  });

  it('refuses malformed ids and unknown paths', async () => {
    const { handler } = setup();
    expect((await handler(owner('/api/messages/../stats/approve', 'POST'))).status).toBe(404);
    expect((await handler(owner('/api/messages/ZZZZ/approve', 'POST'))).status).toBe(404);
    expect((await handler(owner('/api/messages/everything'))).status).toBe(404);
  });

  it(`deletes pending messages after ${RETENTION_DAYS} days`, async () => {
    const { handler, setClock } = setup();
    await handler(send(body));
    setClock('2027-01-07T02:59:59Z'); // 89 days, 23 hours later: still there
    expect(await (await handler(owner('/api/messages/count'))).json()).toEqual({ pending: 1 });
    setClock('2027-01-07T03:00:01Z');
    expect(await (await handler(owner('/api/messages/count'))).json()).toEqual({ pending: 0 });
  });

  it(`deletes an approved message after ${APPROVED_RETENTION_DAYS} days if its pull request never opened`, async () => {
    const { handler } = setup();
    await handler(send(body));
    const [first] = store.pending();
    store.approve(first?.id ?? '', new Date('2026-10-09T04:00:00Z'));
    expect(store.purge(new Date('2026-11-08T03:59:59Z'))).toBe(0);
    expect(store.purge(new Date('2026-11-08T04:00:01Z'))).toBe(1);
    expect(store.approved()).toEqual([]);
  });

  it('leaves no readable copy of a deleted message on disk', () => {
    const dir = mkdtempSync(join(tmpdir(), 'messages-'));
    try {
      const disk = new MessagesStore(join(dir, 'messages.sqlite'));
      const id = disk.add(
        { ...body, lang: 'en', role: null, link: null, message: 'SECRETMESSAGEXYZ written for Harry' },
        new Date(),
      );
      expect(disk.reject(id)).toBe(true);
      const files = readdirSync(dir);
      expect(files.filter((file) => file.endsWith('-wal'))).toEqual([]);
      for (const file of files)
        expect(readFileSync(join(dir, file)).includes('SECRETMESSAGEXYZ')).toBe(false);
      disk.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('stats service', () => {
  it('passes /api/messages to the messages handler and leaves the stats paths alone', async () => {
    store = new MessagesStore();
    stats = new StatsStore();
    const messages = createMessagesHandler({
      store,
      siteHost: 'example.com',
      adminToken: TOKEN,
      log: () => {},
    });
    const handler = createHandler({ store: stats, siteHost: 'example.com', messages });
    expect((await handler(send(body))).status).toBe(201);
    expect((await handler(owner('/api/messages/count'))).status).toBe(200);
    expect((await handler(new Request('http://stats/api/stats/health'))).status).toBe(200);
    const without = createHandler({ store: stats, siteHost: 'example.com' });
    expect((await without(send(body))).status).toBe(404);
  });
});
