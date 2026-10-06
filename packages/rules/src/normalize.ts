/**
 * Text normalisation shared by the parser, the matcher and the lookup.
 * Goal: "Mono- & Diglycérides (E-471)" and "mono and diglycerides (e471)"
 * end up identical.
 */
export function normalize(text: string): string {
  return (
    text
      .normalize('NFKD')
      // strip accents (é → e)
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      // allergen markup from Open Food Facts (_milk_), hyphens and slashes → spaces
      .replace(/[_\-‐‑–—/]/g, ' ')
      // "E 471", "E-471", "INS 471" → "e471"
      .replace(/\b(?:e|ins)\s*(\d{3,4})([a-f])?\b/g, (_m, n: string, s?: string) => `e${n}${s ?? ''}`)
      // drop remaining punctuation
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/** Normalise an E-number query like "E 471", "e471", "471" → "e471". */
export function normalizeENumber(query: string): string | null {
  const m = query
    .trim()
    .toLowerCase()
    .match(/^(?:e|ins)?[\s-]*(\d{3,4})([a-f])?$/);
  return m ? `e${m[1]}${m[2] ?? ''}` : null;
}
