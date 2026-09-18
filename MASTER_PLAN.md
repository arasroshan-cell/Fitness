# ROSHAN FITNESS TRACKER — MASTER REFERENCE
**Single source of truth. Read this before every build session.**
**Last updated:** 2026-09-18
**Supersedes:** the v2.2a version of this document (2026-07-12), ROADMAP_MASTER.md, AUDIT_FULL.md, EVALUATION_v2_2a_COMPLETE.md, HANDOVER_v5_0.md
**Paired with:** index.html (v5.5, 3782 lines, 161 functions), tests.js (300 assertions, all passing at last check)

---

## ⚡ START HERE — BUILD RULES (non-negotiable)

1. `str_replace` only. Never rewrite the full file.
2. Edits under 200 lines each.
3. `node --check` on the extracted `<script>` content after every batch.
4. Python surrogate-character scan after every file write.
5. Function count before/after every build.
6. **No "done" without an evidence line** (grep string, simulation output, or a passing test).
7. Run `tests.js` before telling Roshan anything is finished. It exists now — 297 assertions.
8. Present/deliver files after every delivery, not mid-batch.
9. Resolve open questions before starting a build that depends on them; do not guess and disclose later.
10. Every real feature or bug fix gets a real, reproduced-scenario test added to `tests.js` — not a placeholder.
11. Audit substitute exercises for equipment-label/cue mismatches when adding new ones (see Section 7).

---

## SECTION 1 — CURRENT STATE (verify at session start)

| Item | Value | Evidence |
|---|---|---|
| Deployed/built version | v5.5 | title tag + `APP_VERSION` const in index.html |
| HTML lines | 3782 | `wc -l` |
| Functions | 161 | `grep -c "^function "` |
| Foods in DB | 83 (74 base + 8 Tamil/Telugu additions + 1 Aldi granola) | FOODS array parse |
| fibreRisk foods | 3 | Chickpeas masala, Rajma masala, Soya chunks masala fry |
| oilInclusive foods | 28 | FOODS array parse |
| tests.js | EXISTS, 300/300 passing | last full run this session |
| plateRole system | IMPLEMENTED — every food tagged base/curry/side/none | Section 6 |
| Rest timer | IMPLEMENTED — 150s compound / 75s isolation, ±30s adjustable | Section 5 |
| RIR/RPE capture + coaching effect | IMPLEMENTED — top-set only | Section 5 |
| PR Celebration / Session Seal | IMPLEMENTED | Section 5 |
| Weight + e1RM forecasting | IMPLEMENTED — always shown as a range | Section 5 |
| Adaptive nutrition target suggestion | IMPLEMENTED — suggest-only, now with a confirm step before applying | Section 5 |
| Cross-system integration links (macro-gap fill, protein-miss and RIR feeding freshness) | IMPLEMENTED | Section 5 |
| manifest.json | Assumed still in repo — not re-verified this session | Carried forward from v2.2a doc |
| schema_version | Not implemented | Not in codebase |
| Progress photos | Explicitly out of scope | Roshan confirmed dropped |
| Weekly check-in summary | Not built | Flagged as needing its own conversation, not started |

---

## SECTION 2 — USER PROFILE (compact, carried forward — re-confirm anything time-sensitive)

**Roshan Arasu.** Sheffield. Compliance engineer. Samsung phone + Galaxy Watch.

**Goal:** 80–85kg at 14–16% BF via body recomposition. App's stored `goalWeight` default is 82.
**Timeline:** 12–18 months from the original plan. **Infliximab (biologic) has NOT started yet**
— confirmed by Roshan directly this session (2026-09-17). Everything reassesses once it does.

**Medical (hard constraints — never override, never touched by any change this session):**
- Crohn's disease, active, pre-biologic
- Terminal ileum stricture (~10cm)
- Seton drain (perianal fistula)
- **BANNED:** Squats, deadlifts, Valsalva manoeuvre on ANY heavy load
- **SEATED PRESSING PREFERRED** over standing (less perianal pressure)
- **HIGH-FIBRE FOODS** (chickpeas, rajma, soya chunks): obstruction risk with stricture — `fibreRisk:true` is implemented and live on all three
- **B12 / Vitamin D:** malabsorption risk noted in the original plan (terminal ileum, Sheffield latitude). Status not re-checked this session — ask Roshan if this has moved.
- **Weight loss rate:** the adaptive nutrition feature (Section 5) now surfaces a real trend-vs-target comparison, but the ">0.75%/week sustained = possible disease activity, not just success" framing from the original plan is a clinical judgement call, not something the app currently encodes as a distinct warning. Worth a dedicated look if this matters to Roshan.

**Training:** Push → Pull → Legs+Core → Upper Body, ~4/week.

**Dietary:** Homecooked Tamil **and Telugu** (expanded this session — Roshan is South Indian, previously the plan only said Tamil). Coconut oil only. No beef. Big eater, does not measure portions precisely. Cooks for two — wife takes a smaller share.

**Plate-building logic (confirmed this session, replacing the old 4-way Base/Liquid/Protein/Side model):**
- A plate is **Base + Curry + Side**, three components, not four. Liquid and Protein merged into
  "Curry" because a real Tamil/Telugu curry dish typically carries both the gravy and the protein
  at once.
- **Chickpeas masala/fry → side.** **Rajma → whole main dish (rajma-chawal), not a side or a
  curry component — tagged `plateRole:'none'` so it never appears in the Plate builder at all.**
  **Soya chunks masala/fry → side.** (A hypothetical "soya chunks biryani" would also be `none`,
  a whole dish, but that specific preparation is not currently in the database.)

**Supplements:** Serious Gainz post-workout, creatine, Boost.

---

## SECTION 3 — OPEN ITEMS (blocking or worth resolving)

| ID | Item | Status |
|---|---|---|
| OI1 | Nordic curl equipment setup (bodyweight/partner-held, GHD, or band-assisted?) | **RESOLVED 2026-09-18.** Roshan confirmed GHD machine. `SUB_TYPE_OVERRIDE` entry added: `inputType:'bodyweight'`, wlabel `'Bodyweight (add kg held at chest if weighted)'`, GHD-specific footplate/pad setup cue. No longer inherits Seated leg curl's "Stack weight". |
| OI2 | TKE (terminal knee extension) equipment (band or cable?) | **RESOLVED 2026-09-18.** Roshan confirmed he does not currently perform this exercise. Removed entirely from `SUBS['Leg extension (machine)']` rather than left with a guessed label — `findExDef('TKE — terminal knee extension')` now returns `null`. |
| OI3 | Adaptive nutrition target thresholds | Roshan said he does not yet understand what can impact this feature and how. A confirm step was added before any kcal target actually changes (2026-09-17), but the underlying explanation has not been walked through with him in depth. Worth a dedicated conversation, not just a UI safeguard. |
| OI4 | Rest timer default durations (150s compound / 75s isolation) | Implemented with ±30s in-session adjustment per Roshan's request. The defaults themselves are reasonable convention, not something Roshan specifically confirmed — revisit if they feel wrong in practice. |
| OI5 | Weekly check-in summary | Not built. Flagged repeatedly as needing its own conversation before scoping. |
| OI6 | B12 / Vitamin D supplementation status | Carried forward from the original plan as unresolved administrative items. Not touched this session. Ask Roshan for current status. |

---

## SECTION 4 — BUGS FIXED THIS SESSION (v5.0 → v5.5)

**Equipment-label/cue mismatch on substitute exercises (found by Roshan in real use, v5.5).**
Skull crushers, a registered substitute for Overhead tricep extension, was silently inheriting
the original's `wlabel` ("DB weight (one hand)") and `nt` cue ("Rope attachment — lets wrists
rotate through the stretch") because no `SUB_TYPE_OVERRIDE` entry existed for it and
`inferSubWlabel`'s name-pattern matching does not recognise "Skull crushers" as a distinct
equipment type. Roshan actually uses an EZ bar or Smith machine. Fixed with an explicit override.
A full audit of the entire `SUBS` table (see Section 7) found three more real instances of the
same bug (T-bar row, DB kickback, Machine tricep dip) and fixed all three. A permanent
programmatic test now scans the whole table for this signature on every run.

**Plate-role corrections from Roshan's direct feedback (v5.5).** Rajma masala moved from `side`
to `none` (it is a whole dish, rajma-chawal, not a plate component). Soya chunks masala fry moved
from `curry` to `side` (it is the dry fry preparation, not the gravy-carrying component).

---

## SECTION 5 — FEATURES BUILT THIS SESSION (v5.0 → v5.5, full build order A through J)

| Section | What shipped |
|---|---|
| A/B | Food tab restructured to Log/Cook/Plate (three tabs, not four) — "Foods" demoted to a link, reachable from Log and Plate. Log tab gained tappable "recent & frequent" chips (ranked by real logged frequency, tie-broken by recency) and a circular protein-ring hero visual replacing flat bars. |
| C | Cook tab's portion inputs are free-number grams, not Small/Medium/Large buckets — Roshan's own call, since "my small might not be your small." |
| D | Plate rebuilt to the confirmed 3-way Base/Curry/Side. Every dropdown is genuinely filtered by `plateRole`, not showing the entire food database. |
| E | All 83 foods carry a real `plateRole` tag. 8 Tamil/Telugu dishes added (Adai, Pesarattu, Idiyappam, Kootu, Vatha kuzhambu, Chicken chukka, Prawn masala dry roast, Medu vada) plus the Aldi Harvest Morn Chocolate Protein Granola, label-verified against its actual Open Food Facts nutrition entry (420kcal/18g P/55g C/17.3g F per 100g). |
| F | Progress tab restructured around search: type an exercise name, get its best-ever lift stated plainly, last session, trend chart, and a small single-muscle body illustration — reusing the same `searchExHistory` function History tab already had, not a second exercise picker. |
| G | Freshness diagram relocated to the Today tab, next to the deload warning it actually informs. Volume mode retired entirely — it answered the same question as Weekly Sets Per Muscle, in worse form. |
| H | Rest timer: auto-starts on set completion via `togDone`, 150s compound / 75s isolation, vibrates on completion, now adjustable ±30s in the moment. |
| I | Adaptive nutrition target: compares real weight trend (rolling 2+ week window) against the current kcal target, suggests — never silently applies — an adjustment when they disagree. Now requires an explicit confirm before the target actually changes. |
| I2 | Forecasting: body weight to goal, and per-exercise e1RM, both always shown as a range, never a single confident number. Weight forecast lives with the Weight Trend graph; e1RM forecast lives inside the same per-exercise search panel from Section F. |
| I3 | RIR/RPE captured on the true top set only (last non-drop set), a 4-button tap control. Feeds `getNextTargetWeight`: low RIR caps the next suggestion at the base increment, high RIR justifies the top of the range the trend math could already reach — the realistic-growth ceiling still has final say either way. PR Celebration and Session Seal are one overlay, not two competing popups; a genuine PR (via the existing `checkPR` definition) upgrades the plain seal to a gold celebration. |
| J | Three integration links: (1) Cook and Plate can fill a portion to close today's real remaining protein gap. (2) A sustained real pattern of missing the protein target widens the muscle-recovery window, the same mechanism already used for low logged Energy. (3) A sustained pattern of near-maximal top-set effort (low RIR) does the same. **Note:** the original spec text said "high RIR," but its own parenthetical explanation ("everything feeling harder than it should") only makes sense for low RIR — implemented what the explanation actually describes, flagged here and to Roshan directly rather than silently picking a side. |

---

## SECTION 6 — FOOD DATABASE SUMMARY

**83 foods total. 28 with `oilInclusive:true`. 3 with `fibreRisk:true`.**

### plateRole convention (new this session, replacing the old unfiltered dropdowns)
Every food carries `plateRole: 'base' | 'curry' | 'side' | 'none'`.
- `base` — the starch a curry goes over (rice, dosa, chapati, idli, pongal, coconut rice, egg dosa, plus the new Adai/Pesarattu/Idiyappam)
- `curry` — protein-and-gravy dishes, dal, sambar, rasam (the old Liquid+Protein slots merged)
- `side` — dry-fried proteins with no gravy (tikka, salmon fry, drumstick), dry vegetable sides, condiments
- `none` — already a complete dish (biryani, fried rice, curd rice, nasi lemak, pasta, sandwiches, rajma-chawal) or not a plate component at all (drinks, fruit, supplements)

Custom foods added **before** v5.2 have no `plateRole` and will not appear in any Plate dropdown
until re-saved — they remain fully usable everywhere else via search. The custom-food form has
carried a plateRole picker since v5.2, so this only affects foods added before that point.

### Oil convention (carried forward, still accurate)
Most fried/roasted preparations have oil baked into their macros already (`oilInclusive:true`).
Plain curries, rice, idli, rasam, sambar, curd, and yogurt do not — log oil/ghee separately for those.

### Accuracy tiers
- **Label-verified:** Greek yogurt (Tesco Finest), Serious Gainz, Boost, and the new Harvest Morn
  Chocolate Protein Granola (Open Food Facts nutrition table, Aldi 400g pack)
- **Recipe-calculated:** Goreng ×2, Chettinad ×2
- **Standard reference ±15%:** most curries, rice, Tamil/Telugu sides, and the 8 new additions
  from this session
- **Rough estimate ±20–25%:** biryanis, shawarma, pasta, takeaway items, Adai/Pesarattu (protein
  varies a lot with lentil ratio), Medu vada (oil absorption varies a lot)

### fibreRisk foods (obstruction risk with the stricture — implemented and live)
Chickpeas masala (tinned), Rajma masala (tinned), Soya chunks masala fry.

---

## SECTION 7 — KNOWN FAILURE MODE: substitute exercises inheriting the wrong equipment info

`findExDef` resolves a substitute exercise by falling back, in order, to: an explicit
`SUB_TYPE_OVERRIDE` entry, then `inferSubWlabel`'s name-pattern guess, then the ORIGINAL
exercise's own `wlabel`/`nt` verbatim. When a substitute's name does not self-describe its
equipment (like "Skull crushers"), and no override exists, it silently inherits whatever the
original exercise's card says — which can be flatly wrong, as it was for Skull crushers,
T-bar row, DB kickback, and Machine tricep dip (all fixed in v5.5).

A permanent test in `tests.js` scans the entire `SUBS` table for the specific signature found
this session (`rope` or `DB weight (one hand)` inherited without an override). **This test will
NOT catch a new, differently-wrong inheritance on a future substitute.** When adding a new
substitute exercise, check its resolved `wlabel` and `nt` by eye against what equipment it
actually uses, do not just trust the existing test to catch it.

The two cases flagged here as deliberately left unfixed — Nordic curl and TKE — were resolved
2026-09-18 once Roshan confirmed his actual setup for each (see Section 3, OI1/OI2). No known
remaining cases of this failure mode as of that date; the permanent programmatic test still only
catches the specific "rope / DB weight (one hand)" signature, so a future substitute still needs
an eyeball check, not just a test run.

---

## SECTION 8 — ARCHITECTURE DECISIONS (carried forward + new this session)

| Decision | Chosen | Reason |
|---|---|---|
| Deployment | Single-file PWA on GitHub Pages | Zero cost, offline, no build process |
| Storage | localStorage | Single user, personal data, works offline |
| Coaching logic | Deterministic arithmetic (Coach namespace) | Cost, latency, offline requirement, hallucination avoidance |
| Plate structure | 3-way Base/Curry/Side | Confirmed by Roshan — a real Tamil/Telugu curry carries protein and gravy together, a separate "Protein" slot was artificial |
| Progress exercise lookup | Reuse `searchExHistory`, extended with a best-ever headline, a forecast, and a mini diagram | Explicitly avoids a second, different exercise-search implementation living alongside History's |
| Recovery-window widening | One mechanism (`combinedModifier = Math.max(...)`), extended three times (energy, protein, RIR) | Genuine multi-day signals of reduced recovery capacity are the same underlying idea; `Math.max` avoids compounding several simultaneous signals into an extreme multiplier |
| Forecasting | Always a range, never a single number/date | Bodies do not progress in a straight line; false precision would be dishonest about how sure any of this can be |
| Adaptive nutrition target | Suggest, then require explicit confirm before applying | A calorie target is not a neutral number for someone with Crohn's — one-tap-to-apply was judged too casual for this specific card |
| Dev workflow (new, 2026-09) | Migrating from claude.ai chat to Claude Code (web, via connected GitHub repo) | Better fit for a single-file-plus-tests repo than pasting file contents through a chat interface |

---

## SECTION 9 — RISK REGISTER

| Risk | Impact | Mitigation | Gap |
|---|---|---|---|
| A test suite passing does not mean the UI is actually right on a real phone | Demonstrated this session — Skull crushers' bug was invisible to all 292 tests passing at the time, found by Roshan in about 30 seconds of real use | 297 tests now, including a permanent scan for this exact bug class | No test in this file has ever rendered in an actual browser. Structural/logic bugs get caught; visual/UX and "does this look right" bugs do not. **Roshan should use the app for real sessions before trusting a new version fully.** |
| More equipment-label mismatches likely exist | Medium-high, given how many substitutes exist | Section 7's audit + permanent test | The test only catches the specific signature found this session, not every possible wrong inheritance |
| Judgement calls made without Roshan's explicit sign-off this session (rest timer durations, adaptive nutrition thresholds, RIR direction interpretation) | Low-medium individually, but several stacked in one session | Disclosed directly to Roshan in chat | Not all have been individually re-confirmed after disclosure — check Section 3 |
| MASTER_PLAN.md going stale again | High if not actively maintained | This rewrite | Requires actual discipline to update every session, especially now that Claude Code will read it as the primary source of truth with no chat history to fall back on |

---

*This document is the single source of truth. Update it at the end of every build session — Claude Code reads it automatically via CLAUDE.md's instruction to do so. No other planning document is authoritative.*
