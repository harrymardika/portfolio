import { describe, expect, it } from 'bun:test';

import { resolveMilestoneSource, type JourneySources } from '@/lib/content';

const sources: JourneySources = {
  experience: [
    {
      id: 'decklify',
      organization: 'Decklify',
      role: { en: 'Founder' },
      category: 'founder',
      location: 'Jakarta',
      start: '2026-05',
      end: 'present',
      highlights: [{ en: 'Launched.' }],
      tags: [],
      show_on_web: true,
      show_on_cv: true,
    },
  ],
  education: [
    {
      id: 'gunadarma',
      institution: 'Universitas Gunadarma',
      degree: { en: 'Informatics' },
      location: 'Depok',
      start: '2022-09',
      end: '2026-08',
      highlights: [],
      show_on_web: true,
      show_on_cv: true,
    },
  ],
  trainings: [],
  awards: [
    { id: 'kompres', title: { en: '2nd Place' }, issuer: 'UG', date: '2024', show_on_web: true, show_on_cv: true },
  ],
};

describe('resolveMilestoneSource', () => {
  it('finds the referenced item and reports its kind', () => {
    expect(resolveMilestoneSource({ ref: 'decklify' }, sources)?.kind).toBe('experience');
    expect(resolveMilestoneSource({ ref: 'gunadarma' }, sources)?.kind).toBe('education');
    expect(resolveMilestoneSource({ ref: 'kompres' }, sources)?.kind).toBe('award');
  });

  it('returns null without a ref or for an unknown ref', () => {
    expect(resolveMilestoneSource({ ref: undefined }, sources)).toBeNull();
    expect(resolveMilestoneSource({ ref: 'missing' }, sources)).toBeNull();
  });
});
