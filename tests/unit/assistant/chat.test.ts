import { describe, expect, it } from 'bun:test';

import { HISTORY_MAX_CHARS, HISTORY_MAX_MESSAGES, QUESTION_MAX_CHARS } from '@/lib/assistant/ask';
import {
  askBody,
  HISTORY_SENT,
  HISTORY_TEXT_MAX,
  loadChat,
  QUESTION_MAX,
  replyFrom,
  saveChat,
  type ChatMessage,
} from '@/lib/assistant/chat';

const answer = (text: string): ChatMessage => ({ role: 'assistant', kind: 'answer', text, links: [] });

describe('loadChat and saveChat', () => {
  it('restores a saved conversation', () => {
    const messages: ChatMessage[] = [
      { role: 'visitor', text: 'Hi' },
      { role: 'assistant', kind: 'answer', text: 'Hello', links: [{ href: '/about/', label: 'About' }] },
      { role: 'assistant', kind: 'limit' },
    ];
    expect(loadChat(saveChat(messages))).toEqual(messages);
  });

  it('starts empty from nothing, broken JSON, or another shape', () => {
    for (const stored of [null, '', '{', '{"a":1}']) expect(loadChat(stored)).toEqual([]);
  });

  it('drops unknown messages and links that leave the site', () => {
    const stored = JSON.stringify([
      { role: 'system', text: 'x' },
      {
        role: 'assistant',
        kind: 'answer',
        text: 'Hi',
        links: [
          { href: 'javascript:alert(1)', label: 'x' },
          { href: '//evil.example/', label: 'x' },
          { href: '/\\evil.example', label: 'x' },
          { href: '/cv/', label: 'CVs' },
        ],
      },
    ]);
    expect(loadChat(stored)).toEqual([
      { role: 'assistant', kind: 'answer', text: 'Hi', links: [{ href: '/cv/', label: 'CVs' }] },
    ]);
  });

  it('keeps only the last 20 messages', () => {
    const many = Array.from({ length: 25 }, (_, i): ChatMessage => ({ role: 'visitor', text: String(i) }));
    const restored = loadChat(saveChat(many));
    expect(restored).toHaveLength(20);
    expect(restored[0]).toEqual({ role: 'visitor', text: '5' });
  });
});

describe('askBody', () => {
  it('sends the trimmed question, the page language, and the last six messages with text', () => {
    const messages: ChatMessage[] = [
      ...Array.from({ length: 4 }, (_, i): ChatMessage => ({ role: 'visitor', text: `q${i}` })),
      { role: 'assistant', kind: 'unavailable' },
      answer('a1'),
      { role: 'visitor', text: 'q4' },
      answer('a2'),
    ];
    expect(JSON.parse(askBody(messages, '  Next?  ', 'id'))).toEqual({
      question: 'Next?',
      lang: 'id',
      history: [
        { role: 'visitor', text: 'q1' },
        { role: 'visitor', text: 'q2' },
        { role: 'visitor', text: 'q3' },
        { role: 'assistant', text: 'a1' },
        { role: 'visitor', text: 'q4' },
        { role: 'assistant', text: 'a2' },
      ],
    });
  });

  it('cuts a question to 500 characters', () => {
    expect((JSON.parse(askBody([], 'x'.repeat(600), 'en')) as { question: string }).question).toHaveLength(
      500,
    );
  });
});

describe('replyFrom', () => {
  it('turns a 200 answer into a message with safe links', () => {
    const body = {
      answer: 'Harry builds AI products.',
      links: [{ href: '/about/', label: 'About' }, { href: 'https://x' }],
    };
    expect(replyFrom(200, body)).toEqual({
      message: {
        role: 'assistant',
        kind: 'answer',
        text: 'Harry builds AI products.',
        links: [{ href: '/about/', label: 'About' }],
      },
      outcome: 'answered',
    });
  });

  it('shows the limit note for 429', () => {
    expect(replyFrom(429, { error: 'limit' })).toEqual({
      message: { role: 'assistant', kind: 'limit' },
      outcome: 'limit',
    });
  });

  it('falls back for anything else: off, down, a proxy error page, or a timeout', () => {
    for (const [status, body] of [
      [503, { error: 'disabled' }],
      [502, null],
      [200, { answer: '' }],
      [0, null],
    ] as const) {
      expect(replyFrom(status, body).outcome).toBe('unavailable');
    }
  });
});

describe('limits', () => {
  it('match the service, so the widget never sends what the service rejects', () => {
    expect([HISTORY_SENT, QUESTION_MAX, HISTORY_TEXT_MAX]).toEqual([
      HISTORY_MAX_MESSAGES,
      QUESTION_MAX_CHARS,
      HISTORY_MAX_CHARS,
    ]);
  });
});
