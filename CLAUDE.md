# CLAUDE.md — Halal Scanner App (Android-first)

You are the technical co-founder on this project. Read this whole file before doing anything. It contains the product, the business context, the build plan, and the marketing plan. Follow it, and update the "Progress log" section at the bottom as you finish milestones.

## 1. Context: why this project exists

- The founder has built many projects that made no money because nobody needed them. This time the rule is: ship a small, useful MVP fast, get it in front of real users, and only build more once people use and pay for it. No gold-plating, no features "because they're cool."
- Proven model: AI food-label scanner apps make real money (e.g. Goodie AI, a food label scanner, ~$13k MRR verified on TrustMRR). Halal scanner apps already charge ~$3.99–4.99/week or ~$29.99–39.99/year.
- The market is crowded with near-identical clones (Halal Scanner, Halal Detector, Halal Check, Scan Halal, etc.), mostly with very few ratings. A basic "scan label → halal/haram" app is a commodity. We win on trust and distribution (short-form video), not on the basic feature.
- The founder uses an Android phone and has no Mac/iPhone. We launch Android first on Google Play. iOS comes later from the same codebase.

## 2. Product

**One-line pitch:** Scan any barcode or ingredient label and get a clear Halal / Doubtful / Haram verdict, with the reason for every flagged ingredient, matched to the standard you follow.

**Target user (v1):** Muslims living as minorities (UK, US, Canada, Europe, Australia), where supermarket products often aren't certified and doubt is highest. Secondary: Muslims traveling, and parents checking kids' snacks.

### How we're different from the clones (build these into the design from day one)

1. **Trust-first verdicts.** A deterministic rules engine plus a curated, source-referenced ingredient/E-number database decides the verdict. The AI model only reads and normalizes the ingredient text. It never decides halal status on its own.
2. **"Doubtful" is a first-class answer.** Unknown origin (e.g. gelatin, mono- and diglycerides, natural flavors, some E-numbers) → Doubtful, with the reason. Never fake certainty on a religious question.
3. **User profile / standard.** Rulings differ between schools of thought and certification bodies. The data model must support per-profile rulings (e.g. a strictness setting and a school-of-thought setting). Do not invent rulings. Only populate profile-specific rulings from sources the founder provides and has reviewed. Until then, ship with one conservative default profile and the structure ready for more.
4. **Certified vs ingredients-look-OK are separate signals.** If certification data exists, show it separately from the ingredient analysis.
5. **Later (v2+):** medicines and capsules (gelatin), cosmetics and perfume (alcohol, animal-derived ingredients), restaurant menu photos, and community-verified answers ("I emailed the manufacturer, here's their reply").

### MVP scope (v1): build ONLY this

- Barcode scan → look up the product → ingredient analysis → verdict screen.
- Ingredient-label photo → text extraction → ingredient analysis → verdict screen (works when there's no barcode or the product isn't in the database).
- Verdict screen: big Halal / Doubtful / Haram badge, the list of flagged ingredients with a one-line plain-language reason each, and a "why this verdict" section. Disclaimer: "Decision-support tool based on listed ingredients. Formulas and sourcing change. Check certification or contact the manufacturer when in doubt. Not a religious ruling."
- E-number / ingredient lookup screen (search "E471" → status + explanation).
- Scan history (stored on device).
- Free tier with a scan limit, then a paywall (weekly + yearly plans).
- Languages: English first. Structure all strings for i18n (Urdu and Arabic, with RTL, come next).
- Onboarding: 3 screens max, then straight to the camera.

### Not in v1 (don't build unless the founder asks)

Accounts/login, social features, restaurant finder, prayer times/qibla, community answers, cosmetics/medicine, web app, iOS release.

## 3. Tech stack

Check current official docs before using any API. Versions and endpoints change; don't rely on memory.

- **App:** Expo (latest stable SDK) + React Native + TypeScript + expo-router.
- **Camera / barcodes:** expo-camera (it has built-in barcode scanning).
- **Product data:** Open Food Facts API (free, open data, includes ingredient lists for millions of products). Respect their usage terms and send a proper User-Agent. Cache lookups.
- **Label photos:** send the image to a backend function that calls a vision-capable LLM to extract and normalize the ingredient list into structured JSON. The LLM returns ingredients, not verdicts.
- **Backend:** Supabase (the founder has it connected). Edge Functions hold all API keys. Never put API keys in the app bundle. Add simple per-device rate limiting so free users can't burn the LLM budget.
- **Rules engine:** a pure TypeScript module (shared, fully unit-tested) that takes the normalized ingredient list plus the user's profile and returns the verdict, the flagged items, and the reasons.
- **Knowledge base:** versioned JSON (later a Supabase table) of ingredients and E-numbers. Each entry has: id, names/aliases (multiple languages), category, default status (halal / doubtful / haram), possible sources of origin, plain-language explanation, per-profile overrides, source/reference, `reviewed: true/false`. Anything not reviewed shows as Doubtful in production.
- **Payments:** Google Play Billing through RevenueCat (react-native-purchases). This needs a development build, not Expo Go.
- **Builds:** EAS Build. The founder tests on their physical Android phone with a development build.
- **Analytics:** a lightweight, privacy-respecting option (scan count, verdict distribution, paywall views, conversions). No selling data. No storing label photos after processing.

## 4. Repo structure (suggested)

```
/app            Expo app (expo-router screens)
/packages/rules Rules engine + knowledge base + unit tests
/supabase       Edge functions (label extraction, product lookup proxy, rate limit)
/marketing      HyperFrames video projects, scripts, content calendar
/store          Play Store listing copy, screenshots, privacy policy, data safety answers
CLAUDE.md
```

## 5. Google Play launch requirements (plan around these)

- New personal Google Play developer accounts must run a closed test with at least 12 testers opted in for 14 continuous days before applying for production. If testers drop below 12, the clock resets. Organization accounts are exempt but need business verification.
- Start the closed test in week 1 with a basic working build, so the 14 days run while we keep building. Aim for 15–20 testers, not 12.
- Before submitting: privacy policy page, Data safety form, content rating, target audience, store listing (title, short and long description, screenshots, feature graphic, promo video).
- Budget about 3 weeks from "first testable build" to "live on Play Store."

## 6. Milestones

- **M0, setup (day 1–2):** Expo project, TypeScript, expo-router, EAS configured, a dev build running on the founder's Android phone. Explain every command simply. The founder is not a mobile expert.
- **M1, core scan (week 1):** barcode → Open Food Facts → rules engine → verdict screen. Seed the knowledge base with common flagged ingredients and E-numbers (gelatin, lard, carmine/E120, alcohol/ethanol, E471, E422, L-cysteine/E920, shellac/E904, natural flavors, enzymes, whey/rennet, etc.), all clearly marked `reviewed: false` with references. Upload the first build to the Play closed testing track this week.
- **M2, label photo (week 2):** Supabase edge function for vision extraction, the photo flow, error handling (blurry photo, no ingredients found, non-English labels).
- **M3, monetization (week 2–3):** RevenueCat + Play Billing, free scan limit, paywall screen, regional pricing notes for the founder.
- **M4, polish and store (week 3):** onboarding, history, E-number lookup, disclaimer, privacy policy, store listing assets, crash/edge-case pass.
- **M5, launch:** production access after the 14-day test, then the content push (section 7). Target: live and posting content daily well before Ramadan 2027 (around early February 2027; confirm the exact date).

Before public launch, the founder must get the knowledge base reviewed by a qualified, knowledgeable person. Remind them of this at M4 and don't flip entries to `reviewed: true` yourself.

## 7. Marketing: UGC and launch content with HyperFrames

HyperFrames (open source, by HeyGen) renders HTML/CSS/GSAP compositions to MP4. It is used only for marketing, in `/marketing`. It needs Node.js 22+ and FFmpeg. Install the skills with `npx skills add heygen-com/hyperframes`, start a project with `npx hyperframes init <name>`, preview with `npx hyperframes preview`, render with `npx hyperframes render`. Read the installed HyperFrames skill files before authoring any video.

**Formats:** 9:16 vertical, 15–40 seconds, a hook in the first 1.5 seconds, bold animated captions, TTS voiceover (HyperFrames supports TTS), real app screen recordings and screenshots wherever possible. Faceless only.

**Video series to produce** (make reusable, parameterized templates so one template → many videos):

1. "What is E___ actually?" One additive per video: what it is, where it can come from, why it's halal/doubtful/haram. An endless series that also targets search.
2. "Ingredients that might not be halal, hiding in everyday food." Generic categories (gelatin in sweets, alcohol in flavorings, emulsifiers), not brand call-outs.
3. Scan demo. An ingredient label with flagged words lighting up, then the verdict badge slams in, then "scan anything in 2 seconds."
4. Myth vs fact. "Vegetarian = halal? Not always."
5. Launch video (30–45s) for Play Store promo, X, LinkedIn, and WhatsApp groups.
6. Ramadan series (start 3–4 weeks before Ramadan): iftar shopping checks, "check your sweets before Eid."

**Content safety rules (mandatory):**

- Never claim a named brand or product "is haram." Only show what the printed ingredient list says, label the result "doubtful: check with the manufacturer," and prefer generic or blurred packaging. Wrong claims destroy trust and can create legal risk.
- Don't present the app as a religious authority. Use the same disclaimer as the app.
- Only use music, fonts, and images we have the rights to.

**Deliverables in `/marketing`:**

- `content-calendar.md`: 30 days of posts (hook, script, format, caption, hashtags), refreshed monthly.
- `/templates`: parameterized HyperFrames compositions for each series.
- `/renders`: final MP4s, named by date and series.
- `store-assets`: Play Store promo video, phone screenshots with captions, feature graphic.
- Posting plan: TikTok, Instagram Reels, YouTube Shorts, plus Facebook groups and WhatsApp communities. At least 1–2 posts/day during launch.

## 8. How to work with the founder

- Explain what you're doing in plain language. Give exact commands for anything they need to run on their own machine or phone.
- Ask before anything irreversible or that costs money (paid services, publishing to the store, deleting data).
- Keep secrets out of git (.env, EAS secrets, Supabase secrets).
- Write unit tests for the rules engine. A wrong verdict is the worst bug this app can have.
- Keep scope tight. If you think a feature should be added, propose it in one line and wait.
- At the end of each work session, update the Progress log below and list the next 3 tasks.

## 9. Success metrics (first 60 days)

- Live on Google Play before Ramadan 2027.
- 1,000+ installs, 3%+ of active users converting to paid, at least one video over 100k views.
- If after ~30 days of daily content there's no traction, stop and reassess with the founder instead of adding features.

## Progress log

- [ ] M0 setup
- [ ] M1 core scan + closed test started (date: ____)
- [ ] M2 label photo
- [ ] M3 monetization
- [ ] M4 polish + store assets + knowledge base reviewed
- [ ] M5 production launch + content push

Next 3 tasks: (fill in)
