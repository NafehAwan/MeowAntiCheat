/**
 * Splits an ingredient list into separate ingredients, respecting brackets.
 *
 * "Chocolate (sugar, cocoa butter, emulsifier (E471)), gelatin (beef)"
 *   → ["Chocolate", "sugar", "cocoa butter", "emulsifier (E471)", "gelatin (beef)"]
 *
 * An ingredient whose brackets hold exactly one plain item ("gelatin (beef)",
 * "emulsifier (E471)") stays as one unit, so the bracket can qualify it.
 * Brackets that hold a list are split into their own ingredients, so "fish"
 * in "capsule (gelatin, fish oil)" can never qualify "gelatin".
 */
interface Node {
  text: string;
  children: Node[];
}

const OPEN = '([{';
const CLOSE = ')]}';

function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of text) {
    if (OPEN.includes(ch)) depth++;
    if (CLOSE.includes(ch)) depth = Math.max(0, depth - 1);
    if (depth === 0 && (ch === ',' || ch === ';' || ch === '\n')) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts.map((p) => p.trim()).filter(Boolean);
}

function parseNode(text: string): Node {
  let name = '';
  const inner: string[] = [];
  let depth = 0;
  let buf = '';
  for (const ch of text) {
    if (OPEN.includes(ch)) {
      if (depth === 0) buf = '';
      else buf += ch;
      depth++;
      continue;
    }
    if (CLOSE.includes(ch) && depth > 0) {
      depth--;
      if (depth === 0) inner.push(buf);
      else buf += ch;
      continue;
    }
    if (depth === 0) name += ch;
    else buf += ch;
  }
  // Unclosed bracket: keep what we collected.
  if (depth > 0 && buf.trim()) inner.push(buf);

  const children = inner.flatMap((group) => splitTopLevel(group).map(parseNode));
  return { text: name.replace(/\s+/g, ' ').trim().replace(/[.:]+$/, '').trim(), children };
}

function isLeaf(node: Node): boolean {
  return node.children.length === 0;
}

function toUnits(node: Node, out: string[]): void {
  if (node.children.length === 1 && isLeaf(node.children[0]!)) {
    const child = node.children[0]!.text;
    out.push(node.text ? `${node.text} (${child})` : child);
    return;
  }
  if (node.text) out.push(node.text);
  for (const child of node.children) toUnits(child, out);
}

/** Turns raw label text (or a list from the extractor) into ingredient units. */
export function splitIngredients(input: string | string[]): string[] {
  const items = Array.isArray(input) ? input : [input];
  const units: string[] = [];
  for (const item of items) {
    for (const part of splitTopLevel(item)) toUnits(parseNode(part), units);
  }
  return units.filter((u) => /[\p{L}\p{N}]/u.test(u));
}
