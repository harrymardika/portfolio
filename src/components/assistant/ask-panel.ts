/**
 * The "Ask Harry" chat panel (T11.4), loaded on the first click of the corner button (AskWidget.astro).
 * A non-modal dialog: Escape or the close button hides it and returns focus to the button. The chat lives in
 * sessionStorage, so it follows the visitor across pages of the same tab. Answers are inserted as text, never
 * as HTML, and links only to site paths (chat.ts).
 */
import {
  ASK_URL,
  askBody,
  CHAT_STORAGE_KEY,
  loadChat,
  replyFrom,
  saveChat,
  type ChatMessage,
  type ReplyOutcome,
} from '@/lib/assistant/chat';
import { isLocale } from '@/lib/i18n/locales';

/** Longer than the service's own 20 s budget, so its fallback answer arrives first. */
const REQUEST_TIMEOUT_MS = 25_000;

interface Panel {
  readonly root: HTMLElement;
  readonly panel: HTMLElement;
  readonly toggle: HTMLButtonElement;
  readonly log: HTMLElement;
  readonly form: HTMLFormElement;
  readonly input: HTMLTextAreaElement;
  readonly send: HTMLButtonElement;
  readonly examples: HTMLElement;
  messages: ChatMessage[];
  busy: boolean;
}

const panels = new WeakMap<HTMLElement, Panel>();

function storage(): Storage | null {
  try {
    return sessionStorage;
  } catch {
    return null;
  }
}

function persist(state: Panel): void {
  try {
    storage()?.setItem(CHAT_STORAGE_KEY, saveChat(state.messages));
  } catch {
    // Storage full or blocked: the chat still works for this page.
  }
}

function element(tag: string, className: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderMessage(state: Panel, message: ChatMessage): HTMLElement {
  const { labelYou = '', labelAssistant = '' } = state.root.dataset;
  const isVisitor = message.role === 'visitor';
  const bubble = element('div', isVisitor ? 'ask-msg ask-msg--visitor' : 'ask-msg ask-msg--assistant');
  bubble.append(element('span', 'sr-only', `${isVisitor ? labelYou : labelAssistant}: `));
  if (message.role === 'visitor' || message.kind === 'answer') {
    bubble.append(element('p', 'whitespace-pre-line', message.text));
  }
  if (message.role === 'assistant' && message.kind === 'answer' && message.links.length > 0) {
    const list = element('ul', 'mt-2 flex flex-wrap gap-x-4 gap-y-1');
    for (const link of message.links) {
      const item = document.createElement('li');
      const anchor = element('a', 'underline underline-offset-4', link.label) as HTMLAnchorElement;
      anchor.href = link.href;
      item.append(anchor);
      list.append(item);
    }
    bubble.append(list);
  }
  if (message.role === 'assistant' && message.kind !== 'answer') {
    for (const selector of [`template[data-ask-note="${message.kind}"]`, 'template[data-ask-note-links]']) {
      const template = state.panel.querySelector<HTMLTemplateElement>(selector);
      if (template) bubble.append(template.content.cloneNode(true));
    }
  }
  return bubble;
}

function append(state: Panel, message: ChatMessage): void {
  state.messages = [...state.messages, message];
  state.log.append(renderMessage(state, message));
  state.examples.hidden = true;
  state.log.scrollTop = state.log.scrollHeight;
  persist(state);
}

function setOpen(state: Panel, open: boolean): void {
  state.panel.hidden = !open;
  state.toggle.setAttribute('aria-expanded', String(open));
  if (open) {
    // On touch screens focusing the textarea would pop the keyboard over the sheet; start at the chat log.
    (matchMedia('(pointer: coarse)').matches ? state.log : state.input).focus();
    state.log.scrollTop = state.log.scrollHeight;
  } else {
    state.toggle.focus();
  }
}

/** Counted by the stats beacon when it is active (StatsBeacon.astro); never the question text. */
function report(outcome: ReplyOutcome): void {
  document.dispatchEvent(new CustomEvent('stats:ask', { detail: outcome }));
}

async function ask(state: Panel, question: string): Promise<void> {
  const text = question.trim();
  if (text === '' || state.busy) return;
  const pageLang = state.root.dataset['lang'] ?? '';
  const lang = isLocale(pageLang) ? pageLang : 'en';
  const body = askBody(state.messages, text, lang);
  state.busy = true;
  state.send.disabled = true;
  state.input.value = '';
  append(state, { role: 'visitor', text });
  const thinking = element('p', 'ask-thinking text-ink-muted', state.root.dataset['thinking'] ?? '');
  state.log.append(thinking);
  let status = 0;
  let payload: unknown = null;
  try {
    const response = await fetch(ASK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    status = response.status;
    payload = await response.json().catch(() => null);
  } catch {
    // Offline, timed out, or the server is down: the fallback below.
  }
  thinking.remove();
  const { message, outcome } = replyFrom(status, payload);
  append(state, message);
  report(outcome);
  state.busy = false;
  state.send.disabled = false;
  state.input.focus();
}

function clear(state: Panel): void {
  state.messages = [];
  for (const node of [...state.log.querySelectorAll('.ask-msg')]) node.remove();
  state.examples.hidden = false;
  persist(state);
  state.input.focus();
}

function init(root: HTMLElement): Panel | null {
  const panel = root.querySelector<HTMLElement>('[data-ask-panel]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-ask-toggle]');
  const log = root.querySelector<HTMLElement>('[data-ask-log]');
  const form = root.querySelector<HTMLFormElement>('[data-ask-form]');
  const input = root.querySelector<HTMLTextAreaElement>('[data-ask-input]');
  const send = root.querySelector<HTMLButtonElement>('[data-ask-send]');
  const examples = root.querySelector<HTMLElement>('[data-ask-examples]');
  if (!panel || !toggle || !log || !form || !input || !send || !examples) return null;
  const state: Panel = { root, panel, toggle, log, form, input, send, examples, messages: [], busy: false };

  for (const message of loadChat(storage()?.getItem(CHAT_STORAGE_KEY) ?? null)) append(state, message);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void ask(state, input.value);
  });
  // Enter sends; Shift+Enter starts a new line.
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-ask-example]')) {
    button.addEventListener('click', () => void ask(state, button.textContent ?? ''));
  }
  root.querySelector('[data-ask-clear]')?.addEventListener('click', () => clear(state));
  root.querySelector('[data-ask-close]')?.addEventListener('click', () => setOpen(state, false));
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(state, false);
  });
  panels.set(root, state);
  return state;
}

/** Open or close the panel; the first call builds it and restores the tab's conversation. */
export function togglePanel(root: HTMLElement): void {
  const state = panels.get(root) ?? init(root);
  if (state) setOpen(state, state.panel.hidden !== false);
}
