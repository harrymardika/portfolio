import { describe, expect, it } from 'bun:test';

import { both, lines, optionalDetail, plainMarkdown, withHighlights } from '@/lib/assistant';

describe('both', () => {
  it('keeps the Indonesian text when it differs from English', () => {
    expect(both((locale) => (locale === 'en' ? 'Hello' : 'Halo'))).toEqual({ en: 'Hello', id: 'Halo' });
  });

  it('drops the Indonesian text when it is the same as English', () => {
    expect(both(() => 'Decklify')).toEqual({ en: 'Decklify' });
  });
});

describe('lines', () => {
  it('joins the parts that have text, one per line', () => {
    expect(lines('a', '', false, undefined, 'b')).toBe('a\nb');
  });
});

describe('optionalDetail', () => {
  it('adds a detail that has text', () => {
    expect(optionalDetail({ en: 'More' })).toEqual({ detail: { en: 'More' } });
  });

  it('adds nothing for an empty detail', () => {
    expect(optionalDetail({ en: '' })).toEqual({});
  });
});

describe('withHighlights', () => {
  const head = (locale: 'en' | 'id'): string => (locale === 'en' ? 'Engineer' : 'Insinyur');

  it('keeps the first two highlights in the text and the rest plus the extra line in the detail', () => {
    const result = withHighlights(
      head,
      [{ en: 'One' }, { en: 'Two' }, { en: 'Three', id: 'Tiga' }],
      'Tags: Go',
    );
    expect(result).toEqual({
      text: { en: 'Engineer\n- One\n- Two', id: 'Insinyur\n- One\n- Two' },
      detail: { en: '- Three\nTags: Go', id: '- Tiga\nTags: Go' },
    });
  });

  it('has no detail when everything fits in the text', () => {
    expect(withHighlights(head, [{ en: 'One' }]).detail).toBeUndefined();
  });
});

describe('plainMarkdown', () => {
  it('drops images, HTML, and comments, and removes emphasis markers', () => {
    const markdown = '<!-- note -->\n![Chart](media/a.png)\n\n\n\nGot **92%** <br/>accuracy.';
    expect(plainMarkdown(markdown)).toBe('Got 92% accuracy.');
  });

  it('turns headings into labels, so they never look like a knowledge section header', () => {
    expect(plainMarkdown('## Problem\nSlides take hours.\n### What I learned')).toBe(
      'Problem:\nSlides take hours.\nWhat I learned:',
    );
  });

  it('keeps the text of a link and drops its URL', () => {
    expect(plainMarkdown('See [the demo](https://example.com/demo).')).toBe('See the demo.');
  });
});
