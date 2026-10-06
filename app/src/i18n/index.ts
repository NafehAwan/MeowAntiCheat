import { en, type StringKey } from './en';

// Add 'ur' and 'ar' (with RTL) here later, keyed the same as `en`.
const strings: Record<string, Partial<Record<StringKey, string>>> = { en };
const locale = 'en';

export function t(key: StringKey, params?: Record<string, string | number>): string {
  const template = strings[locale]?.[key] ?? en[key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (m, name: string) =>
    name in params ? String(params[name]) : m
  );
}

export type { StringKey };
