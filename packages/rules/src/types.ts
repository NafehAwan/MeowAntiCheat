/** Halal status of a single ingredient (or of a whole product). */
export type Status = 'halal' | 'doubtful' | 'haram';

/** Product-level verdict. `unknown` means there was nothing to analyse. */
export type VerdictStatus = Status | 'unknown';

export type Category =
  | 'meat'
  | 'animal-fat'
  | 'alcohol'
  | 'additive'
  | 'emulsifier'
  | 'colour'
  | 'glazing-agent'
  | 'flavouring'
  | 'enzyme'
  | 'dairy'
  | 'protein'
  | 'seafood'
  | 'other';

export interface Reference {
  title: string;
  url: string;
}

/**
 * A word or phrase that, when it appears next to a match in the same
 * ingredient, changes that match's status. Example: "fish" next to
 * "gelatin" → halal; "pork" next to "gelatin" → haram.
 */
export interface Qualifier {
  terms: string[];
  status: Status;
  reason: string;
}

export interface KBEntry {
  id: string;
  /** Display name shown in the app. */
  name: string;
  /** Aliases per language code ("en", "ar", "ur", "fr"…). */
  names: Record<string, string[]>;
  /** E-numbers / INS numbers, e.g. ["E471"]. */
  eNumbers: string[];
  category: Category;
  defaultStatus: Status;
  /** Possible sources of origin, e.g. ["pork", "beef", "fish"]. */
  origins: string[];
  /** One-line plain-language reason shown next to a flagged ingredient. */
  shortReason: string;
  /** Longer plain-language explanation (lookup screen, "why" section). */
  explanation: string;
  /** Phrases that, when they contain the match, cancel it ("sugar alcohol", "alcohol free"). */
  exceptions?: string[];
  qualifiers?: Qualifier[];
  /** Per-profile status overrides, keyed by profile id. Only fill from reviewed sources. */
  profileOverrides?: Record<string, Status>;
  references: Reference[];
  /** Has a qualified person reviewed this entry? Never set to true without the founder. */
  reviewed: boolean;
}

export interface KnowledgeBase {
  version: string;
  entries: KBEntry[];
}

export interface Profile {
  id: string;
  name: string;
  strictness: 'conservative';
  school: 'unspecified';
}

export interface Flag {
  entryId: string;
  /** KB display name, e.g. "Gelatin (E441)". */
  name: string;
  /** The ingredient as written on the label. */
  ingredient: string;
  status: Status;
  /** One-line reason. */
  reason: string;
  /** True if the KB entry has not been reviewed by a qualified person. */
  reviewed: boolean;
  /** True if the status was raised to doubtful only because the entry is unreviewed. */
  shownAsDoubtfulBecauseUnreviewed: boolean;
}

export type WhyItem =
  | { code: 'no-ingredients' }
  | { code: 'nothing-flagged'; count: number }
  | { code: 'haram-found'; names: string[] }
  | { code: 'doubtful-found'; names: string[] }
  | { code: 'unreviewed-entries' };

export interface Analysis {
  verdict: VerdictStatus;
  /** Flagged ingredients (doubtful or haram), most severe first. */
  flagged: Flag[];
  /** "Why this verdict" items; the app turns them into translated sentences. */
  why: WhyItem[];
  /** How many separate ingredients were analysed. */
  ingredientCount: number;
  kbVersion: string;
  profileId: string;
}

export interface AnalyzeOptions {
  profile: Profile;
  kb?: KnowledgeBase;
  /**
   * When true (production), any entry with `reviewed: false` is shown as
   * doubtful, never as a confident halal or haram.
   */
  requireReviewed: boolean;
}
