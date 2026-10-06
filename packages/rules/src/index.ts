export { analyze, defaultKnowledgeBase } from './engine';
export { lookup } from './lookup';
export type { LookupOptions, LookupResult } from './lookup';
export { normalize, normalizeENumber } from './normalize';
export { splitIngredients } from './parse';
export { DEFAULT_PROFILE, PROFILES } from './profiles';
export type {
  Analysis,
  AnalyzeOptions,
  Category,
  Flag,
  KBEntry,
  KnowledgeBase,
  Profile,
  Qualifier,
  Reference,
  Status,
  VerdictStatus,
  WhyItem,
} from './types';
