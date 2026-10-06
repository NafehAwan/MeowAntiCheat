import { applyReviewRule, baseStatus, defaultKnowledgeBase } from './engine';
import { normalize, normalizeENumber } from './normalize';
import type { KBEntry, KnowledgeBase, Profile, Status } from './types';

export interface LookupResult {
  entry: KBEntry;
  /** Status for this profile, after the review rule. */
  status: Status;
  shownAsDoubtfulBecauseUnreviewed: boolean;
}

export interface LookupOptions {
  profile: Profile;
  kb?: KnowledgeBase;
  requireReviewed: boolean;
  limit?: number;
}

/** Search the knowledge base by E-number ("E471", "471") or name ("gelatin"). */
export function lookup(query: string, options: LookupOptions): LookupResult[] {
  const kb = options.kb ?? defaultKnowledgeBase;
  const q = normalize(query);
  if (!q) return [];
  const eNumber = normalizeENumber(query);

  const scored: { entry: KBEntry; score: number }[] = [];
  for (const entry of kb.entries) {
    const eNums = entry.eNumbers.map((e) => e.toLowerCase());
    const names = [entry.name, ...Object.values(entry.names).flat()].map(normalize);
    let score = 0;
    if (eNumber && eNums.includes(eNumber)) score = 100;
    else if (eNumber && eNums.some((e) => e.startsWith(eNumber))) score = 80;
    else if (names.includes(q)) score = 90;
    else if (names.some((n) => n.startsWith(q))) score = 60;
    else if (names.some((n) => n.includes(q))) score = 40;
    if (score > 0) scored.push({ entry, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, options.limit ?? 20)
    .map(({ entry }) => {
      const { status, downgraded } = applyReviewRule(
        baseStatus(entry, options.profile),
        entry,
        options.requireReviewed
      );
      return { entry, status, shownAsDoubtfulBecauseUnreviewed: downgraded };
    });
}
