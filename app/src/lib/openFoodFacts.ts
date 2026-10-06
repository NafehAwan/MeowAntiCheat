import AsyncStorage from '@react-native-async-storage/async-storage';

import { USER_AGENT } from './config';

/**
 * Open Food Facts product lookup (free, open data).
 * Read-only product lookups only; results are cached on the device so we
 * don't hit their servers again for the same barcode.
 */

const FIELDS = [
  'code',
  'product_name',
  'product_name_en',
  'brands',
  'ingredients_text',
  'ingredients_text_en',
  'lang',
  'labels_tags',
].join(',');

const CACHE_PREFIX = 'off:v1:';
const DAY_MS = 24 * 60 * 60 * 1000;
/** Products found are cached for a week; misses for a day, since products get added. */
const CACHE_TTL_MS = { found: 7 * DAY_MS, 'not-found': DAY_MS } as const;
const TIMEOUT_MS = 10_000;

export interface Product {
  barcode: string;
  name: string | null;
  brand: string | null;
  /** Ingredient text as printed, or null if the database has none. */
  ingredientsText: string | null;
  /** True when the ingredient text we have is not English. */
  ingredientsNotEnglish: boolean;
  /** The product data lists a halal label/certification. */
  hasHalalLabel: boolean;
}

export type LookupResult =
  | { kind: 'found'; product: Product }
  | { kind: 'not-found' }
  | { kind: 'error' };

interface OffProduct {
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  ingredients_text?: string;
  ingredients_text_en?: string;
  lang?: string;
  labels_tags?: string[];
}

function clean(s: string | undefined): string | null {
  const v = s?.trim();
  return v ? v : null;
}

export function toProduct(barcode: string, p: OffProduct): Product {
  const en = clean(p.ingredients_text_en);
  const any = clean(p.ingredients_text);
  return {
    barcode,
    name: clean(p.product_name_en) ?? clean(p.product_name),
    brand: clean(p.brands?.split(',')[0]),
    ingredientsText: en ?? any,
    ingredientsNotEnglish: !en && !!any && (p.lang ?? 'en') !== 'en',
    hasHalalLabel: (p.labels_tags ?? []).includes('en:halal'),
  };
}

/** Barcodes are digits only; anything else never reaches the network. */
export function isValidBarcode(code: string): boolean {
  return /^\d{6,14}$/.test(code);
}

export async function lookupProduct(barcode: string): Promise<LookupResult> {
  if (!isValidBarcode(barcode)) return { kind: 'not-found' };

  const cacheKey = CACHE_PREFIX + barcode;
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { at, result } = JSON.parse(cached) as { at: number; result: LookupResult };
      if (result.kind !== 'error' && Date.now() - at < CACHE_TTL_MS[result.kind]) return result;
    }
  } catch {
    // A broken cache entry should never block a lookup.
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let result: LookupResult;
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=${FIELDS}`,
      { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' }, signal: controller.signal }
    );
    if (res.status === 404) {
      result = { kind: 'not-found' };
    } else if (!res.ok) {
      return { kind: 'error' };
    } else {
      const body = (await res.json()) as { status?: number | string; product?: OffProduct };
      const found = body.product && (body.status === 1 || body.status === 'success');
      result = found ? { kind: 'found', product: toProduct(barcode, body.product!) } : { kind: 'not-found' };
    }
  } catch {
    return { kind: 'error' };
  } finally {
    clearTimeout(timer);
  }

  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), result }));
  } catch {
    // Caching is best-effort.
  }
  return result;
}
