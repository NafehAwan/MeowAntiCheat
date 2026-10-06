import defaultKbJson from '../data/knowledge-base.json';
import { normalize } from './normalize';
import { splitIngredients } from './parse';
import type {
  Analysis,
  AnalyzeOptions,
  Flag,
  KBEntry,
  KnowledgeBase,
  Profile,
  Qualifier,
  Status,
} from './types';

export const defaultKnowledgeBase = defaultKbJson as KnowledgeBase;

const SEVERITY: Record<Status, number> = { halal: 0, doubtful: 1, haram: 2 };

/** A qualifier may sit at most this many words before / after the match. */
const QUALIFIER_GAP_BEFORE = 2;
const QUALIFIER_GAP_AFTER = 3;

interface CompiledEntry {
  entry: KBEntry;
  patterns: RegExp[];
  exceptions: RegExp[];
  qualifiers: { qualifier: Qualifier; patterns: RegExp[] }[];
}

interface Span {
  start: number;
  end: number;
}

interface Match extends Span {
  compiled: CompiledEntry;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Whole-word pattern; allows a plural "s"/"es" unless it's an E-number. */
function wordPattern(phrase: string, allowPlural = true): RegExp | null {
  const n = normalize(phrase);
  if (!n) return null;
  const plural = allowPlural && !/^e\d/.test(n) ? '(?:s|es)?' : '';
  return new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(n)}${plural}(?![\\p{L}\\p{N}])`, 'gu');
}

function compact<T>(xs: (T | null)[]): T[] {
  return xs.filter((x): x is T => x !== null);
}

const compiledCache = new WeakMap<KnowledgeBase, CompiledEntry[]>();

function compile(kb: KnowledgeBase): CompiledEntry[] {
  const cached = compiledCache.get(kb);
  if (cached) return cached;
  const compiled = kb.entries.map((entry) => ({
    entry,
    patterns: compact([
      ...Object.values(entry.names)
        .flat()
        .map((a) => wordPattern(a)),
      ...entry.eNumbers.map((e) => wordPattern(e, false)),
    ]),
    exceptions: compact((entry.exceptions ?? []).map((x) => wordPattern(x, false))),
    qualifiers: (entry.qualifiers ?? []).map((qualifier) => ({
      qualifier,
      patterns: compact(qualifier.terms.map((t) => wordPattern(t, false))),
    })),
  }));
  compiledCache.set(kb, compiled);
  return compiled;
}

function findAll(re: RegExp, text: string): Span[] {
  const spans: Span[] = [];
  re.lastIndex = 0;
  for (const m of text.matchAll(re)) {
    spans.push({ start: m.index!, end: m.index! + m[0].length });
  }
  return spans;
}

function inside(inner: Span, outer: Span): boolean {
  return inner.start >= outer.start && inner.end <= outer.end;
}

function overlaps(a: Span, b: Span): boolean {
  return a.start < b.end && b.start < a.end;
}

function wordsBetween(text: string, from: number, to: number): number {
  const between = text.slice(from, to).trim();
  return between ? between.split(' ').length : 0;
}

/** Finds KB matches in one normalised ingredient; longest match wins on overlap. */
function findMatches(text: string, compiled: CompiledEntry[]): Match[] {
  const candidates: Match[] = [];
  for (const c of compiled) {
    const exceptionSpans = c.exceptions.flatMap((re) => findAll(re, text));
    for (const re of c.patterns) {
      for (const span of findAll(re, text)) {
        if (exceptionSpans.some((ex) => inside(span, ex))) continue;
        candidates.push({ ...span, compiled: c });
      }
    }
  }
  candidates.sort((a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start);
  const kept: Match[] = [];
  for (const m of candidates) {
    if (!kept.some((k) => overlaps(k, m))) kept.push(m);
  }
  return kept.sort((a, b) => a.start - b.start);
}

interface AppliedQualifier {
  qualifier: Qualifier;
  span: Span;
}

/** Qualifiers near the match; the most severe one wins. */
function applicableQualifier(text: string, match: Match): AppliedQualifier | null {
  let best: AppliedQualifier | null = null;
  for (const { qualifier, patterns } of match.compiled.qualifiers) {
    for (const re of patterns) {
      for (const span of findAll(re, text)) {
        if (overlaps(span, match)) continue;
        const near =
          span.end <= match.start
            ? wordsBetween(text, span.end, match.start) <= QUALIFIER_GAP_BEFORE
            : wordsBetween(text, match.end, span.start) <= QUALIFIER_GAP_AFTER;
        if (!near) continue;
        if (!best || SEVERITY[qualifier.status] > SEVERITY[best.qualifier.status]) {
          best = { qualifier, span };
        }
      }
    }
  }
  return best;
}

/** Status of an entry for a profile, before qualifiers and the review rule. */
export function baseStatus(entry: KBEntry, profile: Profile): Status {
  return entry.profileOverrides?.[profile.id] ?? entry.defaultStatus;
}

/** Applies the "unreviewed entries are shown as doubtful" rule. */
export function applyReviewRule(
  status: Status,
  entry: KBEntry,
  requireReviewed: boolean
): { status: Status; downgraded: boolean } {
  if (requireReviewed && !entry.reviewed && status !== 'doubtful') {
    return { status: 'doubtful', downgraded: true };
  }
  return { status, downgraded: false };
}

/**
 * Analyse an ingredient list for a profile. Deterministic: the same input,
 * profile and knowledge base always give the same verdict.
 */
export function analyze(ingredients: string | string[], options: AnalyzeOptions): Analysis {
  const kb = options.kb ?? defaultKnowledgeBase;
  const compiled = compile(kb);
  const units = splitIngredients(ingredients);
  const flagged: Flag[] = [];

  for (const unit of units) {
    const text = normalize(unit);
    const matches = findMatches(text, compiled);
    const applied = matches.map((m) => applicableQualifier(text, m));
    // A word used as a qualifier ("pork" in "pork gelatin") is not flagged on its own,
    // as long as the qualifier made the other match at least as severe.
    const qualifierUses = compact(applied);
    const seen = new Set<string>();

    matches.forEach((match, i) => {
      const { entry } = match.compiled;
      const ownBase = baseStatus(entry, options.profile);
      const consumed = qualifierUses.some(
        (q) => inside(match, q.span) && SEVERITY[q.qualifier.status] >= SEVERITY[ownBase]
      );
      if (consumed) return;
      if (seen.has(entry.id)) return;
      seen.add(entry.id);

      const qualified = applied[i];
      const raw = qualified?.qualifier.status ?? baseStatus(entry, options.profile);
      const { status, downgraded } = applyReviewRule(raw, entry, options.requireReviewed);
      if (status === 'halal') return;
      flagged.push({
        entryId: entry.id,
        name: entry.name,
        ingredient: unit,
        status,
        reason: qualified?.qualifier.reason ?? entry.shortReason,
        reviewed: entry.reviewed,
        shownAsDoubtfulBecauseUnreviewed: downgraded,
      });
    });
  }

  flagged.sort((a, b) => SEVERITY[b.status] - SEVERITY[a.status]);

  const verdict: Analysis['verdict'] =
    units.length === 0
      ? 'unknown'
      : flagged.some((f) => f.status === 'haram')
        ? 'haram'
        : flagged.length > 0
          ? 'doubtful'
          : 'halal';

  return {
    verdict,
    flagged,
    why: explain(verdict, flagged, units.length),
    ingredientCount: units.length,
    kbVersion: kb.version,
    profileId: options.profile.id,
  };
}

function explain(verdict: Analysis['verdict'], flagged: Flag[], count: number): Analysis['why'] {
  const names = (status: Status) => [...new Set(flagged.filter((f) => f.status === status).map((f) => f.name))];
  const why: Analysis['why'] = [];
  if (verdict === 'unknown') why.push({ code: 'no-ingredients' });
  if (verdict === 'halal') why.push({ code: 'nothing-flagged', count });
  const haram = names('haram');
  const doubtful = names('doubtful');
  if (haram.length) why.push({ code: 'haram-found', names: haram });
  if (doubtful.length) why.push({ code: 'doubtful-found', names: doubtful });
  if (flagged.some((f) => f.shownAsDoubtfulBecauseUnreviewed)) why.push({ code: 'unreviewed-entries' });
  return why;
}
