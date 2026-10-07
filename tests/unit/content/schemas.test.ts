import { describe, expect, it } from 'bun:test';

import {
  certificationSchema,
  endDate,
  experienceSchema,
  isValidRange,
  localizedText,
  slug,
  messageSchema,
  yearMonth,
  yearOrYearMonth,
} from '@/lib/content/schemas';

describe('localizedText', () => {
  it('accepts English only, with Indonesian optional', () => {
    expect(localizedText.safeParse({ en: 'Founder' }).success).toBe(true);
    expect(localizedText.safeParse({ en: 'Founder', id: 'Pendiri' }).success).toBe(true);
  });

  it('rejects missing or blank English text', () => {
    expect(localizedText.safeParse({ id: 'Pendiri' }).success).toBe(false);
    expect(localizedText.safeParse({ en: '   ' }).success).toBe(false);
  });

  it('rejects unknown language keys so typos are caught', () => {
    expect(localizedText.safeParse({ en: 'Founder', ind: 'Pendiri' }).success).toBe(false);
  });
});

describe('dates', () => {
  it('accepts YYYY-MM months only', () => {
    expect(yearMonth.safeParse('2025-09').success).toBe(true);
    expect(yearMonth.safeParse('2025-13').success).toBe(false);
    expect(yearMonth.safeParse('2025-9').success).toBe(false);
    expect(yearMonth.safeParse('Sep 2025').success).toBe(false);
  });

  it('accepts "present" as an end date', () => {
    expect(endDate.safeParse('present').success).toBe(true);
    expect(endDate.safeParse('now').success).toBe(false);
  });

  it('normalizes a bare year to a string', () => {
    expect(yearOrYearMonth.parse(2025)).toBe('2025');
    expect(yearOrYearMonth.parse('2025-04')).toBe('2025-04');
  });

  it('treats ranges ending before they start as invalid', () => {
    expect(isValidRange('2025-01', '2025-01')).toBe(true);
    expect(isValidRange('2025-01', 'present')).toBe(true);
    expect(isValidRange('2025-02', '2025-01')).toBe(false);
  });
});

describe('slug', () => {
  it('accepts lowercase kebab-case only', () => {
    expect(slug.safeParse('crowd-violence-detection').success).toBe(true);
    expect(slug.safeParse('Crowd Violence').success).toBe(false);
    expect(slug.safeParse('trailing-').success).toBe(false);
  });
});

describe('experienceSchema', () => {
  const valid = {
    id: 'decklify',
    organization: 'Decklify',
    role: { en: 'Founder' },
    category: 'founder',
    location: 'Jakarta, Indonesia',
    start: '2026-05',
    end: 'present',
    highlights: [{ en: 'Launched in 3 months.' }],
  };

  it('fills visibility and tag defaults', () => {
    const parsed = experienceSchema.parse(valid);
    expect(parsed.show_on_web).toBe(true);
    expect(parsed.show_on_cv).toBe(true);
    expect(parsed.tags).toEqual([]);
  });

  it('reports an end date before the start date on the `end` field', () => {
    const result = experienceSchema.safeParse({ ...valid, start: '2026-05', end: '2026-01' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['end']);
  });

  it('rejects unknown fields so misspelled keys are caught', () => {
    expect(experienceSchema.safeParse({ ...valid, show_on_cvv: false }).success).toBe(false);
  });
});

describe('certificationSchema', () => {
  const valid = { id: 'alibaba', name: 'Cloud Associate', issuer: 'Alibaba Cloud', issued: '2024-11' };

  it('allows certifications without an expiry date', () => {
    expect(certificationSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an expiry date before the issue date', () => {
    const result = certificationSchema.safeParse({ ...valid, expires: '2024-01' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['expires']);
  });
});

describe('messageSchema', () => {
  const base = {
    id: 'jane-doe',
    position: 0,
    name: 'Jane Doe',
    relationship: { en: 'Manager' },
    message: { en: 'Great to work with.' },
    approved: '2026-10',
  };

  it('accepts a message with permission, without a role, and with an optional profile link', () => {
    expect(messageSchema.safeParse(base).success).toBe(true);
    expect(messageSchema.safeParse({ ...base, link: 'https://www.linkedin.com/in/jane' }).success).toBe(true);
  });

  it('requires the month of permission and a real link', () => {
    const { approved: _approved, ...withoutApproval } = base;
    expect(messageSchema.safeParse(withoutApproval).success).toBe(false);
    expect(messageSchema.safeParse({ ...base, link: 'linkedin.com/in/jane' }).success).toBe(false);
    for (const link of ['tel:+10000000000', 'mailto:jane@example.com', 'javascript:alert(1)', 'http://example.com'])
      expect(messageSchema.safeParse({ ...base, link }).success, link).toBe(false);
  });
});
