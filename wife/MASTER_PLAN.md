# ROSHAN FITNESS TRACKER — MASTER REFERENCE
**Single source of truth. Read this before every build session.**  
**Last updated:** 2026-07-13 (v2.2b built — audit + full patch, same day)  
**Supersedes:** ROADMAP_MASTER.md, AUDIT_FULL.md, HANDOVER_v2_0.md (historical only)  
**Canonical copies:** (1) Claude project knowledge — what Claude reads; (2) GitHub repo root — durable backup with version history. Both updated after every build session.  
**Paired with:** roshan_fitness_tracker.html (v2.2b, 1888 lines, 128KB, 88 functions, 73 foods, tests.js 24/24 pass)  
**ID hygiene:** the C1–C5 bug IDs in the retired ROADMAP_MASTER.md refer to DIFFERENT bugs than IDs here. Never reuse an ID across document generations. This document's IDs (N/D/P/E/OQ series) are canonical.

---

## ⚡ START HERE — BUILD RULES (non-negotiable)

1. `str_replace` only. Never rewrite the full file.
2. Edits <200 lines each.
3. `node --check` after every batch.
4. Python surrogate char check after every file write.
5. Function count before/after every build.
6. **No ✅ without an evidence line** (grep string or simulation output). This rule exists because two false ✅ marks were found in AUDIT_FULL.
7. Run `tests.js` before delivery. It is ITEM 0 of the next patch — until it exists, no logic-touching change ships. New logic fixes get their assertion written BEFORE the fix.
8. `present_files` after every delivery.
9. Resolve all open questions before starting any build.
10. Simulate logic-touching changes in Node before delivery.

---

## SECTION 1 — CURRENT STATE (verify at session start)

| Item | Value | Evidence |
|---|---|---|
| Deployed version | v2.2a — v2.2b BUILT, AWAITING DEPLOYMENT | v2.2b delivered 2026-07-13; deploy per Section 6B, then confirm header reads "v2.2b · build 2026-07-13" and update this line |
| Built version | v2.2a | `/home/claude/index.html` |
| HTML lines | 1838 | `wc -l` |
| Functions | 81 | `grep -c "^function "` |
| Foods in DB | 68 | FOODS array parse |
| manifest.json | EXISTS in repo | User confirmed uploaded 3 weeks ago |
| schema_version | NOT IMPLEMENTED | Not in codebase |
| user_profile | NOT IMPLEMENTED | Not in codebase |
| Coach namespace | NOT IMPLEMENTED | Not in codebase |
| Muscle group tags | NOT IMPLEMENTED | No primaryMuscles/secondaryMuscles fields |
| tests.js | NOT CREATED | Does not exist |

---

## SECTION 2 — USER PROFILE (compact)

**Roshan Arasu.** Sheffield. Compliance engineer. Samsung S24 FE + Galaxy Watch FE.

**Goal:** 80-85kg at 14-16% BF via body recomposition.  
**Current:** ~85kg, ~26% BF → ~63kg lean mass, ~22kg fat mass.  
**Timeline:** 12-18 months. Infliximab pending — everything reassesses after week 6-14 post-start.

**Medical (hard constraints — never override):**
- Crohn's disease, active, pre-biologic
- Terminal ileum stricture (~10cm)
- Seton drain (perianal fistula)
- **BANNED:** Squats, deadlifts, Valsalva manoeuvre on ANY heavy load
- **SEATED PRESSING PREFERRED** over standing (less perianal pressure)
- **HIGH-FIBRE FOODS** (chickpeas, rajma, soya chunks): obstruction risk with stricture. Flag on flare days.
- **B12:** malabsorption near-certain (terminal ileum). User just bought oral B12. Note: sublingual or IM injection may absorb better — raise with gastro end of July.
- **VITAMIN D:** Sheffield 53°N + fat-soluble malabsorption + IBD = deficiency near-certain. Raise with gastro.
- **Weight loss rate:** >0.75%/week sustained = flag as possible disease activity, not only success.

**Training:** Push → Pull → Legs+Core → Upper Body, ~4/week, pre-dinner (~6pm), Upper Body ~10-11am.

**Bench press note (user-confirmed):** Wants to push heavy. Last set at 3-4 reps near-failure. Exhale cue is non-negotiable on that set. Strength range (6-8) stays pre-biologic as his decision. Phase 2 post-infliximab does NOT change this — it just expands options.

**Dietary:** Homecooked Tamil + Southeast Asian. Coconut oil only. No coconut in curries EXCEPT Chettinad chicken and coconut rice. No beef. Does not measure portions. Cooks for 2 (wife takes ~40%, he takes ~60%). Big eater.

**Supplements:** Serious Gainz (1.5 scoops post-workout), creatine 5g/day, Boost (250ml whole milk + 3 heaped tsp powder = 1 cup).

**Whey swap decision (2026-07-13):** User CONFIRMED switching to whey isolate — purchase happens when the current Serious Gainz tub finishes. Until then the coachHint ships as planned. Do not re-raise the swap in future audits; check tub status instead (OQ11).

**Goal ownership note:** THIS section owns the target (80–85kg at 14–16% BF, confirmed 2026-07-13). The 85–88kg / 13–16% figures in HANDOVER_v2_0.md and the v1.0 spec are HISTORICAL — an early goal statement, since revised. Never copy the goal from those documents.

**Thursday constraint (added 2026-07-14):** Roshan is STRICT VEGETARIAN every Thursday (no eggs, no meat) — which is Upper Body day. 150g protein on Thursdays must come from soya chunks, paneer, curd, dal, milk, Cowbelle and powder. Future Coach namespace protein logic MUST account for this.

**Sibling app (2026-07-14):** Sweta Fitness v1.0 built for Roshan's wife — separate app, deploys to `wife/index.html` in the same repo (`…github.io/Fitness/wife/`). Shares this app's FOODS array byte-identical (sync rule: when FOODS changes here, copy the block to hers) plus her own additions. Her targets: 53.5→50kg, 1,350 kcal (floor 1,200), 75g protein, veg Mon/Thu/Sat no eggs, cycle tracking, balance-wheel nutrition coach. Her harness: tests_sweta.js. Her app has NO Crohn's logic by design.

**Key nutrition insight not yet in app:** Serious Gainz is a mass gainer (40g carbs per 1.5 scoops, 13.8g protein, 234 kcal). For a 2100 kcal recomposition goal this is counterproductive. A whey isolate gives ~22-25g protein for 110-120 kcal. The swap frees 120 kcal/day and adds ~10g protein. This is the highest-leverage single nutrition change available. Not prescriptive — user's choice — but `coachHint` goes on the Serious Gainz entry.

**Targets:** Protein 150g / Kcal 2100 / Carbs 230g / Fat 65g. Carbs and fat targets NOT YET IN APP (v2.2b). OQ4 CLOSED: 150g protein is appropriate — terminal ileum primarily impairs B12/fat-soluble vitamins, not protein absorption.

---

## SECTION 3 — CONFIRMED BUGS (patch queue, in priority order)

Every item here has a code line reference. No false claims.

### CRITICAL — fix before next data accumulates

**N1. bstats/measurements slice(-52) destroys pre-biologic baseline**  
Evidence: line 1091 `lsS('bstats',all.slice(-52))`, line 1099 `lsS('measurements',all.slice(-52))`  
Impact: 52 weekly entries = 1 year. On a 12-18 month recomp with infliximab mid-way, the pre-biologic baseline is deleted exactly when the before/after comparison is most valuable. 52 entries × ~60 bytes = 3KB — the cap protects nothing.  
Fix: `slice(-52)` → `slice(-260)` on both lines. Two edits.

**D2. Best-set reducer compares weight for bodyweight exercises — pull-up PRs never register correctly**  
Evidence: line 553 `if(valid&&(!b||parseFloat(st.w)>parseFloat(b.w)))return{w:st.w,r:st.r}`  
Impact: Pull-ups at constant bodyweight → set 1 always wins weight comparison → later sets with more reps never selected as best → 10-rep set 3 never triggers PR even if 8 reps in set 1. Signature exercise mismeasured.  
Fix: when `effOrig.inputType==='bodyweight'`, compare `parseInt(st.r)>parseInt(b?.r||0)`. When `inputType==='seconds'`, compare `parseFloat(st.w)>parseFloat(b?.w||0)`. ~4 lines in saveSession.

**N2. High-fibre obstruction flag: no version assigned, ~30 lines, only medical-safety feature**  
Evidence: `fibreRisk` field does not exist anywhere in codebase. Three foods carry obstruction risk with the stricture.  
Fix: add `fibreRisk:true` to soya chunks masala fry, chickpeas masala (tinned), rajma masala. In `logMeal()`, after writing to storage: if food.fibreRisk AND today's `sym:` has `energy<=2` or `bowel==='off'`, show amber line: "High-fibre food on a symptom day — stricture caution."

### HIGH — carry-overs from July 2 audit, never fixed

**C1. "First time" shows when exercise PR exists from different day type**  
Evidence: `last:dayLabel` is day-type-specific. `pr:ExerciseName` is global. Pull-ups PR set on Pull day → Upper body opened first time → `last:Upper body` null → "First time" shown alongside PR badge.  
Fix: in renderEx, when `lx` is null, fallback to `getExHistory(lookupName).slice(-1)[0]`.

**P1. Month-boundary blindness in consistency scoring and skip warnings**  
Evidence: `getSkipWarnings()` at line 401 reads only `mlog:'+monthKey()`. On the 1st of every month, the prior month's training data is invisible. A training week spanning month-end produces false "haven't trained recently" warnings.  
Fix: read both `lsG('mlog:'+monthKey())` and `lsG('mlog:'+prevMonthKey())`, merge, then filter to last N days.

**P2. Apostrophe escaping missing in quickLog onclick handlers**  
Evidence: lines 1463, 1486 use `onclick="quickLog('${fname}',...)` — no escaping. Current food names are safe, but a custom food named "Mum's curry" silently breaks its log button.  
Fix: `fname.replace(/'/g, "\\'")` in both onclick insertions.

**P3. Exhale cues only on Plank — missing from high-intra-abdominal-pressure exercises**  
Evidence: line 258 has "Exhale on entry — no breath holding" on Plank only. Bench press (line 236), Leg press (line 254), Seated cable row (line 247) have no cue despite AUDIT_FULL stating "No Valsalva applies to ALL heavy load breathing."  
Fix: add `nt:'Exhale on each rep — no breath holding under load'` to Bench press (both days), Leg press, Seated cable row.

**P4. No update-available check — manual cache-clear discipline has failed twice**  
Evidence: no self-version fetch anywhere in codebase.  
Fix: on app init, fetch the deployed HTML URL, extract the version string from the response, compare to current. If different, show banner: "New version available — close and reopen to update." ~20 lines.

### MEDIUM — complete the coaching data model

**D1. "3-session overload trend" claimed as ✅ — was never built**  
Evidence: `grep -c "sessionWindow\|last3\|lastN\|slice.*sessions\|window.*3"` returns 0.  
What shipped: PR-aware suggestion (regression-below-PR detection). What was claimed but not built: trend window reading last 3 sessions for noise below the PR line.  
Fix: build in Coach namespace at v2.2c. PR-aware suggestion stays. Trend window adds: reads last 3 `last:dayLabel` sessions for that exercise, takes best across those 3 as the suggestion baseline.

**N3. Backup strategy gap — catastrophic risk item has no interim solution**  
Evidence: `autoBackup()` fires on workout saves only. Food-only days unprotected. JSON goes to Downloads folder where it may be forgotten.  
Fix: (a) "Last backup: N days ago" line on Today tab, amber at 5+ days, red at 10+; (b) `navigator.share()` button converts JSON export to WhatsApp/Drive/email two-tap habit. ~40 lines.

### QUICK WINS — low effort, high value

**Cowbelle Protein Milkshake (Aldi) — confirmed, add to DB**  
Per 100ml: 110 kcal / 7.6g P / 12g C / 2.5g F. Unit: piece (330ml carton = 1 piece). 25g P per carton confirmed.

**Serious Gainz coachHint**  
Add `coachHint:'Mass gainer — 40g carbs/serve works against a 2100 kcal cut. Consider whey isolate: ~2× protein per kcal.'` to Serious Gainz entry. No coaching layer needed — shown in dropdown label.

**Brooklea Protein Yogurt — BLOCKED until sweetener confirmed**  
Product says "Contains added sugars and sweeteners." Need exact sweetener name from physical pot. If sucralose/stevia/erythritol → safe to add. If sorbitol/maltitol/xylitol → DO NOT ADD, contraindicated for Crohn's/stricture.

**Autoregulation banner — energy score already logged, Flare tab already has protocol**  
Evidence: Flare tab lines 1795-1797 define Amber protocol: "Drop weight 20%, cut 1 set, rest 2-3 min, leave before exhaustion." `sym:todayKey().energy` already collected.  
Fix: in active workout render, if `sym.energy && parseInt(sym.energy) <= 2`, show amber banner at top: "Energy score: [score] — Amber protocol today: −20% load, −1 set, leave before exhaustion." Content already written. Connection is ~5 lines.

**Pain/joint logging — missing from entire plan**  
One optional free-text field on session note for "shoulder twinge on bench" type observations. v2.4 correlation engine consumes it. Design now, build at v2.2b.

---

## SECTION 4 — FALSE CLAIMS IN PREVIOUS DOCS (corrected record)

| Claim | Previous status | Actual status | Evidence |
|---|---|---|---|
| 3-session overload trend | ✅ v2.2 | ❌ NEVER BUILT | `grep "sessionWindow"` = 0 |
| Bodyweight PR detection complete | ✅ v2.2 | ⚠️ HALF: checkPR fixed, reducer not | Line 553 still weight-comparison |
| bstats uncapped | Not mentioned | ❌ CAPPED AT 52 | Lines 1091, 1099 |
| High-fibre flagging | ❓ no version | ❌ NO VERSION, NOT IN CODE | fibreRisk field absent |
| "Five becomes four" tab restructure | v3 plan | ⚠️ CONTRADICTION: lists 5 tabs while claiming 4 | Counted: Train/Eat/Body/Journal/History = 5 |
| Progress photos in localStorage | 📋 v2.6 | ❌ INFEASIBLE: 5MB quota, 2-5MB per photo | IndexedDB required |
| Push notifications from GitHub Pages | 📋 v3 | ❌ INFEASIBLE: no server on static host | Needs backend decision |
| HRV from Galaxy Watch | 📋 v2.6 | ❌ CONTRADICTS OWN REJECTION LOG | Part I AUDIT_FULL explicitly rejects Samsung Health bridge |

---

## SECTION 5 — FEATURE REGISTRY

Status: ✅ Built+verified | ⚠️ Partial | 🔧 In patch queue | 📋 Planned | ❌ Infeasible | 🚫 Rejected | ⏳ Deferred

### Core logging
| Feature | Status | Version | Evidence / Notes |
|---|---|---|---|
| Food quick-add | ✅ | v2.0 | logMeal() verified |
| Food auto-fill on select | ✅ | v2.1 | prefillAmt() verified |
| Unit types (piece/ml/tsp/scoop) | ✅ | v2.1 | foodMacros() handles all 5 types |
| Carbs + fat stored per entry | ✅ | v2.2 | All 3 log.push sites include c,f |
| Yesterday food toggle | ✅ | v2.2 | foodKey() / selFoodDay() verified |
| Meal type time-based default | ✅ | v2.2a | defaultMealType() at line 1301 |
| Meal type preserves across entries | ✅ | v2.2a | selQuickMeal(curQuickMeal) at render end |
| oilInclusive flag on 17 dishes | ✅ | v2.2a | grep -c oilInclusive = 17 |
| Workout session logging | ✅ | v1.0 | — |
| PR detection (weight exercises) | ✅ | v1.0 | checkPR() verified |
| PR detection (bodyweight/reps) | ⚠️ | v2.2 | checkPR fixed; best-set reducer STILL BROKEN (D2) |
| PR detection (seconds/plank) | ⚠️ | v2.2 | Same reducer issue — first set wins |
| Drop set 80% prefill | ✅ | v2.2a | Math.round(w*0.8*2)/2 verified |
| Exercise sub persistence | ✅ | v2.2 | persisted_subs in localStorage verified |
| Symptom logging | ✅ | v2.0 | sym:dateKey |
| Water logging | ✅ | v2.0 | water:dateKey |
| Body stats logging | ✅ | v2.0 | bstats array |
| Body water in kg | ✅ | v2.2 | bwUnit:'kg' tag in saveStats |
| Fat mass auto-calculated | ✅ | v2.2 | wt*bf/100 in saveStats |
| bstats retention | ❌ BUG | — | slice(-52) destroys baseline (N1) |
| Plate builder multi-food | ✅ | v2.0 | computePlate() / addPlateToLog() verified |
| Batch-share calculator | ✅ | v2.2 | calcBatchShare() verified |
| Searchable food dropdown | 🔧 | next patch | C2 — native select with 68 items unusable |
| Recent-foods frequency chips | 📋 | v2.2b | Alongside searchable dropdown |
| Open Food Facts text search | 📋 | v2.2b | Free API, no key needed |
| Barcode scanner | 📋 | v2.3 (only if OFF search disappoints) | BarcodeDetector API |
| Free session builder | 📋 | v2.3 | Search-first. No diagram dependency. |
| Creatine daily checkbox | 📋 | v2.3 | 5g/day adherence |

### Weather
| Feature | Status | Version | Evidence |
|---|---|---|---|
| Weather fetch decoupled | ✅ | v2.2 | _wxCache 30-min TTL; renderToday non-async verified |
| Weather blocking fixed | ✅ | v2.2 | injectWeather() fills #wx-slot post-DOM-write |

### Session management
| Feature | Status | Version | Evidence |
|---|---|---|---|
| Change session button | ✅ | v2.2a | _forcePickerOnce flag verified |
| Skip button on picker | ✅ | v2.2 | showSkipSheet() verified |
| Skip records "Rest day" on first time | ✅ | v2.2 | skipSession() uses gd?.label \|\| 'Rest day' |
| Edit session (sequence fix) | ✅ | v2.2 | (seqIdx+3)%4 verified |
| Edit session (draft preserved) | ✅ | v2.2 | saveDraft called in editSession |
| Edit session (data restored) | ✅ | v2.2 | WS rebuilt from ex.exercises in editSession |

### Coaching (current)
| Feature | Status | Version | Evidence |
|---|---|---|---|
| PR-aware overload suggestion | ✅ | v2.2 | getSuggestion reads prKey, returns "work back to PR" |
| 3-session trend window | ❌ NOT BUILT | was claimed v2.2 | grep returns 0 matches |
| Daily protein progress bar | ✅ | v2.2 | renderFood() protein bar verified |
| Daily kcal progress bar | ✅ | v2.2 | renderFood() kcal bar verified |
| Daily carbs + fat bars | 📋 | v2.2b | Targets not in app yet |
| Week snapshot card | ✅ | v2.2 | History reorder verified, "This week" card line 1621 |
| Autoregulation amber banner | 🔧 | next patch | Energy score + Flare protocol already exist, not connected |
| "First time" fallback | 🔧 | next patch | C1 — getExHistory fallback missing |
| Month-boundary blindness | 🔧 | next patch | P1 — mlog reads current month only |

### Coaching (planned)
| Feature | Status | Version | Notes |
|---|---|---|---|
| Coach namespace | 📋 | v2.2c | Pure logic, zero DOM access |
| user_profile in localStorage | 📋 | v2.2b | Configurable targets, phase tracking |
| schema_version + migration | 📋 | v2.2b | Idempotent. Must carry updatedAt on all entries for Supabase LWW later |
| Muscle group tags on all exercises | 📋 | v2.2b | Blocker for recovery coaching + body diagram |
| Volume load per session | 📋 | v2.2b | Semantics: weighted=s×r×w; bodyweight=s×r; timed=total seconds |
| Real 3-session trend window | 📋 | v2.2c | Inside Coach namespace. D1 correction. |
| Daily macro gap coaching card | 📋 | v2.3 | "You need Xg protein at dinner" |
| Session-vs-last feedback card | 📋 | v2.3 | Volume comparison, trend direction |
| Weekly accountability card | 📋 | v2.3 | On Today tab, not History |
| Protein distribution view | 📋 | v2.3 | Pulled forward from v2.4. Data already stored. |
| Monthly report card | 📋 | v2.3 | Pulled forward from v2.5. Cheap, high-value. |
| Quarterly bloods reminder | 📋 | v2.3 | B12 + Vit D + ferritin + albumin. One card. |
| Phase 2 training plan design doc | 📋 | v2.3 | Gated on OQ7. Document first, code later. |
| SVG body diagram | 📋 | v2.3b | Separate from free session. 2D flip. Front/back SVG. No Three.js. |
| Exercise library expansion | 📋 | v2.3b | 60-80 exercises with muscle tags. Includes glute options. |
| Coarse muscle recovery states | 📋 | v2.3b | "Trained <48h / Probably ready / Fresh" — not percentages |
| Crohn's-performance correlation | 📋 | v2.4 | ≥3 co-occurrences before surfacing. Patterns to discuss, never "X causes flares". 8+ weeks data needed. |
| Periodization suggestions | 📋 | v2.4 | Gated on crohnsPhase !== 'pre-biologic' |
| Muscle imbalance detection | 📋 | v2.4 | Only after N5 volume semantics defined. Push:pull ratio. |
| Infliximab response tracker | 📋 | v2.4 | Build alongside Phase 2 plan mechanism |
| Pre/post workout nutrition flag | 📋 | v2.4 | Session time + last meal timestamp already exist |
| Recomp trajectory | 📋 | v2.5 | Faster loss = warning (disease?), not just success |
| Deload auto-schedule | 📋 | v2.5 | After v2.3b amber banner validates the concept |
| Goal milestone with target date | 📋 | v2.5 | Rate-of-loss check built in |
| Sleep quality 1-5 | 📋 | v2.6 | Manual. HH:MM from watch not feasible. |
| Share card | 📋 | v2.6 | Canvas render. Cheap. |
| Creatine + protein streaks | 📋 | v2.6 | **Must have flare-freeze from day one** — skip system already has flare logic, streaks must inherit it |
| HRV tracking | ❌ INFEASIBLE | removed | Samsung Health bridge rejected in own AUDIT_FULL. Energy score is the honest proxy. Cut. |

### Rejected / Infeasible
| Feature | Reason |
|---|---|
| Progress photos in localStorage | 5MB quota. One photo = 2-5MB. IndexedDB required (v3 design decision, not yet scheduled) |
| Push notifications from GitHub Pages | Static host has no server. Chrome cannot schedule local notifications for later. Options: Supabase Edge Functions (makes v3 a real backend) or cut. Decide at v3 design time. |
| Samsung Health / Galaxy Watch direct API | Android SDK bridge not available in PWA. Rejected. Manual entry only. |
| 3D body model (Three.js) | 600KB library + 5-15MB GLTF mesh. 300-800ms tap latency in PWA. Professionals use 2D. Rejected. |
| LLM coaching | Cost, latency, offline requirement, hallucination. Coaching is arithmetic. Rejected. |
| Internet exercise database | Generic DBs suggest restricted movements. Custom curated is safer. Rejected. |
| Adaptive targets (lower the number) | Ratchet-down risk: normalises under-eating. Reframed as adaptive STRATEGY at fixed target. |
| Unilateral balance tracking | Requires per-side data (L/R fields), doubles logging friction. Cut until asymmetry is actually observed. |

---

## SECTION 6 — BUILD SEQUENCE

### v2.2b — SHIPPED 2026-07-13 (all items complete, evidence per line; tests.js 24/24 pass on build, 12 fail on old v2.2a proving detection)
0. ✅ tests.js created — 24 assertions; harness fails against v2.2a (bestSetOf undefined + static checks), passes v2.2b
1. ✅ N1 caps raised — grep: two `slice(-260)`, zero `slice(-52)`
2. ✅ D2 fixed — logic extracted to `bestSetOf(sets,inputType)`; sim: reps 8/10/9 at constant 85kg → best r:10, PR fires
3. ✅ First-time fallback — `histFall=getExHistory(lookupName).slice(-1)[0]` replaces bare "First time"
4. ✅ N2 fibreRisk — 3 flags; `fibreWarnHTML()` + `isSymptomDay()`; warning on plate/quickLog/logMeal; red escalation on symptom days; ⚠ in dropdown
5. ✅ P1 month boundary — `prevMonthKey()`/`mergedMlog()`; skip warnings date-sorted across months; consistency = rolling 28 days, label "consistency (28d)"
6. ✅ P3 exhale cues — grep: 4 new cues (Bench ×2 press, Cable row pull, Leg press push)
7. ✅ P2 apostrophes — both quickLog onclick sites use `.replace(/'/g,"\\'")`
8. ✅ N3 — backup age indicator (green ≤7d / amber ≤14d / red) + `shareBackup()` Web Share with exportData fallback
9. ✅ P4 — `checkUpdate()` fetches live site no-store, compares APP_VERSION, amber banner with cache-clear instruction
10. ✅ Cowbelle entry (110k/7.6p per 100ml, 330ml carton) + Serious Gainz lbl nudge "swap to whey isolate when tub finishes"
11. ✅ Amber protocol banner — energy ≤2 → workout screen card mirroring Flare tab amber wording
12. ✅ BONUS — escaped v2.2a UTC date-key defect found during build: symptom 7-day history in renderProgress used `toISOString()` (wrong day after 11pm BST). Fixed with local key; tests assert no `toISOString` storage reads remain
13. ✅ Foods added per user 2026-07-13 — Gongura chicken (boneless 170k/24p, bone-in 140k/18p), Puli kuzhambu veg (80k, oil inclusive), Egg sandwich 3 eggs + 2 slices + mayo/cheese (~530 kcal / 29g P whole, typ 250g). DB now 73 entries, 20 oilInclusive

### NEXT PATCH QUEUE — EMPTY. Next release: v2.2c (architecture — renamed from v2.2b per version decision 2026-07-13)

### v2.2c — ARCHITECTURE + FOOD SEARCH
- C2: Searchable food picker + recent-foods frequency chips
- Data layer (`Data.*` wrapping all localStorage)
- Coach namespace (pure logic, no DOM)
- user_profile in localStorage (configurable targets, crohnsPhase, biologicStartDate)
- schema_version + idempotent migration + `updatedAt` on all entries (for future Supabase LWW)
- Muscle group tags on all exercises (defines primaryMuscles + secondaryMuscles arrays)
- Volume load semantics defined + calculated on session save
- Real 3-session trend window inside Coach (D1 correction)
- Open Food Facts text search in custom food form
- All 4 macro progress bars (P + C + F + kcal) from user_profile
- Pain/joint optional field on session note

### v2.3 — FREE SESSION + THREE COACHING CARDS
*Precondition: 4+ weeks of real data from v2.2x*
- Free session builder (search-first exercise picker, no diagram dependency)
- Three coaching cards ONLY: daily macro gap / session-vs-last feedback / weekly accountability
- Protein distribution view (30-40g/sitting. Data already stored.)
- Monthly report card (reads, no new data)
- Quarterly bloods reminder card (B12 + Vit D + ferritin + albumin)
- Phase 2 training plan design document (gated on OQ7 — infliximab start date)

### v2.3b — BODY DIAGRAM + EXERCISE LIBRARY
- SVG body diagram: front/back 2D with CSS 3D flip animation
- 60-80 exercises with muscle group tags including glute options
- Coarse recovery states (Trained <48h / Probably ready / Fresh) — NO PERCENTAGES
- Body becomes permanent tab anchor (Tab structure evolves here)
- "How to do it" brief note per exercise (addresses E5 gap)

### v2.4 — INTELLIGENCE EXPANSION
*Precondition: 8+ weeks of real data*
- Crohn's-performance correlation (≥3 co-occurrences, patterns not diagnoses)
- Periodization suggestions (gated on crohnsPhase !== 'pre-biologic')
- Muscle imbalance detection (after volume semantics confirmed working)
- Infliximab response tracker (alongside Phase 2 plan-switch mechanism)
- Pre/post workout nutrition timing flag

### v2.5 — PLANNING
- Recomp trajectory (fast loss = possible disease flag, not celebration)
- Deload auto-schedule
- Goal milestone with target date
- Weekly planner (MUST reconcile with sequence model: planner proposes, sequence is truth, zero guilt UI for missed days)
- Shopping list (raw↔cooked ratio data is a hard precondition — budget this research explicitly)

### v2.6 — WELLNESS
- Sleep quality 1-5 manual
- Recovery score (3 bands: good/moderate/low — NOT 0-100 composite)
- Share card
- Creatine + protein streaks (flare-freeze inherited from skip logic — mandatory)

### v3 — COACHING UI + CLOUD
*Not a rebuild. Reskin of tab structure + Supabase addition.*
- Tab structure: Train / Eat / Body / Journal (History merges into Journal — 4 real tabs)
- Supabase cloud sync (LWW conflict resolution via `updatedAt` timestamps built in v2.2b)
- Push notifications: REQUIRES DECISION — either Supabase Edge Functions (real backend) or cut nudge and use calendar export instead
- PWA manifest + service worker (OQ2 manifest confirmed — extend it)
- Play Store via PWABuilder (£25 one-time, after SW exists)

---

## SECTION 6B — DEPLOYMENT PROCEDURE (ported from retired ROADMAP_MASTER — the project's most failure-prone operation)

**Step 0 — before triaging ANY bug report:** confirm the header version string on the phone matches the latest build (currently "v2.2a · build 2026-07-09"). If it does not match, STOP — it is a cache problem, not a code bug. Two full triage sessions have been wasted on this.

0b. Repo: https://github.com/arasroshan-cell/Fitness — live at https://arasroshan-cell.github.io/Fitness/ (captured 2026-07-13; used by checkUpdate)
1. Rename `roshan_fitness_tracker.html` → `index.html`
2. Upload to the GitHub repo via web UI (Add file → Upload files → Commit)
3. **Commit the updated MASTER_PLAN.md in the same upload** — code and plan travel together
4. Wait 2 minutes for GitHub Pages to publish
5. On the phone, in the BROWSER (not the home-screen icon): clear cached images only, NOT site data — site data holds all logged history
6. Open the app and confirm the header reads the new version + build date
7. Re-add to home screen if the icon was removed

**Fresh-phone / disaster restore runbook** (`importData()` exists at line 420 — the path is real, just undocumented until now):
1. Open the GitHub Pages URL in Chrome on the new phone
2. Progress tab → Data backup card → "Import from backup"
3. Select the most recent `roshan-fitness-*.json` (WhatsApp-to-self / Drive / Downloads)
4. App reloads with full history. Re-add to home screen.
A lost phone is a 5-minute event IF a recent JSON exists — which is why N3's Web Share button matters.

---

## SECTION 6C — MAINTENANCE RULES (so this audit never repeats from scratch)

| When | Update | Where |
|---|---|---|
| End of every build session | Section 1 Current State (with evidence lines), Section 3 patch queue, Section 5 registry, footer date | This file — then upload BOTH canonical copies (project knowledge + GitHub) |
| Any deployment | Section 1 "Deployed version" evidence line with the date the phone header was confirmed | This file |
| Any open question closes | Section 11 status with date and one-line reasoning | This file |
| Goal / targets / medical constraints change | Section 2 only — never anywhere else | This file |
| New bug found | Section 3 with code line evidence; never reuse a retired ID | This file |
| Project state changes materially | One-line update to the fitness-tracker skill's status pointer if it drifts | Skill file (Boss re-uploads) |

Rules: one source of truth per fact. Undated facts are defects. A ✅ without an evidence line is a defect. Superseded documents get a HISTORICAL stamp or get deleted — never left looking current.

---

## SECTION 7 — DATA MODEL (complete localStorage schema)

```
food:YYYY-MM-DD     Array  [{name, amt, unit, k, p, c, f, mealType, time}]
                           c and f added v2.2. Older entries have c:undefined, f:undefined.
                           Migration: treat undefined as 0 in all calculations.

sess:YYYY-MM-DD     Object {date, dl, seqIdx, exercises, note, skipped, skipReason,
                           duration, newPRs, totalVolume(planned v2.2b)}
                           exercises: [{name, origName, best{w,r}, sets, chosenType,
                                       suggestion, isPR, inputType(planned)}]

free_sess:YYYY-MM-DD Object (planned v2.3) Free sessions stored separately

ws_draft:YYYY-MM-DD Object {dl, state, date} — written on every set interaction

last:Push day       Object {date, exercises[{name, origName, best, suggestion, isPR}]}
last:Pull day       Object  Same pattern. Written by saveSession on line 562.
last:Legs + core    Object  Same.
last:Upper body     Object  Same.

last_seq_idx        Number  0=Push 1=Pull 2=Legs 3=Upper. Advances only on saveSession.
last_dl             String  Redundant with above — not actively used

pr:ExerciseName     Object  {w, r, date} — GLOBAL across all day types
                           For bodyweight: w=body weight, r=rep count. PR is on reps.
                           For seconds: w=seconds, r=unused. PR is on w.

bstats              Array   [{date, wt, bf, fm(auto-calc), mm, bw, bwUnit}]
                           CAPPED AT slice(-52) — BUG N1 — fix to slice(-260)
                           Pre-v2.2: bw stored as %. Post-v2.2: bwUnit:'kg' tagged.
                           Migration: if bwUnit absent, treat bw as legacy %.

measurements        Array   [{date, waist, chest, arms}]
                           CAPPED AT slice(-52) — same bug, same fix

mlog:YYYY-MM        Object  {YYYY-MM-DD: {type:'done'|'skip', dl, seqIdx, reason}}
                           P1: only reads current month. Fix: merge with prev month.

sym:YYYY-MM-DD      Object  {energy:1-5, seton:'normal'|'moderate'|'concerning',
                            bowel:'normal'|'off'}

water:YYYY-MM-DD    Number  Glasses logged

biologic_date       String  'YYYY-MM-DD' or '' — infliximab start date

custom_foods        Array   [{name, cat, per100:{k,p,c,f}, typ, unit?, lbl?, oilInclusive?,
                            fibreRisk?(planned)}]

persisted_subs      Object  {origExerciseName: chosenSubName}

schema_version      Number  NOT YET IMPLEMENTED. Plan: 2 at v2.2b.

user_profile        Object  NOT YET IMPLEMENTED. Plan at v2.2b:
                           {targets:{protein:150,kcal:2100,carbs:230,fat:65},
                            weight:85, goalWeight:82, goalBF:15,
                            trainingDaysPerWeek:4,
                            crohnsPhase:'pre-biologic'|'post-biologic',
                            biologicStartDate:null}

last_export         String  Date of last autoBackup trigger
```

---

## SECTION 8 — EXERCISE DATABASE

### RESTRICTIONS (absolute — never suggest or enable)
- Squats (any variation)
- Deadlifts (conventional, Romanian, stiff-leg)
- Valsalva manoeuvre on ANY heavy load — exhale required on every rep

### Push Day — Chest · Shoulders · Triceps
| Exercise | Sets | Reps | Priority | Notes |
|---|---|---|---|---|
| Bench press | 4 | 6–8 | must | Exhale every rep. Last set 3-4 reps near-failure (user preference). User is aware of Valsalva risk. |
| Incline DB press | 3 | 10–12 | optional | Per dumbbell |
| Machine chest fly | 3 | 12–15 | optional | Stack weight |
| Seated DB shoulder press | 3 | 10–12 | must | Seated — seton safety |
| Lateral raises | 3 | 15–20 | optional | Per dumbbell |
| Cable tricep pushdown | 4 | 12–15 | optional | Stack weight |
| Overhead tricep extension | 3 | 12 | optional | DB one hand |

### Pull Day — Back · Biceps
| Exercise | Sets | Reps | Priority | Notes |
|---|---|---|---|---|
| Pull-ups (unassisted) | 4 | Max reps | must | Signature exercise. PR tracking broken until D2 fix. |
| Lat pulldown | 3 | 10–12 | optional | Stack weight |
| Seated cable row | 3 | 10–12 | optional | **Exhale every rep** (P3 fix pending) |
| Single arm DB row | 3 | 12 each | optional | Per arm |
| Face pulls | 3 | 15–20 | must | NEVER SKIP — shoulder health with pressing volume |
| Barbell curl | 3 | 10–12 | optional | Total incl. EZ bar |
| Hammer curls | 3 | 12–15 | optional | Per dumbbell |

### Legs + Core — No squats. No deadlifts.
| Exercise | Sets | Reps | Priority | Notes |
|---|---|---|---|---|
| Leg press | 4 | 12–15 | must | **Exhale every rep** (P3 fix pending) |
| Leg extension | 3 | 15 | optional | Stack weight |
| Seated leg curl | 3 | 15 | optional | Seated preferred |
| Calf raises | 4 | 20 | optional | Add kg if weighted |
| Plank | 3 | 30–60s | must | Exhale on entry ✅ already has cue |
| Dead bug | 3 | 10 each | must | Best Crohn-safe core exercise |
| Cable woodchop | 3 | 12 each | optional | Stack weight |

### Upper Body — Strength + Hypertrophy Mix
| Exercise | Sets | Reps | Priority | Notes |
|---|---|---|---|---|
| Pull-ups | 3 | Max reps | must | PR broken until D2 fix |
| Bench press | 3 | 8–10 | must | Exhale every rep. |
| Arnold press | 3 | 12 | optional | Per dumbbell |
| Cable row | 3 | 12 | optional | Stack weight |
| Bicep curl (BB or DB) | 3 | 12 | optional | **KNOWN ISSUE E1:** one PR key for BB and DB |
| Tricep superset | 3 | 10 each | optional | **KNOWN ISSUE E2:** one field for two movements |
| Plank or dead bug | 3 | — | must | Choice exercise. PR tracks per sub-type. Fixed v2.1. |

### Exercise database known issues
| ID | Issue | Status |
|---|---|---|
| E1 | Bicep curl BB/DB: one PR key for two equipment patterns | Flagged. Low priority. |
| E2 | Tricep superset: one weight field for two movements | Same. |
| E3 | No muscle group tags on any exercise | v2.2b blocker |
| E4 | Exercise library limited to 22 programmed exercises | v2.3b expansion |
| E5 | No "how to do it" guidance for unfamiliar exercises | v2.3b |
| E6 | No Phase 2 training plan | HIGHEST PRIORITY — design doc at v2.3 |
| E7 | Glutes completely untrained | No hinge = zero direct glute work. Add to v2.3b library: machine hip thrust, cable kickback, hip abduction. User confirmed willing to try. |

---

## SECTION 9 — FOOD DATABASE SUMMARY

**68 foods total. 17 with oilInclusive:true.**

### Oil convention
**Oil baked into macros (do NOT log separately):**
Chicken drumstick, Chicken thigh, Egg omelette ×2, Egg dosa, Dosa plain, Nasi goreng, Mee goreng, Beans fry, Potato fry, Mutton varuval, Chettinad chicken ×2, Soya chunks masala, Chickpeas masala, Poriyal, Coconut rice.

**Log separately (Cooking oil / Ghee entry):**
All plain curries, rice, idli, rasam, sambar, curd, yogurt, salmon fry, pomfret fry.

### Accuracy tiers
- **Label-verified:** Greek yogurt (Tesco Finest), Serious Gainz (label confirmed), Boost (Python-calculated from Tesco whole milk + product spec)
- **Recipe-calculated:** Goreng ×2 (user recipe confirmed: 2 eggs, anchovies, 1 chicken breast, 3 tbsp oil, 900g batch, 60% share), Chettinad ×2 (desiccated coconut + coconut oil)
- **Standard reference ±15%:** All curries, rice, Tamil sides
- **Rough estimate ±25%:** Biryanis, shawarma, pasta, takeaway items

### Accuracy flag: Chicken curry protein density
Current: 25g P/100g (boneless). This implies very meaty, low-gravy preparation. For proper Tamil kuzhambu with significant gravy, realistic is 18-22g P/100g. User's specific ratio unknown. Flag as estimate.

### Pending food additions
| Item | Status |
|---|---|
| Cowbelle Protein Milkshake (Aldi, 330ml) | READY TO ADD: 110kcal/7.6g P/12g C/2.5g F per 100ml. Unit:piece. |
| Brooklea Protein Yogurt (Aldi, 221g) | **BLOCKED:** sweetener type unconfirmed from physical label |

### fibreRisk foods (obstruction risk with 10cm stricture)
Flag on these entries once `fibreRisk:true` is added (next patch):
- Soya chunks masala fry
- Chickpeas masala (tinned)
- Rajma masala (tinned)

---

## SECTION 10 — ARCHITECTURE DECISIONS

| Decision | Chosen | Rejected alternatives | Reason |
|---|---|---|---|
| Deployment | Single-file PWA on GitHub Pages | React Native app, backend server | Zero cost, offline, no build process, gym WiFi unreliable |
| Storage | localStorage | Backend DB, cloud-first | Single user, personal data, works offline |
| Coaching logic | Deterministic arithmetic (Coach namespace) | LLM/AI API | Cost, latency, offline requirement, hallucination |
| 3D body diagram | ❌ REJECTED | 2D SVG chosen | Three.js 600KB + 5-15MB mesh, 300-800ms lag in PWA |
| 2D body diagram | SVG with CSS 3D flip animation | Static image | Interactive, offline, ~20-30KB, zero lag |
| Restructure approach | Incremental seam-by-seam | Big Bang rewrite | Rewrites cause regressions; incremental delivers visible progress every version |
| Exercise database | Custom curated | Internet exercise DB | Safety: generic DBs suggest restricted movements |
| Tab structure (current) | Today/Progress/Food/History/Flare | — | Pre-coaching era design |
| Tab structure (v3 target) | Train/Eat/Body/Journal (History merges into Journal) | Five tabs | Coaching-first structure; Body as permanent hub |
| Push notifications | DECISION PENDING for v3 | Static = no server push | Either Supabase Edge Functions or cut. Not a CSS change. |
| Progress photos | IndexedDB (not yet built) | localStorage | 5MB quota, 1 photo = 2-5MB. Hard blocker. |
| Cloud sync | Supabase free tier (v3) | Firebase, custom backend | £0/month for single user. 500MB >> needed. |
| Conflict resolution (Supabase) | LWW via updatedAt timestamps | — | Build `updatedAt` into v2.2b Data layer now |

---

## SECTION 11 — OPEN QUESTIONS

| ID | Question | Blocks | Status |
|---|---|---|---|
| OQ1 | Brooklea yogurt sweetener type (read physical pot) | Food DB addition | BLOCKING |
| OQ2 | manifest.json in repo? | PWA install + Play Store | CLOSED — user confirmed exists |
| OQ3 | B12 supplementation form | Medical coaching card | User bought oral B12. Raise form question with gastro end of July. |
| OQ4 | Protein absorption adjustment | Target calibration | **CLOSED.** Terminal ileum mainly impairs B12/fat-soluble vitamins, not protein. Keep 150g. |
| OQ5 | Phase 2 training plan design | Post-biologic programme | OPEN — design doc needed at v2.3 |
| OQ6 | High-fibre food flagging | Medical safety feature | RESOLVED — in next patch (fibreRisk flag, 30 lines) |
| OQ7 | Infliximab start date | Phase 2 plan timing | OPEN — gastro appointment end of July |
| OQ8 | Expanded exercise library (60-80 exercises with muscle tags) | Body diagram + free session | OPEN — research needed before v2.3b |
| OQ9 | Bicep curl BB/DB split — user preference | Exercise DB cleanup | Not asked yet |
| OQ11 | Whey isolate purchase — pending current Serious Gainz tub finishing | Nutrition upgrade | DEFERRED BY USER 2026-07-13. Check tub status when it comes up; do not re-litigate the decision. |
| OQ12 | One-time portion calibration: weigh his typical rice + curry serve once, adjust `typ` defaults to reality | Food log accuracy (bigger lever than any per-100g refinement) | OPEN — proposed 2026-07-13, needs one kitchen-scale session |
| OQ10 | Protein target adequacy given malabsorption | Target calibration | **CLOSED with OQ4.** 150g is appropriate. |

---

## SECTION 12 — RISK REGISTER

| Risk | Impact | Probability | Current mitigation | Gap |
|---|---|---|---|---|
| Data loss (localStorage eviction) | Catastrophic | Medium | storage.persist() added | Cloud sync not until v3. Interim: Web Share export button (next patch). |
| Stale cache (wrong version running) | Medium | High (happened twice) | Version stamp in header + JS init | P4 update banner still missing |
| High-fibre food causing obstruction | High | Low-medium with stricture | Food in DB | fibreRisk flag not yet built — in next patch |
| Coaching suggestions contradicting medical advice | High | Medium | Manual review only | All coaching needs "discuss with gastro" caveat built in |
| Infliximab changes everything | Positive, disruption | Certain | Milestone date field | Phase 2 plan not designed. OQ5/OQ7. |
| Best-set reducer wrong for pull-ups | Medium | Certain (active bug) | Nothing | D2 fix in next patch |
| bstats cap destroys pre-biologic baseline | High | Certain over time | Nothing | N1 fix in next patch |
| Feature count (~40 planned) causes regression | Medium | Medium | tests.js planned | tests.js not yet created |
| False ✅ claims causing wrong build decisions | Medium | Demonstrated (happened twice) | Evidence line rule (new) | tests.js not yet running |

---

## SECTION 13 — FINANCIAL MODEL

| Item | Cost |
|---|---|
| GitHub Pages | £0/month |
| Open Food Facts API | £0 (free public API) |
| Supabase (v3 cloud sync) | £0/month on free tier (500MB >> needed for 1 user) |
| Google Play Store listing | £25 one-time |
| Total to v3 | **£25 maximum** |

Cost trigger: if ever shared with multiple users, Supabase free tier limit (~10 users at ~50MB each). Pro tier: £25/month.

---

## SECTION 14 — SUCCESS METRICS PER VERSION

These exist so "done" means something testable, not just "code shipped."

| Version | Done when |
|---|---|
| Next patch | All 12 items in bug list verified in Node sim. tests.js runs clean. bstats cap removed. D2 sim: constant BW + rising reps → PR fires correctly. |
| v2.2b | All 4 macro bars render from user_profile (not hardcoded). Coach.getDailyStatus() returns correct gaps. tests.js passes with muscle tag assertions. |
| v2.3 | Roshan consults a coaching card unprompted ≥3 times/week for 2 consecutive weeks. |
| v2.3b | Roshan uses body diagram to select an exercise for a free session without being prompted. |
| v2.4 | One Crohn's-performance pattern surfaces that is worth mentioning to the gastroenterologist. |
| v3 | App reinstalled from Play Store on a fresh device. All historical data syncs from Supabase in <30 seconds. |

---

*This document is the single source of truth. Update it at the end of every build session. No other planning documents are authoritative.*
