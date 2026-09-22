# ROSHAN FITNESS TRACKER — MASTER REFERENCE
**Single source of truth. Read this before every build session.**
**Last updated:** 2026-09-22
**Supersedes:** the v2.2a version of this document (2026-07-12), ROADMAP_MASTER.md, AUDIT_FULL.md, EVALUATION_v2_2a_COMPLETE.md, HANDOVER_v5_0.md
**Paired with:** index.html (v5.6, 3874 lines, 164 functions), tests.js (350 assertions, all passing at last check)

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
| Deployed/built version | v5.6 | title tag + `APP_VERSION` const in index.html |
| HTML lines | 3874 | `wc -l` |
| Functions | 164 | `grep -c "^function "` |
| Foods in DB | 83 (74 base + 8 Tamil/Telugu additions + 1 Aldi granola) | FOODS array parse |
| fibreRisk foods | 3 | Chickpeas masala, Rajma masala, Soya chunks masala fry |
| oilInclusive foods | 28 | FOODS array parse |
| tests.js | EXISTS, 350/350 passing | last full run this session |
| Post-delivery audit (2026-09-22) | 16 real bugs found and fixed across 10 review rounds before merge, per Roshan's "audit then merge if clean" request | See Section 6D |
| Ghost-recorded exercises (untouched prefilled sets counted as performed) | FIXED v5.6 | `bestSetOf`/`saveSession` now require `st.done===true`; `notPerformed` flag added |
| Historical PR/volume repair pass | BUILT v5.6, not yet run against Roshan's real data | "Repair ghost-recorded PRs" button, Data backup card — dry-run diff shown before any commit |
| Free/Suggested session completion screen | FIXED v5.6 | `saveSession` now clears `adHocDay`/`adHocSeqIdx`/`editingDate` on real save |
| Share backup silent failure | FIXED v5.6 | Falls back to `exportData()` on any `navigator.share` rejection |
| Past-date session editing | FIXED v5.6 | `editSession(dateKey)` parametrised; History rows tap-to-edit |
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
| OI7 | 2 July body-stats entry: `fm:217` (physically implausible at 84kg/25% BF) | **OPEN — Roshan chose to leave it flagged, not corrected, 2026-09-22.** Data lives in his phone's localStorage, not in this repo — cannot be verified or fixed from Claude Code. Ask for the real figure directly if this comes up again. |
| OI8 | FIX 6 equipment-label audit | **RESOLVED 2026-09-22.** See Section 6C. Calf raises fixed directly (pendulum squat machine, plates loaded — Roshan confirmed). Overhead tricep extension, T-bar row, Pendulum/hack squat, and Skull crushers all split into genuinely separate, correctly-labeled exercises per Roshan's explicit rule ("ALL LABELS MUST MATCH EXERCISE, not combined for substitutes") — old combined entries kept fully untouched and resolvable since Roshan confirmed he has real historical logs under some of them. Smith machine row, flagged in the v5.6 task as broken, was already correct via existing `inferSubWlabel` smith-machine pattern matching — no fix needed there, the task's claim was wrong. |

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

## SECTION 6C — v5.6 BUILD TASK: COMPLETED VS DEFERRED (2026-09-22)

| Item | Status | Notes |
|---|---|---|
| FIX 1 — Ghost-recorded exercises | **DONE** | `bestSetOf` requires `st.done===true`; `saveSession` adds `notPerformed`, gates `exVolume`/`isPR` on real done sets. 6 tests added, reproducing the exact mechanism (undone prefilled sets, zero-done exercises, partial completion) using the named real cases as fixtures. Visible in the Today completion card as "Not performed". |
| FIX 2 — Historical data repair | **BUILT, not yet run against real data** | `repairHistoricalSessions(dryRun)` + `runHistoricalRepair()` button (Data backup card). Dry-run diffs before any write; only ever touches `sess:` keys, never food/symptom/bstats logs; chronological PR replay confirmed correct in sandboxed tests (5 tests). **Cannot be run against Roshan's real data from Claude Code — localStorage lives on his phone.** He needs to tap the button himself; the in-app confirm dialog shows the diff before committing, satisfying the "confirm before running against real data" requirement at the point where it actually matters. |
| FIX 3 — Free/Suggested completion screen | **DONE** | `adHocDay`/`adHocSeqIdx`/`editingDate` cleared inside `saveSession`'s success path. Implemented session-type-agnostic rather than gated to Free/Suggested specifically — the underlying code defect (`adHocDay` never cleared after save) applies to every session type equally; gating it artificially would have left the same latent bug for structured days. 2 tests added. |
| FIX 4 — Share backup silent failure | **DONE** | `.catch(()=>{exportData();})` — any rejection falls back to the working download path. 1 test added. |
| FIX 5 — Past-date session editing | **DONE** | `editSession(dateKey)` parametrised, defaults to today for backward compatibility. History's last-14-days rows are tap-to-edit (skipped days excluded). `last_seq_idx` rotation now only fires when editing *today's* own structured session, so reopening an old day can't desync the next-suggested day. 5 tests added. |
| FIX 6 — Equipment label audit | **DONE, including a structural follow-up Roshan asked for same-session** | Full `DAYS`+`SUB_TYPE_OVERRIDE` `wlabel` sweep found: Overhead tricep extension contradicting its own "Rope attachment" cue; Calf raises phrased like the bodyweight-plus-add-on convention despite `inputType:'weight'`; T-bar row and the Pendulum/hack squat substitute each naming two different pieces of equipment in one label; Skull crushers doing the same (EZ bar or Smith bar). Smith machine row, which the task claimed was broken, was already correct via `inferSubWlabel` — no fix needed, the task was wrong. Calf raises fixed directly (Roshan confirmed: pendulum squat machine, plates loaded). For the other four, Roshan's rule was "ALL LABELS MUST MATCH EXERCISE, not combined for substitutes" — so each was split into genuinely separate exercises rather than just relabeled: **Overhead tricep extension**'s primary wlabel corrected to match its own rope cue (Stack weight), plus a new **One-hand DB overhead extension** substitute added. **T-bar row (machine)** and **T-bar row (landmine)** added alongside the old combined **T-bar row**. **Pendulum squat machine** and **Hack squat machine** added alongside the old combined **Pendulum/hack squat machine** substitute (now with an explicit wlabel instead of relying on generic inference). **Skull crushers (EZ bar)** and **Skull crushers (Smith bar)** added alongside the old combined **Skull crushers**. All four old combined entries were deliberately left completely untouched, not removed or renamed — Roshan confirmed he has real historical sessions logged under some of them, and removing an entry from `SUBS` would make `findExDef` return null for any old session still referencing that name, breaking History/Progress lookups for that data. 11 new tests added covering both the split entries and the old ones' continued resolvability. |
| FIX 7 — Nordic curl / TKE cleanup | **SKIPPED — task was wrong** | Task claimed Roshan has no GHD/partner access, contradicting his direct confirmation earlier this same session (used to resolve OI1 in v5.5). Roshan reconfirmed 2026-09-22: he does have GHD access. v5.5's fix stands unchanged. TKE clause was already moot — TKE was removed entirely from `SUBS` in v5.5 per OI2, nothing left to override. |
| FIX 8 — 2 July `fm:217` body-stats correction | **DEFERRED per Roshan's own choice** | Data lives in his phone's localStorage, not this repo — Claude Code has no way to read or verify it. Roshan chose to leave it flagged rather than guess. See OI7. |

---

## SECTION 6D — POST-DELIVERY AUDIT (2026-09-22): 16 real bugs found and fixed before merge

Roshan asked for a full audit before merging v5.6, conditioned on the result being clean. It was not
clean on the first pass, or the second, or several after that. The `/code-review` skill (high effort,
independent of the code that had just been written) was run 10 times against the branch, fixing real
findings between each run, until a pass came back with nothing new. 16 genuine bugs were found this way
— none were present in the original delivery's own 300+ tests, since those tests were written by the
same pass that wrote the code. One claimed finding (a supposed `"undefined"` string written to
localStorage) was checked and found to be **false** — `lsG`'s missing-key handling already guards
against it — and was not "fixed", since fixing something that is not broken is its own risk.

| # | Bug | Fix |
|---|---|---|
| 1 | `repairHistoricalSessions` keyed `checkPR` by the originally-scheduled exercise (`e.origName`) instead of the one actually performed (`e.name`), fabricating a PR under the wrong exercise when a substitute was used | Keyed by `e.name` (with an `e.origName` fallback for legacy records missing `.name` — see #15) |
| 2 | `saveSession`'s new `!explicitDate` guard (added to fix the completion-screen bug) also silently skipped `setLast`/`last_seq_idx` for `resolveStaleDraftSave`'s genuinely-most-recent backfill save, not just `editSession`'s re-save of an already-old session | Gated on the more specific `editingDate` signal instead of the generic `explicitDate` parameter |
| 2b | Same gate, structured-day case | Same fix, confirmed for `DAYS`-indexed sessions too |
| 3 | A dry-run repair *preview* (which `runHistoricalRepair` always runs first) permanently re-stamped today's date onto a genuine old PR via `Data.pr.set`'s automatic `date:todayKey()` | Added `Data.pr.restore(name,record)` — writes an exact record with no auto-dating — for the dry-run revert path |
| 3b | The same date-loss bug on the real (committed) repair run — the dry-run fix alone didn't cover the only run that actually persists | `Data.pr.restore` used for the real run's write too, with the session's actual `dateKey` |
| 4 | `affectedNames` (the repair's pre-reset backup set) was keyed only by `e.name`, so any legacy `pr:` record under the old `e.origName` key would never be touched by the repair — permanent orphaned data | Both `e.name` and `e.origName` added to `affectedNames` |
| 5 | `editingDate` is a session-lifetime global cleared only on successful save — abandoning an `editSession()` edit and starting a genuinely different session (`startSession`/`startFreeSession`) carried the stale date into the new save, silently overwriting the wrong date's data | `editingDate=null` added to both `startSession` and `startFreeSession` |
| 6 | Same class of bug at a third call site: `resolveStaleDraftSave` didn't reset `editingDate` either | `editingDate=null` added there too |
| 7 | `Data.pr.restore` dropped `checkPR`'s `w:best.w||'0'` fallback for bodyweight exercises logged with no added weight, writing an empty string into the PR record | Fallback restored |
| 8 | (folded into #5/#6 — no separate fix) | — |
| 9 | `editSession` unlocking a past date called `saveDraft`, which writes to the single `ws_draft:<today>` slot — silently clobbering a genuinely different, in-progress *today* workout draft | `saveDraft` now only called when editing *today's own* session |
| 10 | `computeExVolume`'s calculation was duplicated verbatim between `saveSession` and `repairHistoricalSessions` — a maintenance hazard, not yet a live bug | Extracted into one shared `computeExVolume(doneSets,inputType)` function |
| 11 | `skipSession` didn't discard a stale `adHocDay` left over from an abandoned past-date edit, so skipping mid-abandoned-edit recorded *today's* skip under the *old edited session's* label | `skipSession` now resets `adHocDay`/`adHocSeqIdx`/`editingDate` when `editingDate` is set |
| 12 | `fmtCompletedBest` returned a blank result for a genuinely completed bodyweight exercise logged with no added weight (gated on `best.w` universally instead of the type-appropriate field) — undermining FIX 1's own "don't show blank, show a real result or Not performed" goal | Gates on the correct field per `inputType` |
| 13 | Editing a past date deletes the original record immediately with no draft backup (unlike today's edits) — abandoning the edit loses the original permanently | **Real fix built, not just disclosed** (Roshan's explicit call — see #17/#18): `Data.draft` given a `dateKey`-scoped slot instead of the single `ws_draft:<today>` one |
| 14 | `checkPR` always stamped `date:todayKey()` internally — editing an old session and hitting a genuine new PR during that edit recorded the PR as achieved "today" instead of on the session's real date. This was the same bug class already fixed for the repair tool (#3/#3b) but left live on the ordinary save path | `checkPR` takes an explicit `date` parameter (defaults to today); `saveSession` passes `saveDate`, `repairHistoricalSessions` passes `dateKey` — one shared, root-level fix instead of two patches |
| 15 | Repair would corrupt/orphan data under a `pr:undefined` key for any legacy session record missing the `.name` field (a schema shape old enough to predate the migration wipe of `pr:` keys, which never touched `sess:` keys) | Falls back to `e.origName` when `e.name` is absent |
| 16 | `computeExVolume`'s `reps_each` branch read `st.r` (always empty for reps_each sets, which store their single value in `.w` — confirmed by `bestSetOf` and `fmtCompletedBest` both already reading `.w`), silently zeroing volume for every reps_each exercise (Dead bug, etc.) in every saved and repaired session. **Pre-existing since before this session** — relocated verbatim during the #10 dedup, caught while extracting the shared helper | Reads `st.w` |
| 17 | `Data.draft` given a `dateKey`-scoped `save`/`clear`, `findAny()` prioritises today's own draft then falls back to any other dated one, `discardStaleDraft` clears only the specific stale draft — replacing the earlier disclose-only mitigation for #13 | `editSession` now calls `saveDraft(ex.dl,dateKey)` unconditionally under the edit's own date; `saveSession`/`skipSession` clear only the date actually being saved, not every draft |
| 18 | **Found auditing #17's own fix**: ~15 mid-edit autosave call sites (`togDone`, `updSet`, `setRIR`, `addSet`, `removeSet`, the note/painNote inputs, `pickSub`, etc.) all call `saveDraft(dl)` with no `dateKey` — every one of them defaulted back to `ws_draft:<today>` regardless of what date was actually being edited, so the very first tap during a past-date edit re-clobbered today's real draft, reopening #9/#13 immediately after #17 closed it | `saveDraft(dl,dateKey)` now falls back to `dateKey\|\|editingDate\|\|todayKey()` — a single root-level fix, no changes needed at any of the ~15 call sites |
| 18b | **Found auditing #18's own fix**: the boot-time stale-draft check only ran `if(!Data.session.get())`, so an abandoned past-date edit's draft was never surfaced for recovery once today already had *any* session recorded (a skip counts) — permanently orphaned even though the data technically still existed | Restructured to check for an other-dated draft unconditionally, independent of today's session state; only the "restore today's own draft directly into WS" branch stays gated on `!todaySession` |
| 19 | **Found auditing #17/#18's own fix, the most severe of the three**: `editSession()` overwrites `WS[dl]` in memory with the historical session's data, and `initWS()` (which every render of the active-workout view calls) trusted an already-populated `WS[dl]` as-is with no way to tell it apart from today's real data. Editing an old session sharing today's own day label (e.g. an old "Push day"), then abandoning the edit and resuming today's real "Push day", silently kept the *old* session's data in memory — saving from there would have fabricated today's record, PR and volume from a years-old session | Every `WS[dl]` assignment now carries a `_forDate` tag (the date it actually represents). `initWS` checks the tag: if it doesn't match today *and* doesn't match the currently in-progress `editingDate` (i.e. genuinely abandoned, not still being edited), it discards the stale slot and recovers today's own real draft via a new `Data.draft.get(dateKey)` targeted lookup, or falls through to a fresh build |
| 19b | Companion correctness check for #19: the `_forDate` re-tagging itself needed to *not* fire while an edit is still genuinely in progress, or it would silently relabel an active old-date edit as "today's," breaking the invariant the moment a mid-edit re-render happened | Re-tagging is skipped whenever `WS[dl]._forDate` already equals the current `editingDate` |

#13/#17/#18/#18b/#19/#19b are one continuous chain: each fix was audited, and each audit pass found a
real gap the previous fix left open, three levels deep. This is why the audit ran 13 rounds instead of
stopping after 2 or 3 — a fix that hasn't been independently re-audited isn't trustworthy just because
it addressed the finding it was written for.

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
