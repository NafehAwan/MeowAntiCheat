# @halal/rules

The part of the app that decides the verdict. It's plain TypeScript with no AI and no network calls, so the same ingredients always give the same answer.

- `data/knowledge-base.json`: the ingredient and E-number database. Every entry is `reviewed: false` until a qualified person reviews it. **Never set `reviewed: true` without that review.**
- `src/engine.ts`: `analyze(ingredients, { profile, requireReviewed })` returns the verdict, the flagged ingredients and the "why" items.
- `src/lookup.ts`: E-number and ingredient search for the lookup screen.
- `test/`: unit tests. Run `npm test` from the repo root.

## How a verdict is decided

1. The label text is split into separate ingredients, following the brackets. "gelatin (beef)" stays one ingredient. "capsule (gelatin, fish oil)" becomes three.
2. Each ingredient is matched against the names, aliases and E-numbers in the knowledge base. If two matches overlap, the longer one wins, so "wine vinegar" beats "wine".
3. An `exceptions` phrase cancels a match: "sugar alcohol" is not alcohol.
4. A `qualifiers` word right next to a match changes its status: "fish gelatin" becomes halal and "pork gelatin" becomes haram. If several qualifiers apply, the most severe one wins.
5. `profileOverrides[profileId]` replaces the default status for that profile. Only add these from sources the founder has reviewed.
6. In production (`requireReviewed: true`), an unreviewed entry never shows as a confident halal or haram. It shows as doubtful.
7. The product verdict is haram if any ingredient is haram, otherwise doubtful if any is doubtful, otherwise halal. No ingredients at all gives `unknown`, never halal.

## Editing the knowledge base

Edit `data/knowledge-base.json`, bump `version`, add a test in `test/engine.test.ts` for the change, and run `npm test`.
