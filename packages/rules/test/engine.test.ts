import { describe, expect, it } from 'vitest';

import { analyze, DEFAULT_PROFILE, defaultKnowledgeBase, type KnowledgeBase } from '../src';

const dev = { profile: DEFAULT_PROFILE, requireReviewed: false };
const prod = { profile: DEFAULT_PROFILE, requireReviewed: true };

const verdict = (text: string | string[]) => analyze(text, dev).verdict;
const flaggedIds = (text: string | string[]) => analyze(text, dev).flagged.map((f) => f.entryId);

describe('verdicts', () => {
  it('plain plant ingredients are halal', () => {
    const a = analyze('Wheat flour, sugar, palm oil, salt, raising agent (sodium bicarbonate)', dev);
    expect(a.verdict).toBe('halal');
    expect(a.flagged).toEqual([]);
    expect(a.why).toEqual([{ code: 'nothing-flagged', count: 5 }]);
  });

  it('empty input is unknown, never halal', () => {
    expect(verdict('')).toBe('unknown');
    expect(verdict([])).toBe('unknown');
    expect(verdict(' , ; . ')).toBe('unknown');
    expect(analyze('', dev).why).toEqual([{ code: 'no-ingredients' }]);
  });

  it('haram beats doubtful', () => {
    const a = analyze('Sugar, gelatin, lard', dev);
    expect(a.verdict).toBe('haram');
    expect(a.flagged[0]!.status).toBe('haram');
    expect(a.why.map((w) => w.code)).toEqual(['haram-found', 'doubtful-found']);
  });

  it.each([
    ['Pork (95%), salt', 'pork'],
    ['Smoked BACON, water', 'pork'],
    ['Pastry (wheat flour, lard, water)', 'lard'],
    ['Ethanol', 'alcohol'],
    ['Water, alcohol, flavouring', 'alcohol'],
    ['Cream, sugar, rum (5%)', 'alcoholic-drinks'],
    ['Sauce (tomato, red wine, onion)', 'alcoholic-drinks'],
    ['Pork gelatine', 'gelatin'],
    ['Gelatin (porcine)', 'gelatin'],
    ['E1510', 'alcohol'],
    ['Dried blood', 'blood'],
  ])('%s → haram (%s)', (text, id) => {
    expect(verdict(text)).toBe('haram');
    expect(flaggedIds(text)).toContain(id);
  });

  it.each([
    ['Sugar, glucose syrup, gelatine, citric acid', 'gelatin'],
    ['Gelatin (beef)', 'gelatin'],
    ['Emulsifier (E471)', 'e471'],
    ['Emulsifier: mono- and diglycerides of fatty acids', 'e471'],
    ['Emulsifiers (E 471, soya lecithin)', 'e471'],
    ['Colour: carmine', 'carmine'],
    ['E120', 'carmine'],
    ['Glazing agent: shellac', 'shellac'],
    ['Flour treatment agent (L-cysteine)', 'l-cysteine'],
    ['Natural flavourings', 'natural-flavourings'],
    ['natural flavors', 'natural-flavourings'],
    ['Whey powder (milk)', 'whey'],
    ['Cheddar cheese (milk)', 'cheese'],
    ['Enzymes', 'enzymes'],
    ['Rennet', 'rennet'],
    ['Glycerine', 'glycerol'],
    ['Chicken (20%)', 'meat'],
    ['Beef tallow', 'animal-fat'],
    ['Smoky bacon flavour', 'pork-flavouring'],
    ['Red wine vinegar', 'wine-vinegar'],
    ['Vanilla extract', 'vanilla-extract'],
    ['Prawns (crustaceans)', 'shellfish'],
    ['Polysorbate 80', 'polysorbates'],
    ['DATEM', 'e472'],
    ['E472e', 'e472'],
    ['Alcohol-free beer', 'non-alcoholic-drinks'],
  ])('%s → doubtful (%s)', (text, id) => {
    expect(verdict(text)).toBe('doubtful');
    expect(flaggedIds(text)).toEqual([id]);
  });
});

describe('qualifiers', () => {
  it.each([
    'Fish gelatin',
    'Gelatine (fish)',
    'Emulsifier (E471 from vegetable origin)',
    'Vegetable mono- and diglycerides',
    'Mono and diglycerides of fatty acids (palm)',
    'Vegetable glycerine',
    'Microbial rennet',
    'Rennet (non-animal)',
    'Enzymes (microbial)',
    'Cheese (vegetarian)',
    'Halal chicken',
  ])('%s → halal', (text) => {
    expect(verdict(text)).toBe('halal');
  });

  it('pork qualifier makes it haram, and pork is not flagged twice', () => {
    const a = analyze('Gelatine (pork)', dev);
    expect(a.verdict).toBe('haram');
    expect(a.flagged).toHaveLength(1);
    expect(a.flagged[0]!.entryId).toBe('gelatin');
  });

  it('most severe qualifier wins', () => {
    expect(verdict('Pork and fish gelatin')).toBe('haram');
    expect(verdict('Halal beef gelatin')).toBe('doubtful');
  });

  it('a qualifier inside a nested list cannot clear another ingredient', () => {
    // "fish" belongs to "fish oil", not to gelatin
    expect(verdict('Capsule (gelatin, fish oil)')).toBe('doubtful');
    // "vegetable" is too far from E471 to qualify it
    expect(verdict('Vegetable fat with emulsifier E471')).toBe('doubtful');
  });

  it('a plant qualifier on a separate ingredient does not clear E471', () => {
    expect(verdict('Vegetable oil (palm), emulsifier (E471)')).toBe('doubtful');
  });

  it('beef next to gelatin is only flagged once', () => {
    const a = analyze('Beef gelatine', dev);
    expect(a.flagged.map((f) => f.entryId)).toEqual(['gelatin']);
  });
});

describe('false positives we must avoid', () => {
  it.each([
    'Sweeteners (sorbitol, maltitol), sugar alcohols',
    'Alcohol-free',
    'Root beer flavour, ginger beer',
    'Graham flour, champignons, virgin olive oil, collard greens',
    'Pigment: paprika extract',
    'Coconut meat',
    "Lamb's lettuce",
    'Chicken eggs',
    'Malt vinegar, spirit vinegar',
    'Wine gums (sugar, starch)',
    'Hamamelis',
    'Shampoo base',
    'Cocoa butter, soya lecithin (E322)',
  ])('%s → halal', (text) => {
    expect(analyze(text, dev).flagged).toEqual([]);
  });

  it('E-number boundaries: E4711 and E47 do not match E471', () => {
    expect(verdict('E4711, E47')).toBe('halal');
  });
});

describe('parsing', () => {
  it('handles nested brackets and allergen markup', () => {
    const a = analyze(
      'Milk chocolate (sugar, cocoa butter, _milk_ powder, emulsifier (soya lecithin)), filling (sugar, gelatine, natural flavouring)',
      dev
    );
    expect(a.verdict).toBe('doubtful');
    expect(a.flagged.map((f) => f.entryId).sort()).toEqual(['gelatin', 'natural-flavourings']);
    expect(a.flagged.find((f) => f.entryId === 'gelatin')!.ingredient).toBe('gelatine');
  });

  it('accepts a list from the label extractor', () => {
    expect(verdict(['sugar', 'pork gelatin'])).toBe('haram');
  });

  it('handles accents, case and hyphens', () => {
    expect(verdict('GÉLATINE')).toBe('doubtful');
    expect(verdict('Mono- & Diglycerides')).toBe('doubtful');
    expect(verdict('e-471')).toBe('doubtful');
    expect(verdict('INS 471')).toBe('doubtful');
  });

  it('dedupes the same entry within one ingredient', () => {
    const a = analyze('Gelatin (E441)', dev);
    expect(a.flagged).toHaveLength(1);
  });

  it('handles unbalanced brackets without crashing', () => {
    expect(verdict('Sugar, gelatin (beef')).toBe('doubtful');
    expect(verdict('Sugar), lard')).toBe('haram');
  });
});

describe('review rule (production)', () => {
  it('unreviewed haram entries are shown as doubtful in production', () => {
    const a = analyze('Lard', prod);
    expect(a.verdict).toBe('doubtful');
    expect(a.flagged[0]!.shownAsDoubtfulBecauseUnreviewed).toBe(true);
    expect(a.why.map((w) => w.code)).toContain('unreviewed-entries');
  });

  it('unreviewed halal-by-qualifier is shown as doubtful in production', () => {
    const a = analyze('Fish gelatin', prod);
    expect(a.verdict).toBe('doubtful');
    expect(a.flagged[0]!.shownAsDoubtfulBecauseUnreviewed).toBe(true);
  });

  it('reviewed entries keep their status in production', () => {
    const kb: KnowledgeBase = {
      version: 'test',
      entries: defaultKnowledgeBase.entries.map((e) => ({ ...e, reviewed: true })),
    };
    expect(analyze('Lard', { ...prod, kb }).verdict).toBe('haram');
    expect(analyze('Fish gelatin', { ...prod, kb }).verdict).toBe('halal');
  });

  it('ingredients with no KB match stay halal in production', () => {
    expect(analyze('Sugar, salt', prod).verdict).toBe('halal');
  });
});

describe('profiles', () => {
  it('applies per-profile overrides', () => {
    const kb: KnowledgeBase = {
      version: 'test',
      entries: defaultKnowledgeBase.entries.map((e) =>
        e.id === 'shellfish' ? { ...e, profileOverrides: { 'test-profile': 'halal' } } : e
      ),
    };
    const profile = { ...DEFAULT_PROFILE, id: 'test-profile' };
    expect(analyze('Prawns', { profile, kb, requireReviewed: false }).verdict).toBe('halal');
    expect(analyze('Prawns', { ...dev, kb }).verdict).toBe('doubtful');
  });

  it('reports kb version and profile', () => {
    const a = analyze('Sugar', dev);
    expect(a.kbVersion).toBe(defaultKnowledgeBase.version);
    expect(a.profileId).toBe(DEFAULT_PROFILE.id);
  });
});
