import { describe, expect, it } from 'bun:test';

import { checkSubmission } from '@/lib/messages';

const valid = {
  lang: 'en',
  name: 'Rina Wijaya',
  role: 'Data Lead, Example Co',
  relationship: 'My manager at Example Co',
  message: 'Harry turned a messy dataset into a model our team actually used every week.',
  link: 'https://www.linkedin.com/in/rina-wijaya',
  consent: 'on',
};

describe('checkSubmission', () => {
  it('accepts a complete message from a plain form post, with tidy whitespace', () => {
    const result = checkSubmission({
      ...valid,
      name: '  Rina   Wijaya ',
      message: `${valid.message}\r\n\r\n\r\n\nThanks!`,
    });
    expect(result).toEqual({
      ok: true,
      submission: {
        lang: 'en',
        name: 'Rina Wijaya',
        role: 'Data Lead, Example Co',
        relationship: 'My manager at Example Co',
        message: `${valid.message}\n\nThanks!`,
        link: 'https://www.linkedin.com/in/rina-wijaya',
      },
    });
  });

  it('keeps optional fields optional and accepts consent sent as JSON true', () => {
    const result = checkSubmission({ ...valid, role: '', link: '', consent: true, lang: 'id' });
    expect(result.ok && [result.submission.role, result.submission.link, result.submission.lang]).toEqual([
      null,
      null,
      'id',
    ]);
  });

  it('marks a filled honeypot as spam without checking anything else', () => {
    expect(checkSubmission({ hp_field: 'https://spam.example' })).toEqual({ ok: false, spam: true });
  });

  it('reports each problem by field', () => {
    const result = checkSubmission({
      name: 'R',
      relationship: '',
      message: 'x'.repeat(601),
      link: 'http://example.com',
      lang: 'fr',
    });
    expect(result).toEqual({
      ok: false,
      spam: false,
      problems: {
        name: 'too-short',
        relationship: 'required',
        message: 'too-long',
        link: 'link',
        consent: 'consent',
      },
    });
  });

  it('refuses contact details and web addresses in the text, and chat links', () => {
    const problems = (input: Record<string, unknown>) => {
      const result = checkSubmission({ ...valid, ...input });
      return result.ok || result.spam ? null : result.problems;
    };
    expect(problems({ message: 'Great mentor! Call me at 0812 3456 7890 anytime please.' })).toEqual({
      message: 'contact',
    });
    expect(problems({ message: 'Great mentor! Write to rina@example.com for references.' })).toEqual({
      message: 'contact',
    });
    expect(problems({ relationship: 'Client at https://shop.example' })).toEqual({ relationship: 'contact' });
    expect(problems({ name: 'Visit cheap-pills.com' })).toEqual({ name: 'contact' });
    expect(problems({ link: 'https://wa.me/6281234567890' })).toEqual({ link: 'link' });
    expect(problems({ link: 'https://user:pass@linkedin.com/in/x' })).toEqual({ link: 'link' });
    expect(problems({ link: 'javascript:alert(1)' })).toEqual({ link: 'link' });
  });

  it('drops Markdown bold markers, which would show as stray asterisks', () => {
    const result = checkSubmission({ ...valid, message: `**Great** mentor. ${valid.message}` });
    expect(result.ok && result.submission.message).toBe(`Great mentor. ${valid.message}`);
  });

  it('passes ordinary text that only looks like contact details', () => {
    for (const message of [
      'He rebuilt our ASP.NET backend and added Socket.IO events, a joy to work with.',
      'Kami bekerja bersama dari 08-10-2024 sampai 2025, proyeknya bernilai Rp 62 000 000.',
      'Angkatan 62 - 2019 - 2023, dia selalu membantu.Co-founder kami juga setuju.',
      'He taught me a lot.Me and the team still use his notebooks.',
    ]) {
      expect(checkSubmission({ ...valid, message }).ok).toBe(true);
    }
    expect(checkSubmission({ ...valid, role: 'Lead at Socket.IO' }).ok).toBe(true);
  });

  it('catches phone numbers written with dots, brackets, or a country code', () => {
    for (const message of [
      'Great mentor, reach me on 0812.3456.7890 if you need a reference.',
      'Great mentor, reach me on (0812) 3456-7890 if you need a reference.',
      'Great mentor, my number is +62 812 3456 7890 for any questions.',
      'Great mentor, call me at +1 415 555 0100 for a reference.',
      'Great mentor, my number is 62 812 3456 7890 for any questions.',
    ]) {
      const result = checkSubmission({ ...valid, message });
      expect(result.ok || result.spam ? null : result.problems).toEqual({ message: 'contact' });
    }
  });
});
