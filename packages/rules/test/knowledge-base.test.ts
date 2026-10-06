import { describe, expect, it } from 'vitest';

import { DEFAULT_PROFILE, defaultKnowledgeBase, lookup, normalizeENumber } from '../src';

const opts = { profile: DEFAULT_PROFILE, requireReviewed: false };

describe('knowledge base integrity', () => {
  const entries = defaultKnowledgeBase.entries;

  it('has a version', () => {
    expect(defaultKnowledgeBase.version).toMatch(/\S/);
  });

  it('has unique ids', () => {
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
  });

  it('never marks an entry reviewed without the founder (all false for now)', () => {
    // Flip this test only when a qualified reviewer has signed off on entries.
    expect(entries.every((e) => e.reviewed === false)).toBe(true);
  });

  it.each(entries.map((e) => [e.id, e] as const))('%s is complete', (_id, e) => {
    expect(e.name).toBeTruthy();
    expect(e.names.en?.length).toBeGreaterThan(0);
    expect(['halal', 'doubtful', 'haram']).toContain(e.defaultStatus);
    expect(e.origins.length).toBeGreaterThan(0);
    expect(e.shortReason.length).toBeGreaterThan(10);
    expect(e.explanation.length).toBeGreaterThan(20);
    expect(e.references.length).toBeGreaterThan(0);
    for (const r of e.references) expect(r.url).toMatch(/^https:\/\//);
    for (const n of e.eNumbers) expect(n).toMatch(/^E\d{3,4}[a-f]?$/);
  });

  it('no E-number belongs to two entries', () => {
    const all = entries.flatMap((e) => e.eNumbers);
    expect(new Set(all).size).toBe(all.length);
  });

  it('seeds the ingredients listed in CLAUDE.md', () => {
    const ids = new Set(entries.map((e) => e.id));
    for (const id of ['gelatin', 'lard', 'carmine', 'alcohol', 'e471', 'glycerol', 'l-cysteine', 'shellac', 'natural-flavourings', 'enzymes', 'whey', 'rennet']) {
      expect(ids).toContain(id);
    }
  });
});

describe('lookup', () => {
  it.each(['E471', 'e471', '471', 'E 471', 'INS 471'])('finds E471 from "%s"', (q) => {
    expect(lookup(q, opts)[0]!.entry.id).toBe('e471');
  });

  it('finds by name', () => {
    expect(lookup('gelatin', opts)[0]!.entry.id).toBe('gelatin');
    expect(lookup('Cochineal', opts)[0]!.entry.id).toBe('carmine');
  });

  it('finds by E-number prefix', () => {
    expect(lookup('E47', opts).map((r) => r.entry.id)).toContain('e471');
  });

  it('returns nothing for empty or unknown queries', () => {
    expect(lookup('', opts)).toEqual([]);
    expect(lookup('zzzz', opts)).toEqual([]);
  });

  it('applies the review rule', () => {
    const r = lookup('lard', { ...opts, requireReviewed: true })[0]!;
    expect(r.status).toBe('doubtful');
    expect(r.shownAsDoubtfulBecauseUnreviewed).toBe(true);
    expect(lookup('lard', opts)[0]!.status).toBe('haram');
  });

  it('normalizeENumber', () => {
    expect(normalizeENumber('E-472e')).toBe('e472e');
    expect(normalizeENumber('gelatin')).toBeNull();
  });
});
