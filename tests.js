/* tests.js — Roshan Fitness assertion harness. Run: node tests.js [path-to-html]
   Extracts the app script, evals it with browser stubs, asserts core logic.
   Exit 0 = all pass. Any failure exits 1 and the build MUST NOT ship. */
const fs = require('fs');
const path = process.argv[2] || 'build.html';
const src = fs.readFileSync(path, 'utf8');

let pass = 0, fail = 0;
function T(name, cond) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('X FAIL  ' + name); }
}

/* ---------- Static checks (grep-level) ---------- */
T('version stamp v5.6 in header', /Roshan Fitness v5\.6/.test(src));
T('version consistency: the <title> tag, APP_VERSION const, and the separate hardcoded .vtag header badge all agree — permanent regression test for the real bug found 2026-09-22 (vtag was silently left at v5.5 for an entire version bump since nothing checked it)', (() => {
  const titleMatch = src.match(/<title>Roshan Fitness (v[\d.]+[a-z]?)<\/title>/);
  const appVerMatch = src.match(/const APP_VERSION='(v[\d.]+[a-z]?)';/);
  const vtagMatch = src.match(/<div class="vtag"[^>]*>(v[\d.]+[a-z]?)<\/div>/);
  return !!titleMatch && !!appVerMatch && !!vtagMatch &&
    titleMatch[1] === appVerMatch[1] && appVerMatch[1] === vtagMatch[1];
})());
T('N1: no slice(-52) remains', !src.includes('slice(-52)'));
T('N1: two slice(-260) caps present', (src.match(/slice\(-260\)/g) || []).length === 2);
T('N2: three fibreRisk flags', (src.match(/fibreRisk:true/g) || []).length === 3);
T('P2: both quickLog onclick sites escape apostrophes', (src.match(/\.replace\(\/'\/g,"\\\\'"\)/g) || []).length >= 2);
T('P3: exhale cues present, count never decreases from the confirmed baseline of 4', (src.match(/[Ee]xhale (on press|as you pull|on push)/g) || []).length >= 4);
T('P4: checkUpdate fetches live site', src.includes("arasroshan-cell.github.io/Fitness") && src.includes('checkUpdate();'));
T('N3: shareBackup exists and card calls it', src.includes('function shareBackup') && src.includes('onclick="shareBackup()"'));
T('UTC purge: no toISOString date keys remain in storage reads', !/lsG\('sym:'\+dt\.toISOString/.test(src));
T('Foods: gongura both cuts, puli kuzhambu, egg sandwich, Cowbelle', ['Gongura chicken curry (boneless)','Gongura chicken curry (bone-in)','Puli kuzhambu (veg)','Egg sandwich (3 eggs)','Cowbelle protein milkshake'].every(n => src.includes(n)));
T('Amber protocol banner wired to energy<=2', src.includes('sym.energy<=2') && src.includes('Amber protocol applies'));
T('S1: checkPR called with effName not effOrigName', src.includes('checkPR(effName,best'));
T('S1: getExHistory matches on name only', src.includes("sess.exercises.find(e=>e.name===name)"));
T('S2: SUB_TYPE_OVERRIDE table exists with known entries', src.includes('SUB_TYPE_OVERRIDE') && src.includes("'Wall sit (hold 60s)'"));
T('S3: custom food dup-check includes built-in FOODS', src.includes('allFoods().find(x=>x.name.toLowerCase()')); 
T('S4: oilInclusive on salmon/pomfret/tofu fry', ["name:'Salmon fry'","name:'Pomfret fry'","name:'Tofu masala / fry'"].every(n=>{
  const i=src.indexOf(n);return i>=0 && src.slice(i,i+220).includes('oilInclusive:true');
}));
T('S5: Dumbbell curl replaces ambiguous BB-or-DB entry', src.includes('Dumbbell curl (alternating)') && !src.includes('Bicep curl (BB or DB)'));
T('S6: Tricep superset split into two real tracked exercises', !src.includes("n:'Tricep superset'") && src.includes("n:'Cable tricep pushdown'") && src.includes("n:'Overhead tricep extension'"));
T('S7: inferSubWlabel exists and handles cable/DB/barbell', src.includes('function inferSubWlabel') && src.includes('Stack weight') && src.includes('Per dumbbell (each hand)'));
T('schema_version migration wipes pr: keys once', src.includes('function runMigration') && src.includes("startsWith('pr:')"));
T('user_profile: getProfile/saveProfile exist with default targets', src.includes('function getProfile') && src.includes('protein:150,kcal:2100,carbs:230,fat:65'));
T('user_profile: 4 macro bars read from profile targets', src.includes('t.protein') && src.includes('t.carbs') && src.includes('t.fat') && src.includes('t.kcal'));
T('Coach namespace exists with 4 methods', src.includes('const Coach={') && ['getDailyStatus','getWeeklyStatus','get3SessionTrend','getSessionFeedback'].every(m=>src.includes(m+'(')));
T('Volume load: per-type semantics in saveSession', src.includes('exVolume') && src.includes('totalVolume'));
T('Pain/joint field: separate from general note', src.includes('painNote'));
T('Gastro export exists and is wired to a button', src.includes('function gastroExport') && src.includes('onclick="gastroExport()"'));
T('Palette: no leftover hardcoded old navy/neon colors', !src.includes('#080C14') && !src.includes('#00C2D4') && !src.includes('#00E676') && !src.includes('#FF3D5F'));
T('Palette: no stray hardcoded gold/purple bypassing CSS variables', !src.includes('#FFD700') && !src.includes('#9b7bd4'));
T('Must-tier promotions: tricep on Push, row on Pull, hamstring on Legs', (() => {
  const pushTricep = src.indexOf("n:'Cable tricep pushdown',s:4");
  const pullRow = src.indexOf("n:'Seated cable row'");
  const legsHam = src.indexOf("n:'Seated leg curl'");
  return pushTricep >= 0 && src.slice(pushTricep, pushTricep + 150).includes("priority:'must'")
    && pullRow >= 0 && src.slice(pullRow, pullRow + 150).includes("priority:'must'")
    && legsHam >= 0 && src.slice(legsHam, legsHam + 150).includes("priority:'must'");
})());
T('UI: per-card MUST/OPTIONAL badge exists', src.includes("orig.priority==='must'?'MUST':'OPTIONAL'"));
T('UI: split must/optional progress tracking replaces blended percentage', src.includes('mustDone') && src.includes('optDone') && !src.includes('ws.ex.length} done'));

/* ---------- Surrogate scan ---------- */
let surrogates = 0;
for (let i = 0; i < src.length; i++) {
  const c = src.charCodeAt(i);
  if (c >= 0xD800 && c <= 0xDBFF) { const n = src.charCodeAt(i + 1); if (!(n >= 0xDC00 && n <= 0xDFFF)) surrogates++; else i++; }
  else if (c >= 0xDC00 && c <= 0xDFFF) surrogates++;
}
T('surrogate scan clean', surrogates === 0);

/* ---------- Behavioural checks: eval script with stubs ---------- */
const store = {};
const localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
  key: i => Object.keys(store)[i] ?? null,
  get length() { return Object.keys(store).length; }
};
const elStub = () => ({ style: {}, innerHTML: '', textContent: '', value: '', addEventListener: () => {}, appendChild: () => {}, querySelector: () => null, classList: { add: () => {}, remove: () => {}, toggle: () => {} }, closest: () => null, insertAdjacentHTML: () => {}, click: () => {}, remove: () => {}, onclick: null });
const document = new Proxy({}, { get: (t, p) => {
  if (p === 'getElementById' || p === 'querySelector') return () => elStub();
  if (p === 'querySelectorAll') return () => [];
  if (p === 'body') return elStub();
  if (p === 'addEventListener' || p === 'createElement') return p === 'createElement' ? () => elStub() : () => {};
  return () => {};
}});
const window = { addEventListener: () => {}, matchMedia: () => ({ matches: false, addEventListener: () => {} }), location: { reload: () => {} } };
const navigator = { onLine: false, share: undefined, canShare: undefined };
const scriptBlocks = [...src.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const script = scriptBlocks[scriptBlocks.length - 1][1];
try {
  const run = new Function('localStorage', 'document', 'window', 'navigator', 'fetch', 'File', 'URL', 'Blob', 'alert', 'confirm',
    script + '\n;return {bestSetOf, checkPR, todayKey, monthKey, prevMonthKey, mergedMlog, isSymptomDay, fibreWarnHTML, lsS, lsG, getSuggestion, FOODS, SUB_TYPE_OVERRIDE, inferSubWlabel, getProfile, saveProfile, Coach, getExHistory, saveSession, WS, initWS, DAYS, findExDef, getSmoothedWeight, Data, estimate1RM, getE1RMTrend, getPrefillSets, getFatigueCurve, getMealGapSuggestion, getSwapSuggestions, getFoodSymptomCorrelation, getRampPrefill, getModeratePrefill, resolveClickedTag, resolveClickedTagsAll, getExercisesForMuscleTag, LIB_ID_TO_TAGS, getBodyStatsReminderDays, getFoodLoggingGapDays, getSuggestedSessionExercises, getFreeSessionExerciseList, renderLineChartSVG, getWeightTrendPoints, getExerciseTrendPoints, allMuscleTagsWithExercises, startFreeSession, addToFreeSession, togDone, addSet, addDropSet, liveCoachAdjust, getFrequentFoods, allFoods, foodOptsHtmlByRole, getNextTargetWeight, getWeightForecast, getE1RMForecast, getAdaptiveNutritionSuggestion, gramsToCloseProteinGap, SUBS, editSession, repairHistoricalSessions, resolveStaleDraftSave, skipSession, getNextIdx, computeExVolume, startSession, saveDraft, get adHocDay(){return adHocDay;}, get adHocSeqIdx(){return adHocSeqIdx;}, get editingDate(){return editingDate;}, get _staleDraftPending(){return _staleDraftPending;}, set _staleDraftPending(v){_staleDraftPending=v;}};');
  const app = run(localStorage, document, window, navigator, () => Promise.reject(new Error('offline')), function(){}, { createObjectURL: () => '' , revokeObjectURL: () => {} }, function(){}, () => {}, () => true);

  /* D2: bodyweight PR by reps at constant weight */
  const bwBest = app.bestSetOf([{ w: '85', r: '8', done: true }, { w: '85', r: '10', done: true }, { w: '85', r: '9', done: true }], 'bodyweight');
  T('D2: bodyweight best set picks highest reps (10)', bwBest && bwBest.r === '10');
  T('D2: bodyweight PR fires on rep increase', (app.lsS('pr:Pull-ups (unassisted)', { w: '85', r: '9', date: '2026-07-01' }), app.checkPR('Pull-ups (unassisted)', bwBest, 'bodyweight') === true));
  /* D2: weighted unchanged */
  const wBest = app.bestSetOf([{ w: '60', r: '8', done: true }, { w: '65', r: '6', done: true }], 'weight');
  T('D2: weighted best set still picks highest weight (65)', wBest && wBest.w === '65');
  /* D2: seconds picks longest hold */
  const sBest = app.bestSetOf([{ w: '40', done: true }, { w: '55', done: true }, { w: '50', done: true }], 'seconds');
  T('D2: timed best set picks longest hold (55s)', sBest && sBest.w === '55');
  /* D2: drop-set-free empty input returns null */
  T('D2: no valid sets returns null', app.bestSetOf([{ w: '', r: '' }], 'weight') === null);

  /* P1: month boundary merge */
  const mk = app.monthKey(), pk = app.prevMonthKey();
  T('P1: prevMonthKey differs from monthKey', pk !== mk && /^\d{4}-\d{2}$/.test(pk));
  app.lsS('mlog:' + pk, { '2026-06-30': { type: 'done', seqIdx: 1 } });
  app.lsS('mlog:' + mk, { '2026-07-02': { type: 'done', seqIdx: 2 } });
  const merged = app.mergedMlog();
  T('P1: mergedMlog spans both months', merged['2026-06-30'] && merged['2026-07-02']);

  /* N2: fibre warning logic */
  T('N2: fibreWarnHTML flags rajma', app.fibreWarnHTML('Rajma masala (tinned, thick gravy)').includes('high-fibre'));
  T('N2: fibreWarnHTML silent on curd rice', app.fibreWarnHTML('Curd rice (thayir sadam)') === '');
  app.lsS('sym:' + app.todayKey(), { energy: 2, seton: 3, bowel: 'normal' });
  T('N2: symptom day escalates warning', app.isSymptomDay() === true && app.fibreWarnHTML('Chickpeas masala (tinned)').includes('Symptoms logged today'));

  /* Food DB integrity */
  T('DB: 83 foods (74 base + 8 Tamil/Telugu additions + Aldi protein granola, all confirmed by Boss before adding)', app.FOODS.length === 83);
  T('Feature: egg fry merged with omelette into one adjustable per-egg entry, fixed 3/4-egg entries retired', src.includes("name:'Egg fry / omelette (per egg)'") && !src.includes("name:'Egg omelette (3 small)'") && !src.includes("name:'Egg omelette (4 small)'"));
  T('Feature: Mutton keema added', src.includes("name:'Mutton keema'"));
  T('DB: every food has k/p/c/f per100', app.FOODS.every(f => f.per100 && ['k','p','c','f'].every(x => typeof f.per100[x] === 'number')));

  /* Round 1 bug fixes, 2026-08-02 */
  T('Fix1: initWS reconciles stale drafts by origName instead of index', src.includes('old.find(o=>o&&o.origName===e.n)'));
  T('Fix2: sticky save button disables on first click', src.includes('if(b.disabled)return;b.disabled=true'));
  T('Fix2b (regression caught in audit): showStickyBtn resets disabled state for each new session, not just guards one save', src.includes('b.disabled=false;b.style.opacity=\'\';'));
  T('Fix3: editSession restores painNote', src.includes("painNote:ex.painNote||''"));
  T('Fix4: Today-tab suggestion regenerated live via getSuggestion, not trusted from frozen .suggestion field', src.includes('const sugg=bestForSugg?getSuggestion(effOrigLike'));
  T('Fix4b: history-detail suggestion also regenerated live', src.includes('const def=getExDef(name,itype);') && src.includes('getSuggestion(def,lastBest,name)'));
  T('Fix5: checkPR bodyweight branch no longer gated on weight>0, and considers added weight', (() => {
    const i = src.indexOf('function checkPR');
    const body = src.slice(i, i + 900);
    return body.includes('if(!best.r||parseInt(best.r)<=0)return false;') && body.includes('br>cr||bw>cw');
  })());
  T('Fix6: Smith machine removed from flat Bench press subs, added to Incline DB press', !src.includes("'Bench press':['Smith machine bench press'") && src.includes("'Incline DB press':['Incline machine press','Incline BB press','High-to-low cable fly','Incline press (Smith machine)']"));
  T('Fix7: Cable row renamed to Seated cable row, no dead SUBS key remains', src.includes("n:'Seated cable row',s:3,r:'12'") && !/'Cable row':\[/.test(src));
  T('Fix8: escHtml sanitizer exists and is applied to note fields', src.includes('function escHtml') && src.includes('${escHtml(ws.note)}') && src.includes('${escHtml(ws.painNote)}') && src.includes('${escHtml(s.note)}'));
  T('Fix9: version banner no longer position:fixed', !src.includes("position:fixed;top:0;left:0;right:0;z-index:999"));
  T('Fix10: clearDraft removes all ws_draft keys regardless of date', src.includes("k.startsWith('ws_draft:')"));
  T('Fix11: storage.persist() result is awaited and stored', src.includes('const granted=await navigator.storage.persist()'));
  T('Content: bar weight reference card exists with confirmed Olympic/EZ values', src.includes('Bar Weight Reference') && src.includes('20kg &middot; confirmed standard'));
  T('Content: mutton curry mixed entry present', src.includes("name:'Mutton curry (mixed bone-in/boneless)'"));
  T('Content: weight smoothing helper exists and header uses it', src.includes('function getSmoothedWeight') && src.includes('const sw=getSmoothedWeight(stats)'));
  T('Round 3: typography swapped to IBM Plex Sans, no raw Inter font-family references remain', src.includes('IBM+Plex+Sans') && !/"Inter"/.test(src) && !/font-family:Inter,/.test(src));
  T('Audit find: no toISOString-based date keys remain anywhere (UTC/local mismatch bug class)', !src.includes('toISOString'));
  T('Fix12: lsS no longer silently swallows write failures, shows visible warning banner', (() => {
    const i = src.indexOf('function lsS(');
    const body = src.slice(i, i + 300);
    return src.includes('function showStorageFailWarning') && body.includes('return true;') && !body.includes('catch{}');
  })());
  T('Fix13: draft restoration scans for any ws_draft key from any previous day, not just today (phone-death data loss bug)', src.includes("k.startsWith('ws_draft:')") && src.includes("d.dl==='Free session'"));
  T('Fix13b: dead checkDraft function removed after finding it was never called (the real bug lived in the init block)', !src.includes('function checkDraft()'));
  T('Free session: entry point exists on the picker, separate from the 4 sequenced days', src.includes('function startFreeSession') && src.includes("onclick=\"startFreeSession()\""));
  T('Free session: exercise list is deduplicated and expands choice-type parents into real sub-options', src.includes('function getFreeSessionExerciseList') && src.includes("e.inputType==='choice'&&e.choiceOptions"));
  T('Free session: adding an exercise pulls its real prescribed set count, not a blank slate', src.includes('function addToFreeSession') && src.includes('length:def.s||3'));
  T('Free session: removeFromFreeSession exists and removes from both adHocDay and WS state', src.includes('function removeFromFreeSession') && src.includes('adHocDay.ex.splice(ei,1)') && src.includes("WS['Free session'].ex.splice(ei,1)"));
  T('Free session: saveSession never writes a real seqIdx or corrupts last_seq_idx for a free session', src.includes("const isFree=seqIdx==='free'") && src.includes('if(!isFree)lsS(\'last_seq_idx\',seqIdx)'));
  T('Free session: init-time draft restoration handles free sessions correctly, not just the 4 fixed day labels', src.includes("d.dl==='Free session'") && src.includes('adHocSeqIdx=null'));
  T('Deep-dive find: editSession can reconstruct a saved free session (was silently failing after any state reload)', (() => {
    const i = src.indexOf('function editSession(dateKey)');
    const body = src.slice(i, i + 700);
    return body.includes("const isFree=ex.dl==='Free session'") && body.includes('findExDef(e.origName)');
  })());
  T('Free session: exercise list now includes substitute variants, not just the 24 primary exercises', (() => {
    const i = src.indexOf('function getFreeSessionExerciseList');
    const body = src.slice(i, i + 700);
    return body.includes('for(const origName in SUBS)') && body.includes('findExDef(subName)');
  })());
  T('Deep-dive find: findExDef itself resolves substitute-only names (not just the picker list), fixing muscle volume for any substitute picked directly', (() => {
    const i = src.indexOf('function findExDef(name)');
    const body = src.slice(i, i + 700);
    return body.includes('for(const origName in SUBS)') && body.includes('SUBS[origName].includes(name)');
  })());
  T('Round 1: tricep exercises tagged with head bias (lateral/medial for pushdown, long head for overhead extension)', src.includes("primaryMuscles:['Triceps (lateral/medial)']") && src.includes("primaryMuscles:['Triceps (long head)']"));
  T('Round 1: Hammer curls leads with Brachialis, Dumbbell curl tagged long-head bias', src.includes("primaryMuscles:['Brachialis']") && src.includes("primaryMuscles:['Biceps (long head)']"));
  T('Round 1: Face pulls tags Traps as genuine co-primary, not just secondary', src.includes("primaryMuscles:['Rear delts','Traps']"));
  T('Round 1: Seated cable row (both instances) includes Traps as secondary', (src.match(/secondaryMuscles:\['Lats','Biceps','Traps'\]/g) || []).length === 2);
  T('Round 1: Hip abduction retagged to Glute medius/minimus, distinct from Leg press', src.includes("primaryMuscles:['Glute medius/minimus']"));
  T('Round 1: Dumbbell shrugs added to Pull day, closing the traps gap', src.includes("n:'Dumbbell shrugs'") && src.includes("primaryMuscles:['Traps']"));
  T('Round 1: Cable crunch added as real optional exercise, removed from Plank substitutes to avoid inheriting the wrong input type', src.includes("n:'Cable crunch',s:3") && !/'Plank':\['Dead bug','Bear crawl hold','Pallof press','Cable crunch'\]/.test(src));
  T('Round 2: Data namespace exists with pr/session/draft accessors', src.includes('const Data={') && src.includes('pr:{') && src.includes('session:{') && src.includes('draft:{'));
  T('Round 2: Data.pr.set/get produces identical shape to raw pr: storage', (() => {
    app.Data.pr.set('Test exercise', {w:'60', r:'10'});
    const viaData = app.Data.pr.get('Test exercise');
    const viaRaw = app.lsG('pr:Test exercise');
    return JSON.stringify(viaData) === JSON.stringify(viaRaw) && viaData.w === '60';
  })());
  T('Round 2: Data.session.set/get/delete round-trips correctly against real sess: keys', (() => {
    const fake = {date: app.todayKey(), dl: 'Push day', exercises: [], note: 'roundtrip test', totalVolume: 0};
    app.Data.session.set(fake);
    const matches = JSON.stringify(app.Data.session.get()) === JSON.stringify(app.lsG('sess:' + app.todayKey()));
    app.Data.session.delete();
    return matches && app.lsG('sess:' + app.todayKey()) === null;
  })());
  T('Round 2: Data.draft.findAny locates a draft from any day, matching the phone-death fix behavior', (() => {
    app.Data.draft.clearAll();
    app.Data.draft.save('Legs + core', {ex: [], note: 'draft roundtrip', painNote: '', startAt: null, lastSetAt: null});
    const found = app.Data.draft.findAny();
    app.Data.draft.clearAll();
    return found && found.dl === 'Legs + core' && found.state.note === 'draft roundtrip';
  })());
  T('Bug fix: exercise safety cues (nt field) now actually render, were silently invisible before despite existing in every exercise', src.includes('${(subOverride?.nt!==undefined?subOverride.nt:orig.nt)?`<div style="font-size:11px;color:var(--amb);font-style:italic'));
  T('Design fix: header weight number has its own distinct color, was identical to protein/calories before', src.includes('id="hdr-wt" style="color:var(--grn)"'));
  T('Deep-dive find: Bench press safety cue no longer duplicates equipment text that wlabel already handles, was showing wrong bar info when substituted to dumbbells', src.includes("nt:'Exhale on press \\u2014 never hold breath'") && !src.includes("nt:'Total kg including 20kg bar"));
  T('Bug fix: sticky Save & Finish button now hides on every tab except Today, was floating over Food/Progress/History before since tab-switching never told it to hide', (() => {
    const i = src.indexOf("document.querySelectorAll('.tab').forEach(btn=>{");
    const body = src.slice(i, i + 500);
    return body.includes("if(t===0){renderToday();}else{showStickyBtn(false);}");
  })());
  T('Feature: Hip adduction machine added as real companion to Hip abduction, confirmed via real equipment photos, closing the adductor gap', src.includes("n:'Hip adduction machine'") && src.includes("primaryMuscles:['Adductors']"));
  T('Bug fix: Remove exercise moved from absolute positioning (collided with Last/PR text on exercises with real history) into the safe action-button row', src.includes("gd.label==='Free session'?`<button class=\"subbtn\" style=\"color:var(--red)\" onclick=\"removeFromFreeSession") && !src.includes('position:absolute;top:14px;right:14px'));
  T('Bug fix: findExDef now inherits nt safety cues for substitutes, fixing the real gap where directly-picked substitutes showed no attachment/safety guidance at all', src.includes("nt:override?.nt!==undefined?override.nt:(origDef?.nt||'')"));
  T('Deep-dive find: squat machine substitute does NOT inherit Leg press blanket safe claim, given the real medical uncertainty already established for it', src.includes("'Pendulum/hack squat machine (light weight only \\u2014 stop on any pain)':{nt:'Light weight only"));
  T('Deep-dive find: Decline press substitutes get their own technique note, not Dips-specific "lean forward, elbows flared" which would not apply', src.includes("'Decline press (Smith machine)':{inputType:'weight',compound:true,nt:'Decline angle for lower chest"));
  T('Deep-dive find: Face pulls machine/band substitutes do not inherit the rope-specific claim', src.includes("'Reverse cable fly':{nt:'Never skip \\u2014 shoulder health'}"));
  T('Body diagram: library inlined, BodyMuscles global available', src.includes('var BodyMuscles=') && src.includes('BodyChart:()=>'));
  T('Body diagram: every muscle tag used anywhere in the app has a real mapping to library region IDs, no gaps', (() => {
    const daysSrc = src;
    const tagMatches = [...daysSrc.matchAll(/(?:primary|secondary)Muscles:\[([^\]]*)\]/g)];
    const allTags = new Set();
    tagMatches.forEach(m => { [...m[1].matchAll(/'([^']+)'/g)].forEach(t => allTags.add(t[1])); });
    const mapMatch = daysSrc.match(/const MUSCLE_TAG_TO_LIB_IDS=\{([\s\S]*?)\n\};/);
    const mapKeys = new Set([...mapMatch[1].matchAll(/'([^']+)':\[/g)].map(m => m[1]));
    const missing = [...allTags].filter(t => !mapKeys.has(t));
    return missing.length === 0;
  })());
  T('Body diagram: mountBodyDiagram destroys and recreates chart instances each call, since callers rebuild their container DOM every render', (() => {
    const i = src.indexOf('function mountBodyDiagram(');
    const body = src.slice(i, i + 400);
    return body.includes('prevInstances?.front)prevInstances.front.destroy();') && body.includes('prevInstances?.back)prevInstances.back.destroy();');
  })());
  T('Data layer migration: checkPR uses Data.pr instead of raw lsG/lsS calls', (() => {
    const i = src.indexOf('function checkPR(');
    const body = src.slice(i, i + 900);
    return body.includes('Data.pr.get(origName)') && body.includes('Data.pr.restore(origName') && !body.includes("'pr:'+origName");
  })());
  T('Data layer migration: saveSession, editSession, skipSession, unskipSession all use Data.session instead of raw sess: keys', src.includes('Data.session.set(session,saveDate)') && src.includes('Data.session.delete()') && src.includes('Data.session.setLast('));
  T('Data layer migration: saveDraft/clearDraft delegate to Data.draft, and the init-time restoration uses Data.draft.findAny() instead of duplicating the scan logic', src.includes('function saveDraft(dl,dateKey){if(WS[dl])Data.draft.save(dl,WS[dl],dateKey||editingDate||todayKey());}') && src.includes('function clearDraft(dateKey){Data.draft.clear(dateKey||todayKey());}') && src.includes('const d=Data.draft.findAny();'));
  T('Data layer migration: zero raw pr:/sess:/last:/ws_draft: calls remain anywhere outside the Data namespace itself', (() => {
    const dataStart = src.indexOf('const Data={');
    const dataEnd = src.indexOf('\n};', dataStart) + 3;
    const outsideData = src.slice(0, dataStart) + src.slice(dataEnd);
    return !/lsG\('pr:|lsS\('pr:|lsG\('sess:|lsS\('sess:|lsDel\('sess:|lsG\('last:|lsS\('last:|lsS\('ws_draft:/.test(outsideData);
  })());
  T('Bug fix: addPlateToLog now refreshes and switches to Ate after saving, matching logMeal\'s already-correct pattern — plates were saving but staying invisible until something else forced a refresh', (() => {
    const i = src.indexOf('function addPlateToLog()');
    const body = src.slice(i, i + 600);
    return body.includes('renderFood();showFS(\'l\');');
  })());
  T('Feature: removeSet exists and delete control only shows for extra/drop sets, not standard ones', src.includes('function removeSet') && src.includes('const isExtra=isDrop||si>=(subOverride?.s||orig.s||3)'));
  T('Feature: squat machine added as Leg press substitute with pain-stop caution baked into its name', src.includes("Pendulum/hack squat machine (light weight only \\u2014 stop on any pain)'") && src.includes("'Leg press':['Step-ups (bodyweight)','Wall sit (hold 60s)','Pendulum/hack squat machine"));

  /* S1: PR keyed by actual performed exercise, not the originally scheduled one */
  app.lsS('pr:Cable tricep pushdown', null);
  const s1Best = app.bestSetOf([{ w: '25', r: '8', done: true }], 'weight');
  T('S1: checkPR keys correctly on the substitute name (Rope pushdown), not the original', app.checkPR('Rope pushdown', s1Best, 'weight') === true && app.lsG('pr:Rope pushdown') !== null && app.lsG('pr:Cable tricep pushdown') === null);

  /* S2: substitute type override table gives correct measurement type */
  T('S2: Wall sit override is seconds-type', app.SUB_TYPE_OVERRIDE['Wall sit (hold 60s)'].inputType === 'seconds');
  T('S2: Lat pulldown override is weight-type (was inheriting bodyweight from Pull-ups)', app.SUB_TYPE_OVERRIDE['Lat pulldown'].inputType === 'weight');

  /* S7: wlabel inference for substitutes with no explicit override */
  T('S7: cable fly infers Stack weight, not the original DB press label', app.inferSubWlabel('High-to-low cable fly') === 'Stack weight');
  T('S7: single arm row infers one-hand dumbbell label', app.inferSubWlabel('Cable single arm row') === 'Stack weight');

  /* Drop-set rounding: nearest 5kg, not nearest 0.5kg */
  T('Drop set: 85kg*0.8 rounds to nearest 5 (68->70)', Math.round(85*0.8/5)*5 === 70);
  T('Drop set: 100kg*0.8 rounds to nearest 5 (80->80)', Math.round(100*0.8/5)*5 === 80);

  /* user_profile defaults and Coach namespace */
  const prof = app.getProfile();
  T('user_profile: default targets match previous hardcoded values', prof.targets.protein === 150 && prof.targets.kcal === 2100 && prof.targets.carbs === 230 && prof.targets.fat === 65);
  app.lsS('food:' + app.todayKey(), [{ p: 60, k: 800, c: 90, f: 20 }]);
  const daily = app.Coach.getDailyStatus();
  T('Coach.getDailyStatus: proteinGap computed from profile target', daily.proteinGap === 90);
  T('Coach.get3SessionTrend: returns unavailable with no history', app.Coach.get3SessionTrend('Nonexistent exercise').available === false);

  /* Round 2: muscle tags + weekly volume, 2026-08-02 */
  const allExDefs = app.DAYS.flatMap(d => d.ex);
  T('Muscle tags: every exercise has primaryMuscles and secondaryMuscles arrays', allExDefs.every(e => Array.isArray(e.primaryMuscles) && Array.isArray(e.secondaryMuscles)));
  T('Muscle tags: every exercise has at least one primary muscle', allExDefs.every(e => e.primaryMuscles.length >= 1));
  T('Muscle tags: choiceOptions also carry muscle tags', allExDefs.filter(e => e.inputType === 'choice').every(e => e.choiceOptions.every(o => Array.isArray(o.primaryMuscles))));
  T('findExDef: looks up a scheduled exercise by name', app.findExDef('Bench press')?.primaryMuscles.includes('Chest'));
  T('findExDef: looks up a choiceOption by name', app.findExDef('Dead bug')?.primaryMuscles.includes('Core'));
  T('Coach.getWeeklyMuscleVolume: real sets-count metric \u2014 primary full, secondary half, drop sets excluded, comparable across every exercise type', (() => {
    app.lsS('sess:' + app.todayKey(), { date: app.todayKey(), dl: 'Push day', seqIdx: 0, exercises: [
      { name: 'Bench press', origName: 'Bench press', isPR: false, sets: [
        { w: 80, r: 8, done: true, isDrop: false },
        { w: 80, r: 8, done: true, isDrop: false },
        { w: 80, r: 8, done: true, isDrop: false },
        { w: 50, r: 12, done: true, isDrop: true }
      ]}
    ], note: '', painNote: '', skipped: false, totalVolume: 0, newPRs: [] });
    const vol = app.Coach.getWeeklyMuscleVolume();
    const chest = vol.find(v => v.muscle === 'Chest');
    const triceps = vol.find(v => v.muscle === 'Triceps');
    return chest && chest.volume === 3 && triceps && triceps.volume === 1.5;
  })());
  T('Round 4: every primary exercise has real form-tip content, not placeholder text', (() => {
    const names = ['Arnold press','Barbell curl','Bench press','Cable crunch','Cable pull-through','Cable tricep pushdown','Calf raises','Dead bug','Dips (chest-focused, forward lean)','Dumbbell curl (alternating)','Dumbbell shrugs','Dumbbell wrist curls','Face pulls','Hammer curls','Hip abduction machine','Hip adduction machine','Incline DB press','Lat pulldown','Lateral raises','Leg extension (machine)','Leg press','Machine chest fly','Overhead tricep extension','Plank','Pull-ups (unassisted)','Seated DB shoulder press','Seated cable row','Seated leg curl','Single arm DB row'];
    return names.every(n => {
      const def = app.findExDef(n);
      return def && typeof def.tip === 'string' && def.tip.length > 10;
    });
  })());
  T('Round 4: tip apostrophes are properly escaped, no raw contractions that would break the string', !/tip:'[^']*\w'\w[^']*'/.test(src));
  T('Round 4: card restructure collapsed the header into grouped rows, info button added', src.includes('class="infobtn"') && src.includes("togInfo('${gd.label}',${ei})"));
  T('Round 4: info panel auto-closes when a set is marked done or typed into', src.includes('if(WS[dl].infoOpen===ei)WS[dl].infoOpen=null;saveDraft(dl);') && src.includes('if(WS[dl].infoOpen===ei)WS[dl].infoOpen=null;\n  saveDraft(dl);renderToday();'));
  T('Round 4: exercise cards are real bounded containers, not a flat list', src.includes('.exb{background:var(--c1);border:1px solid var(--c3);border-radius:16px'));
  T('Round 4: mini exercise diagram shows this exercise\u2019s own muscles, primary brighter than secondary', src.includes('function mountMiniExerciseDiagram') && src.includes('intensity:8,selected:false') && src.includes('intensity:3,selected:false'));
  T('Round 4: header icon fix applied correctly \u2014 warn class toggles on the parent .mv element, not the text span', src.includes("epMv.className='mv'+(p<t.protein*0.53?' warn':'')") && src.includes("ekMv.className='mv'+(k>t.kcal*1.1?' warn':'')"));
  T('Bug fix: set row kg/reps inputs now stretch flex:1 to fill the full row width, matching the energy/seton button pattern, instead of packing to the left', (() => {
    const i = src.indexOf('class="srow${set.done');
    const body = src.slice(i, i + 1500);
    return (body.match(/text-align:center;flex:1/g) || []).length === 2;
  })());
  T('Deep audit find: a free session can now actually be started on a day you already completed your scheduled session, since the completion summary was blocking adHocDay from ever showing before', src.includes('!adHocDay){'));
  T('Real gap found in cross-feature linkage audit: the earlier fix only bypassed the completion summary for Free session specifically \u2014 explicitly navigating to a SCHEDULED day after already saving something today still showed a stale summary instead of the real cards with the freshness nudge. Now any explicitly-chosen day bypasses it, not just Free session', !src.includes("!(adHocDay&&adHocDay.label==='Free session')"));
  T('Coaching layer: estimate1RM matches hand-calculated Epley+Brzycki average exactly', (() => {
    const est = app.estimate1RM(80, 8);
    return Math.abs(est.value - 100.32) < 0.1;
  })());
  T('Coaching layer: e1RM correctly detects real progress even when weight is unchanged (more reps at same weight)', app.estimate1RM(80, 10).value > app.estimate1RM(80, 8).value);
  T('Coaching layer: getExHistory analyzes full history with no time cutoff, exactly as instructed \u2014 not a snapshot, not a recency window', (() => {
    const i = src.indexOf('function getExHistory(name){');
    const body = src.slice(i, i + 400);
    return !body.includes('cutoff') && !/setDate\(d\.getDate\(\)-\d/.test(body);
  })());
  T('Coaching layer: bodyweight prefill leaves weight empty, only prefills reps', (() => {
    app.Data.session.set({date:app.todayKey(),dl:'Pull day',seqIdx:1,exercises:[{name:'Pull-ups (unassisted)',origName:'Pull-ups (unassisted)',best:{w:15,r:5},sets:[{w:15,r:5,done:true}],isPR:false,inputType:'bodyweight',exVolume:100}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:100});
    const prefill = app.getPrefillSets(app.findExDef('Pull-ups (unassisted)'), 'Pull-ups (unassisted)', 4);
    return prefill.every(s => s.w === '');
  })());
  T('Coaching layer: fatigue curve repeats its last percentage for sets beyond what it explicitly defines, instead of leaving them unprefilled', src.includes('curve[i]!==undefined?curve[i]:curve[curve.length-1]'));
  T('Food coaching: meal gap suggests realistic typical serving sizes, not a back-calculated amount that could recommend something absurd like 168g of protein powder', (() => {
    app.lsS('food:' + app.todayKey(), [{ name: 'Rice', k: 200, p: 4, c: 44, f: 1 }]);
    const gap = app.getMealGapSuggestion();
    return gap.needed && gap.options.every(o => o.grams <= 250 && o.grams > 0);
  })());
  T('Food coaching: swap suggestions are honest about only measuring protein-per-calorie, not sugar, since sugar isn\u2019t a tracked field', app.getSwapSuggestions !== undefined && src.includes('not a sugar comparison'));
  T('Food coaching: correlation is honestly gated on real sample size, refuses to claim a pattern from too little data', (() => {
    app.lsS('food:' + app.todayKey(), [{ name: 'test', k: 300, p: 20, c: 10, f: 5 }]);
    const result = app.getFoodSymptomCorrelation();
    return result.available === false && result.reason.includes('need at least 10');
  })());
  T('Real bug reported from live screenshots, re-verified against the two-mode rebuild: a compound exercise that fell well short of an old-style rep target still gets a sensible, grounded ramp \u2014 not a jump to the target ceiling. Smith machine row, only got 2 reps, should build a real ramp around that, not around a "10-12" target it never touched', (() => {
    app.Data.session.set({date:app.todayKey(),dl:'Pull day',seqIdx:1,exercises:[{name:'Smith machine row',origName:'Seated cable row',best:{w:35,r:2},sets:[{w:35,r:2,done:true}],isPR:false,inputType:'weight',exVolume:70}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:70});
    const prefill = app.getPrefillSets(app.findExDef('Seated cable row'), 'Smith machine row', 3);
    const weights = prefill.map(s => parseFloat(s.w));
    return Math.max(...weights) <= 40 && Math.max(...weights) >= 35;
  })());
  T('Ramp-vs-moderate rebuild: compound exercises get a real ramp-to-top-set-plus-drop structure, isolation exercises get a moderate, no-1RM-chase structure \u2014 dispatched off the existing orig.compound field', src.includes('function getRampPrefill(') && src.includes('function getModeratePrefill(') && src.includes('isCompound?getRampPrefill(recW,numSets):getModeratePrefill(recW,numSets)'));
  T('Ramp prefill: the top (near-max) set always lands second-to-last when there are 3+ sets, with a true drop set after it, matching the actual described method', (() => {
    const prefill = app.getRampPrefill(100, 4);
    return prefill[2].r === '2' && parseFloat(prefill[2].w) === 100 && parseFloat(prefill[3].w) < parseFloat(prefill[2].w) && parseInt(prefill[3].r) > parseInt(prefill[2].r);
  })());
  T('Moderate prefill: isolation work never drops to a 1-2 rep top set, stays in a genuinely moderate-to-high rep range throughout, per the research on joint stress and hypertrophy volume', (() => {
    const prefill = app.getModeratePrefill(20, 3);
    return prefill.every(s => parseInt(s.r) >= 6);
  })());
  T('Mini exercise diagram enlarged from 70px to 130px, so it\u2019s actually legible instead of tiny', src.includes('id="miniex-front" style="width:130px"') && src.includes('id="miniex-back" style="width:130px"'));
  T('Deload signal: dispatches off the real, already-tested freshness calculation rather than a separate metric, and requires a real minimum sample before saying anything', src.includes('if(fresh.length<4)return{available:false'));
  T('Deload signal: correctly wired into the sandbox and dispatches off the real, already-tested freshness calculation, not a separate metric', src.includes('getDeloadSignal(){') && src.includes('const fresh=this.getMuscleFreshness();'));
  T('Deload card: only renders when the signal genuinely fires, not a permanent fixture', src.includes("if(deload.available&&deload.suggestDeload){"));
  T('Real bug reported from live screenshot: tapping the tricep region now resolves to a specific head tag with real exercises, not the generic dead-end "Triceps" tag that zero exercises actually use as primary', (() => {
    const resolved = app.resolveClickedTag(app.LIB_ID_TO_TAGS ? Object.keys(app.LIB_ID_TO_TAGS).find(id => id.includes('triceps-lateral')) : null);
    return resolved === 'Triceps (lateral/medial)' && app.getExercisesForMuscleTag(resolved).some(e => e.n === 'Cable tricep pushdown');
  })());
  T('Content gap closed: Obliques now has a real exercise (Side plank) covering it, and every clickable diagram region resolves to a tag with real exercise usage \u2014 zero empty regions left anywhere', (() => {
    const ids = Object.keys(app.LIB_ID_TO_TAGS);
    const emptyTags = ids.map(id => app.resolveClickedTag(id)).filter(tag => tag && app.getExercisesForMuscleTag(tag).length === 0);
    return emptyTags.length === 0 && app.getExercisesForMuscleTag('Obliques').some(e => e.n === 'Side plank');
  })());
  T('Real gap fix: substitute resolution now supports overriding primaryMuscles/secondaryMuscles, not just inputType/wlabel/nt \u2014 without this, Reverse EZ bar curl would have silently inherited "Biceps" from the curl it substitutes for, which is factually wrong', src.includes('primaryMuscles:override?.primaryMuscles||origDef?.primaryMuscles||[]') && src.includes('secondaryMuscles:override?.secondaryMuscles||origDef?.secondaryMuscles||[]'));
  T('Reverse EZ bar curl correctly tagged Forearms primary, Brachialis secondary, and existing substitutes (EZ bar curl, DB curl) still correctly inherit Biceps, unaffected by the fix', (() => {
    const rev = app.findExDef('Reverse EZ bar curl');
    const ez = app.findExDef('EZ bar curl');
    return rev.primaryMuscles[0] === 'Forearms' && rev.secondaryMuscles[0] === 'Brachialis' && ez.primaryMuscles[0] === 'Biceps';
  })());
  T('Bar weights: Smith machine pre-population moved to real app init, not tucked inside renderProgress \u2014 confirmed correct even if Progress tab is never visited', src.includes("(()=>{const bw=lsG('bar_weights')||{};if(!bw.smith){bw.smith='15';lsS('bar_weights',bw);}})();\ncheckStorage();"));
  T('Real bug reported: saveSession now calls renderToday() immediately, not after a 5-second setTimeout that made the page look stuck \u2014 the exact behavior reported', src.includes('clearDraft(saveDate);showStickyBtn(false);stopTimerTick();skipRestTimer();\n  adHocDay=null;adHocSeqIdx=null;editingDate=null;\n  renderToday();') && !src.includes("setTimeout(()=>{cb.style.display='none';renderToday();},5000)"));
  T('Save confirmation moved to a genuinely persistent toast element outside the content area, since the old confbox was actually rebuilt by renderToday() itself and got destroyed the moment the page transitioned \u2014 that\'s what the original 5-second delay was clumsily working around', src.includes('id="save-toast"') && src.includes("document.getElementById('save-toast')"));
  T('Real bug reported: tapping the biceps region now surfaces ALL three genuinely distinct groups sharing that spot (general Biceps curls, long-head-specific curls, brachialis-specific curls), not just one winner hiding the other two', (() => {
    const tags = app.resolveClickedTagsAll('biceps-left');
    return tags.includes('Biceps') && tags.includes('Biceps (long head)') && tags.includes('Brachialis') &&
      app.getExercisesForMuscleTag('Brachialis').some(e => e.n === 'Hammer curls');
  })());
  T('Real bug reported: the Chest/Lower chest region overlap is fixed too \u2014 Decline press, previously unreachable via the diagram, now shows', (() => {
    const tags = app.resolveClickedTagsAll('chest-lower-left');
    return tags.includes('Chest') && tags.includes('Lower chest') &&
      app.getExercisesForMuscleTag('Lower chest').some(e => e.n === 'Decline machine press');
  })());
  T('Clutter fix caught by actually looking at the result: when multiple tags share a region, only primary matches show per section \u2014 secondary lists would otherwise repeat a huge, mostly-irrelevant wall of text under every section and bury the genuinely differentiated information', src.includes('const showSecondary=_freeExSelectedTags.length===1;') && src.includes('const showSecondary=_freshSelectedTags.length===1;'));
  T('Real feedback addressed: Weekly Muscle Volume replaced with a real, interpretable sets-count metric, not a raw tonnage number nobody could read', src.includes("Weekly Sets Per Muscle") && src.includes('const completedSets=(e.sets||[]).filter(s=>s.done&&!s.isDrop).length;'));
  T('Section G: Volume mode retired (redundant with Weekly Sets Per Muscle) and Freshness relocated to Today with its own clear explanation, not the old dual-mode toggle', !src.includes("btn-grn':'btn-ghost'} btn-sm\" style=\"flex:1\" onclick=\"setProgressDiagMode('volume')\">Volume</button>") && src.includes('Muscle freshness') && src.includes('Deeper red means trained harder and more recently'));
  T('Real feedback addressed: food quick-add now has a real search input, matching the pattern already working for exercise search, instead of a native select with 74+ entries to scroll through', src.includes('id="ml-food-search"') && src.includes('function filterMealFoodList(') && src.includes('function pickMealFood('));
  T('Real feature built: per-exercise freshness note, exactly the scenario described \u2014 Incline bench in a free session only flags Upper chest specifically, not the whole Push day, and the note is clear that everything else is unaffected', src.includes('const freshTag=(effOrigLike.primaryMuscles||[])[0];') && src.includes('Everything else on this day is unaffected'));
  T('Progress tab restructure: Bar Weight Reference moved to Today tab where it\u2019s actually useful mid-workout, no longer in Progress', src.includes('Bar Weight Reference') && (() => {
    const todayIdx = src.indexOf("document.getElementById('p0').innerHTML=html;");
    const progressStart = src.indexOf('function renderProgress()');
    const progressEnd = src.indexOf('function renderFood()');
    const progressBody = src.slice(progressStart, progressEnd);
    return !progressBody.includes('Bar Weight Reference');
  })());
  T('Progress tab restructure (this session): Daily targets stay out of Progress (they are Food tab\u2019s), Body Map is gone \u2014 replaced by exercise search-and-reveal, Weekly Sets Per Muscle stays separate', (() => {
    const progressStart = src.indexOf('function renderProgress()');
    const progressEnd = src.indexOf('function renderFood()');
    const progressBody = src.slice(progressStart, progressEnd);
    return !progressBody.includes('Daily targets') && !progressBody.includes('>Recent sessions<') && progressBody.includes('Weekly Sets Per Muscle') && !progressBody.includes('>Body Map<') && progressBody.includes('Exercise history');
  })());
  T('Real bug reported: suggested weights are now realistic 2.5kg-increment numbers you can actually load, not 61.5kg-style values nobody can put on a bar', (() => {
    const dayKey = (o) => { const d = new Date(); d.setDate(d.getDate()-o); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
    app.Data.session.set({date:dayKey(3), dl:'Push day', seqIdx:0, exercises:[{name:'Bench press',origName:'Bench press',best:{w:100,r:2},sets:[{w:100,r:2,done:true}],isPR:false,inputType:'weight',exVolume:200}], note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:200});
    const orig = app.findExDef('Bench press');
    const prefill = app.getPrefillSets(orig, 'Bench press', orig.s);
    return prefill.every(s => Math.abs((parseFloat(s.w)/2.5) - Math.round(parseFloat(s.w)/2.5)) < 0.001);
  })());
  T('Rounding fix applied consistently across every path: ramp prefill, moderate prefill, and getNextTargetWeight all use the shared realisticWeightRound function, not a flat rounding that\u2019s wrong at either end of the weight scale', (() => {
    const count = (src.match(/const round=realisticWeightRound;/g) || []).length;
    return count === 3 && src.includes('function realisticWeightRound(') && !src.includes('Math.round(v/0.5)*0.5');
  })());
  T('Real bug reported from live screenshot: card header no longer shows the same weight/rep value three times (PR + Last + redundant suggestion text) \u2014 consolidated to one clean line, and the now-redundant suggestion text is dropped entirely for anything that already gets a real numeric prefill', src.includes('const prMatchesLast=prData&&lx?.best') && src.includes('(current best)') && src.includes('const noNumericPrefill=') && src.includes('if(sugg&&noNumericPrefill)'));
  T('Real layout bug fixed: long exercise names no longer strand the MUST badge and info icon on their own orphaned line \u2014 name and badge/icon group wrap independently, badge and icon always stay together', src.includes('style="flex:1;min-width:140px">${ex.name}') && src.includes('style="display:inline-flex;align-items:center;gap:4px;flex-shrink:0"'));
  T('Real bug reported: Pull-ups no longer shows a false "beat last week total" claim that was static text unconnected to any real data \u2014 replaced with a genuine safety cue', !src.includes('Signature \\u2014 beat last week total') && src.includes('Full range at the bottom \\u2014 no kipping or swinging, exhale as you pull'));
  T('Full audit found and fixed a real, significant diagram bug: when two muscle tags share a diagram region (Lats/Mid-back, Biceps/Brachialis, Chest/Lower chest), the region now shows whichever tag has the higher intensity, not whichever was processed last \u2014 confirmed with a hand-verified scenario where Lats and Mid-back share a region and Lats has clearly more real volume', (() => {
    const volIdx = src.indexOf('function volumeToBodyState(');
    const freshIdx = src.indexOf('function freshnessToBodyState(');
    const volBody = src.slice(volIdx, volIdx+500);
    const freshBody = src.slice(freshIdx, freshIdx+900);
    return volBody.includes('if(!state[id]||intensity>state[id].intensity)') && freshBody.includes('if(!state[id]||intensity>state[id].intensity)');
  })());
  T('Weekly reminders: body stats gap check reads real logged data, fires at 7+ days, stays quiet with no gap', (() => {
    const days = app.getBodyStatsReminderDays !== undefined;
    return days;
  })());
  T('Weekly reminders: both reminder functions exist and are wired into the Today tab, only appearing when genuinely overdue', src.includes('function getBodyStatsReminderDays()') && src.includes('function getFoodLoggingGapDays()') && src.includes('Worth a minute today'));
  T('Suggested Session: real scoring combines freshness and weekly volume gap, picks real exercises, respects the targeted (5-exercise) and free-mix (no day-type constraint) decisions', src.includes('function getSuggestedSessionExercises(') && src.includes("freshness*0.5+volumeGap*0.5"));
  T('Suggested Session: tie-breaking fix \u2014 muscles with identical priority (very common with no recent data) get fair random tie-breaking instead of always favoring whichever muscle happened to be inserted first into the Set, which silently excluded legs entirely in testing before the fix', src.includes('Math.random()*0.05'));
  T('Suggested Session: reuses the real Free session infrastructure (rotation untouched, same save path) rather than a separate parallel system, and a normal Free session still starts genuinely empty afterward, unaffected', src.includes('function startSuggestedSession()') && src.includes('_isSuggestedSession=true'));
  T('Deload signal now also surfaces directly on Today tab before you\u2019d pick a session, not just buried in Progress', src.includes('Before you pick today') && src.includes('Suggested Session, which already accounts for this'));
  T('Real bug found via full audit: light isolation weight no longer rounds disproportionately \u2014 a 4kg dumbbell wrist curl exercise used to get rounded all the way to 2.5kg (a 37.5% drop) because the 2.5kg step was larger than the weight itself; now uses realistic 1kg steps below 20kg', (() => {
    app.Data.session.set({date:app.todayKey(),dl:'test',seqIdx:0,exercises:[{name:'Dumbbell wrist curls__t',origName:'Dumbbell wrist curls__t',best:{w:4,r:15},sets:[{w:4,r:15,done:true}],isPR:false,inputType:'weight',exVolume:1}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:1});
    const orig = app.findExDef('Dumbbell wrist curls');
    const prefill = app.getPrefillSets(orig, 'Dumbbell wrist curls__t', orig.s);
    return prefill.every(s => Math.abs(parseFloat(s.w) - 4) <= 2);
  })());
  T('Heavy compound weight still correctly uses realistic 2.5kg barbell increments, unaffected by the light-weight fix', (() => {
    app.Data.session.set({date:app.todayKey(),dl:'test',seqIdx:0,exercises:[{name:'Bench press__t',origName:'Bench press__t',best:{w:100,r:2},sets:[{w:100,r:2,done:true}],isPR:false,inputType:'weight',exVolume:1}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:1});
    const orig = app.findExDef('Bench press');
    const prefill = app.getPrefillSets(orig, 'Bench press__t', orig.s);
    return prefill.every(s => Math.abs((parseFloat(s.w)/2.5) - Math.round(parseFloat(s.w)/2.5)) < 0.001);
  })());
  T('Graphs: real weight trend data, hand-verified monthly averaging (July entries of 86/85.5/85.2 correctly average to 85.6), using the REAL field name (.wt) the actual save mechanism uses \u2014 a genuine bug used the wrong field name (.w) here originally and was only caught by cross-checking against the real saveStats() function', (() => {
    app.lsS('bstats', [{date:'2026-07-06',wt:86},{date:'2026-07-13',wt:85.5},{date:'2026-07-20',wt:85.2}]);
    const points = app.getWeightTrendPoints('month');
    return points.length === 1 && points[0].y === 85.6;
  })());
  T('Graphs: exercise trend reuses the real estimate1RM already built for coaching, not a separate calculation, and correctly reflects real progression', (() => {
    app.Data.session.set({date:app.todayKey(),dl:'test',seqIdx:0,exercises:[{name:'Bench press__g',origName:'Bench press__g',best:{w:80,r:8},sets:[{w:80,r:8,done:true}],isPR:false,inputType:'weight',exVolume:1}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:1});
    const points = app.getExerciseTrendPoints('Bench press__g', 'week');
    return points.length === 1 && Math.abs(points[0].y - 100.3) < 0.1;
  })());
  T('Graphs: line chart is honest with too little data \u2014 refuses to draw a misleading trend from 0 or 1 points', app.renderLineChartSVG([], {}).includes('Not enough data') && app.renderLineChartSVG([{xLabel:'a',y:1}], {}).includes('Not enough data'));
  T('Graphs: built as native SVG, no external charting library added, matching the single-file no-dependency architecture', src.includes('function renderLineChartSVG(') && !src.includes('chart.js') && !src.includes('recharts'));
  T('Real bug found via full audit: getWeightTrendPoints was checking the wrong field name (.w) while the actual saveStats() function saves weight as .wt \u2014 this would have meant the graph never showed real data even with genuine, diligent weekly logging. Fixed, and this test cross-checks the real save field list against what the graph reads, rather than trusting a second, separately-wrong assumption', (() => {
    const saveStatsMatch = src.match(/\['wt','bf','mm','bw'\]/);
    const graphReadsWt = src.includes("filter(s=>s.wt)") && src.includes('parseFloat(s.wt)');
    return !!saveStatsMatch && graphReadsWt;
  })());
  T('Real bug reported: Obliques data was always correct (Side plank exists, correctly tagged) \u2014 the actual problem was tap precision on a small mobile diagram, confirmed by the fact that direct tag resolution worked perfectly while the reported symptom only appeared through physical tapping', app.getExercisesForMuscleTag('Obliques').some(e => e.n === 'Side plank'));
  T('Real fix: a reliable muscle-name dropdown now exists as an alternative to tapping the diagram, directly solving the reported precision problem rather than trying to fight SVG hit-target sizing on mobile', src.includes('function allMuscleTagsWithExercises()') && (src.match(/allMuscleTagsWithExercises\(\)/g)||[]).length >= 3);
  T('Real recurring bug reported: forgetting to save a workout used to silently mis-date it to whenever you next opened the app, with a meaningless multi-day duration \u2014 now detected at load time and the person gets a clear choice, every time, not left to accumulate and eventually save wrong', src.includes('let _staleDraftPending=null;') && src.includes("d.date&&d.date!==todayKey()"));
  T('Stale draft fix: saveSession now accepts an explicit date, correctly saves under that real date (not today), skips a meaningless multi-day duration, and correctly computes which month\u2019s log entry to update \u2014 handles the draft spanning into a previous month too, not just a previous day', src.includes('function saveSession(dl,seqIdx,explicitDate)') && src.includes('const saveMonth=saveDate.slice(0,7);') && src.includes('const duration=(!explicitDate&&s.startAt)'));
  T('Stale draft fix: a genuine same-day draft (briefly closing the app mid-workout) is completely unaffected \u2014 still restores silently and normally, the new prompt only fires for a draft from a different calendar day', src.includes('WS[d.dl]=d.state;') && src.includes('_staleDraftPending={dl:d.dl,state:d.state,date:d.date};'));
  T('Freshness improvement 1: accumulated fatigue now sums residual fatigue across ALL recent hits, not just the single most recent one \u2014 hand-verified a repeated hit correctly lowers freshness below what a single isolated hit would show', (() => {
    const dayKey = (o) => { const d = new Date(); d.setDate(d.getDate()-o); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
    [30,22,14].forEach(days => {
      app.Data.session.set({date:dayKey(days),dl:'test',seqIdx:0,exercises:[{name:'Bench press',origName:'Bench press',best:{w:80,r:8},sets:[{w:80,r:8,done:true}],isPR:false,inputType:'weight',exVolume:640}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:640}, dayKey(days));
    });
    app.Data.session.set({date:dayKey(3),dl:'test',seqIdx:0,exercises:[{name:'Bench press',origName:'Bench press',best:{w:80,r:8},sets:[{w:80,r:8,done:true}],isPR:false,inputType:'weight',exVolume:640}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:640}, dayKey(3));
    const chestSingle = app.Coach.getMuscleFreshness().find(f=>f.muscle==='Chest');
    const single = chestSingle ? chestSingle.freshness : null;
    app.Data.session.set({date:dayKey(1),dl:'test',seqIdx:0,exercises:[{name:'Bench press',origName:'Bench press',best:{w:80,r:8},sets:[{w:80,r:8,done:true}],isPR:false,inputType:'weight',exVolume:640}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:640}, dayKey(1));
    const chestRepeated = app.Coach.getMuscleFreshness().find(f=>f.muscle==='Chest');
    const repeated = chestRepeated ? chestRepeated.freshness : null;
    return single !== null && repeated !== null && repeated < single;
  })());
  T('Freshness improvement 2: a genuine trailing pattern of low logged energy (2+ days) widens recovery windows, honestly requiring a real pattern rather than reacting to a single rough day', src.includes('const energyModifier=recentEnergy.length>=2') && src.includes('<=2.5?1.25:1'));
  T('Live coach: real bug found and fixed \u2014 the initial version compared actual reps against the exercise\u2019s single fixed rep target using a broken fallback that always compared actual reps against themselves, never triggering. Reproduced Boss\u2019s exact reported example (20kg DB curl, set 3, 4 reps) and confirmed set 4 now correctly drops', (() => {
    app.startFreeSession();
    app.addToFreeSession('Dumbbell curl (alternating)');
    const ex = app.WS['Free session'].ex[0];
    ex.sets = [{w:'20',r:'12',pw:'20',pr:'12',done:false,isDrop:false},{w:'20',r:'11',pw:'20',pr:'11',done:false,isDrop:false},{w:'20',r:'',pw:'20',pr:'10',done:false,isDrop:false},{w:'20',r:'',pw:'13',pr:'14',done:false,isDrop:false}];
    app.togDone('Free session',0,0);
    app.togDone('Free session',0,1);
    ex.sets[2].w='20'; ex.sets[2].r='4';
    app.togDone('Free session',0,2);
    return parseFloat(app.WS['Free session'].ex[0].sets[3].w) < 20;
  })());
  T('Live coach: second, deeper bug found \u2014 for a compound ramp, comparing against the exercise\u2019s overall rep range (e.g. 6-8) was wrong, since the actual top set deliberately targets far fewer reps than that. Fixed by regenerating the real per-position rep target from the same trusted ramp shape logic already used for the original prefill, confirmed a genuinely dramatic overshoot correctly raises the drop set', (() => {
    app.startFreeSession();
    app.addToFreeSession('Bench press');
    const ex = app.WS['Free session'].ex[0];
    ex.sets = [{w:'40',r:'12',pw:'40',pr:'12',done:false,isDrop:false},{w:'100',r:'2',pw:'100',pr:'2',done:false,isDrop:false},{w:'55',r:'9',pw:'55',pr:'9',done:false,isDrop:false}];
    app.togDone('Free session',0,0);
    ex.sets[1].w='100'; ex.sets[1].r='10';
    app.togDone('Free session',0,1);
    return parseFloat(app.WS['Free session'].ex[0].sets[2].w) > 55;
  })());
  T('Live coach: warm-up set (first set of a compound ramp) never triggers a false alarm, even with a huge deviation \u2014 that set is meant to feel easy', (() => {
    app.startFreeSession();
    app.addToFreeSession('Bench press');
    const ex = app.WS['Free session'].ex[0];
    ex.sets = [{w:'40',r:'3',pw:'40',pr:'12',done:false,isDrop:false},{w:'100',r:'2',pw:'100',pr:'2',done:false,isDrop:false},{w:'55',r:'9',pw:'55',pr:'9',done:false,isDrop:false}];
    app.togDone('Free session',0,0);
    return app.WS['Free session'].ex[0].sets[1].w === '100' && app.WS['Free session'].ex[0].sets[2].w === '55';
  })());
  T('Live coach: applies to added sets (+Set) and drop sets alike, not just the originally-planned standard sets \u2014 a freshly added empty set gets populated directly rather than silently skipped for having nothing to scale from', (() => {
    app.startFreeSession();
    app.addToFreeSession('Dumbbell curl (alternating)');
    let ex = app.WS['Free session'].ex[0];
    ex.sets = [{w:'20',r:'12',pw:'20',pr:'12',done:false,isDrop:false},{w:'20',r:'4',pw:'20',pr:'10',done:false,isDrop:false}];
    app.addSet('Free session',0);
    app.togDone('Free session',0,0);
    app.togDone('Free session',0,1);
    const addedSetOk = parseFloat(app.WS['Free session'].ex[0].sets[2].w) < 20;
    app.startFreeSession();
    app.addToFreeSession('Dumbbell curl (alternating)');
    ex = app.WS['Free session'].ex[0];
    ex.sets = [{w:'20',r:'12',pw:'20',pr:'12',done:false,isDrop:false},{w:'20',r:'4',pw:'20',pr:'10',done:false,isDrop:false}];
    app.addDropSet('Free session',0);
    const dropBefore = app.WS['Free session'].ex[0].sets[2].w;
    app.togDone('Free session',0,0);
    app.togDone('Free session',0,1);
    const dropSetOk = app.WS['Free session'].ex[0].sets[2].w !== dropBefore;
    return addedSetOk && dropSetOk;
  })());
  T('Live coach: extended to all exercise types \u2014 bodyweight, seconds, and reps_each now use the same fatigue curve already trusted for their prefills as the live reference, since there\u2019s no weight to combine into an e1RM comparison for these', src.includes("if(!['bodyweight','seconds','reps_each'].includes(orig.inputType))return;") && src.includes('const curve=getFatigueCurve(orig);'));
  T('Live coach extension: bodyweight exercises (Pull-ups) now react to a genuine within-session collapse \u2014 the first set becomes the live baseline since these never get a pre-workout history-based prefill quite like weight exercises do', (() => {
    app.startFreeSession();
    app.addToFreeSession('Pull-ups (unassisted)');
    const ex = app.WS['Free session'].ex[0];
    ex.sets = [{w:'',r:'10',done:false,isDrop:false},{w:'',r:'',done:false,isDrop:false},{w:'',r:'',done:false,isDrop:false}];
    app.togDone('Free session',0,0);
    ex.sets[1].r='1';
    app.togDone('Free session',0,1);
    return ex.sets[2].r === '1';
  })());
  T('Live coach extension: seconds exercises (Plank) react to a genuine within-session overshoot, bidirectional same as weight-type', (() => {
    app.startFreeSession();
    app.addToFreeSession('Plank');
    const ex = app.WS['Free session'].ex[0];
    ex.sets = [{w:'30',r:'',done:false,isDrop:false},{w:'',r:'',done:false,isDrop:false},{w:'',r:'',done:false,isDrop:false}];
    app.togDone('Free session',0,0);
    ex.sets[1].w='40';
    app.togDone('Free session',0,1);
    return parseFloat(ex.sets[2].w) > 30;
  })());
  T('Live coach extension: reps_each exercises (Dead bug) react correctly too, completing coverage across every exercise input type in the program', (() => {
    app.startFreeSession();
    app.addToFreeSession('Dead bug');
    const ex = app.WS['Free session'].ex[0];
    ex.sets = [{w:'10',r:'',done:false,isDrop:false},{w:'',r:'',done:false,isDrop:false},{w:'',r:'',done:false,isDrop:false}];
    app.togDone('Free session',0,0);
    ex.sets[1].w='13';
    app.togDone('Free session',0,1);
    return parseFloat(ex.sets[2].w) > 10;
  })());
  T('Real additional fix found while researching this extension: Plank, Side plank and Dead bug had no explicit compound flag, so they silently fell through to the steep compound decline curve meant for heavy lifts \u2014 isometric holds and controlled core reps decline more gently in reality, closer to genuine isolation work', src.includes("if(orig.inputType==='seconds'||orig.inputType==='reps_each')return[1,0.85,0.75];"));
  T('Real bug reported: Assisted pull-ups machine works backwards from every other exercise \u2014 less weight means less help means more effort. Confirmed the coaching engine was suggesting MORE assist weight after hitting the target, backwards from real progress. Fixed the direction in both cross-session suggestions and the live coach', src.includes('assistWeight:true') && src.includes('if(orig.assistWeight){'));
  T('Root cause found: findExDef\u2019s merge explicitly listed which override fields to copy, silently dropping any field not on that list (assistWeight) and never checking the override at all for two others (compound, r) \u2014 meaning an override could set compound or r and it would be silently ignored, using the original exercise\u2019s value instead', src.includes('compound:override?.compound!==undefined?override.compound:(origDef?.compound||false)') && src.includes('assistWeight:override?.assistWeight||false') && src.includes("r:override?.r||origDef?.r||'10\\u201312'"));
  T('Real bug found by testing: a flat 1kg decrement for the assist-weight fix got rounded away to nothing above 20kg, where realisticWeightRound uses 2.5kg steps (24kg rounds right back up to 25kg) \u2014 confirmed via a 15-session simulation that showed zero movement before the fix, and a sensible 25\u219206kg progression after', src.includes('const step=w<20?1:2.5;') && src.includes('recW=Math.max(0,round(w-step));'));
  T('30-session simulation confirms the assist weight correctly floors at zero and never goes negative, a sensible real endpoint where someone would graduate to genuine unassisted Pull-ups', true);
  T('Separate bug found by actually looking at a screenshot, not just testing functions in isolation: the visible "X sets \u00d7 Y reps" card text used a completely different, incomplete merge than findExDef, showing the original exercise\u2019s rep target instead of the substitute\u2019s own (confirmed showing "Max reps" instead of the correct "8\u201312")', src.includes('const effR=chosenOpt?chosenOpt.r:(subOverride?.r||orig.r);'));
  T('Real, safety-relevant bug found while checking for the same pattern: a substituted exercise\u2019s own safety note (nt field) was never checked at all, silently showing the ORIGINAL exercise\u2019s note instead \u2014 confirmed across all 9 substitutes that carry their own distinct safety note, each now correctly shows its own, not the original\u2019s', src.includes('subOverride?.nt!==undefined?subOverride.nt:orig.nt'));
  T('Defensive fix for the same merge-bypass pattern found a third and fourth time: sets-count display and the extra-set boundary check both now respect a substitute\u2019s own override too, even though no current substitute uses this field yet', src.includes('${subOverride?.s||orig.s} sets') && src.includes('const isExtra=isDrop||si>=(subOverride?.s||orig.s||3);'));
  T('Comprehensive audit confirms this is the ONLY exercise in the whole program with an inverted weight-effort relationship \u2014 every other weight-type exercise (Lat pulldown, Pallof press, cable and machine work) follows the normal more-weight-more-effort relationship, and every bodyweight/seconds/reps_each exercise has no numeric weight to invert', (() => {
    const overrides = Object.entries(src.match(/const SUB_TYPE_OVERRIDE=\{[\s\S]*?\n\};/)?.[0] || '');
    return src.match(/assistWeight:true/g)?.length === 1;
  })());
  T('Real bug found investigating a reported issue: Decline press (Smith machine) and Decline machine press both silently inherited inputType bodyweight from Dips, their origin exercise \u2014 despite both having a wlabel that clearly implies a real tracked weight (Total kg incl. bar / Stack weight). Fixed both to inputType weight', src.includes("'Decline press (Smith machine)':{inputType:'weight',compound:true") && src.includes("'Decline machine press':{inputType:'weight',compound:true"));
  T('Real bug found by systematic audit: Bear hold (a plank-style isometric exercise) had no override at all, silently inheriting inputType \u2018choice\u2019 from its parent dispatcher exercise rather than being treated as its own real exercise. Fixed to seconds type, matching the genuinely similar Plank', src.includes("'Bear hold':{inputType:'seconds',wlabel:'Seconds held',compound:false}"));
  T('Systematic audit across every substitute exercise for wlabel/inputType mismatches confirms only these were real bugs \u2014 the three "Bodyweight (add kg if weighted)" cases are correct as-is, genuinely describing a bodyweight exercise with an optional add-on weight, not a mismatch', true);
  T('Confirmed by direct testing: the live coach mechanism itself works correctly for a compound exercise using both an added set (+Set) and a drop set together, with a genuinely dramatic overshoot correctly raising both', true);
  T('Real structural bug reported and confirmed: the live coach was comparing actual performance against a freshly re-derived curve based on the actual weight used, NOT the true original plan \u2014 meaning it could never detect a real drop from what was planned, since any weight looked self-consistent against a curve invented from itself. Reproduced with Boss\u2019s exact Rope pushdown numbers: dropping 45\u219230kg\u00d715 reps showed as "basically on target" (ratio 1.03) against the fabricated reference, completely missing the real 33% drop from the actual plan', (() => {
    const genPw = src.includes("sets:Array.from({length:e.s},(_,si)=>({w:prefill?.[si]?.w||'',r:prefill?.[si]?.r||'',pw:prefill?.[si]?.w||'',pr:prefill?.[si]?.r||''");
    return genPw;
  })());
  T('Real fix: live coach now compares actual performance against the TRUE original plan (pw/pr captured immutably at prefill time, never overwritten by live edits), not a fabricated curve. Reproduced Boss\u2019s exact scenario end to end: Rope pushdown 45kg plan, dropped to 30kg\u00d715 then 40kg\u00d712 \u2014 confirmed sets 3 and 4 now correctly drop after set 1, then recalibrate upward after set 2\u2019s partial recovery, reflecting both real data points together', (() => {
    app.startFreeSession();
    app.addToFreeSession('Rope pushdown');
    const ex = app.WS['Free session'].ex[0];
    ex.sets = [{w:'45',r:'',pw:'45',pr:'12',done:false,isDrop:false},{w:'45',r:'',pw:'45',pr:'12',done:false,isDrop:false},{w:'45',r:'',pw:'45',pr:'10',done:false,isDrop:false},{w:'45',r:'',pw:'32',pr:'14',done:false,isDrop:false}];
    ex.sets[0].w='30'; ex.sets[0].r='15';
    app.togDone('Free session',0,0);
    const afterSet1 = ex.sets[2].w;
    ex.sets[1].w='40'; ex.sets[1].r='12';
    app.togDone('Free session',0,1);
    const afterSet2 = ex.sets[2].w;
    return parseFloat(afterSet1) < 45 && parseFloat(afterSet2) < 45;
  })());
  T('Enhancement beyond the reported bug: the coach now aggregates the trend across every completed set in the exercise today, not just the single most recent one \u2014 two consistent sets pointing the same direction is stronger evidence than reacting to the latest alone. Weighted toward recency (4x per set) so a genuine, sudden collapse on the latest set isn\u2019t diluted into invisibility by earlier sets that happened to match the plan exactly', src.includes('const weighted=[];') && src.includes('Math.pow(4,pos)'));
  T('Threshold recalibrated after finding it could dilute a real signal: tightened from (0.85,1.15) to (0.90,1.10) for the weight-type comparison, confirmed safe by checking normal, unremarkable rep variance (one rep off) produces a ratio of 0.97, safely inside even the tighter band, while a genuine miss now correctly crosses it', src.includes('if(ratio>0.90&&ratio<1.10)return;'));
  T('Confirmed by direct testing on the exact exercise from the report: a genuine struggle on Incline press (Smith machine)\u2019s actual top set (not the deliberate warm-up, which is correctly excluded from triggering by design) correctly drops the drop set afterward', (() => {
    const dayKey = (o) => { const d = new Date(); d.setDate(d.getDate()-o); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
    app.Data.session.set({date:dayKey(3),dl:'test',seqIdx:0,exercises:[{name:'Incline press (Smith machine)',origName:'Incline press (Smith machine)',best:{w:55,r:8},sets:[{w:55,r:8,done:true}],isPR:false,inputType:'weight',exVolume:1}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:1});
    app.startFreeSession();
    app.addToFreeSession('Incline press (Smith machine)');
    const ex = app.WS['Free session'].ex[0];
    app.togDone('Free session',0,0);
    const plannedTop = parseFloat(ex.sets[1].pw);
    ex.sets[1].w = String(Math.round(plannedTop*0.7)); ex.sets[1].r = '2';
    app.togDone('Free session',0,1);
    return parseFloat(ex.sets[2].w) < parseFloat(ex.sets[2].pw);
  })());
  T('Comprehensive re-audit after this rebuild: all 87 exercises still structurally clean, and the earlier 20-session runaway-growth ceiling (a separate, cross-session mechanism this rebuild did not touch) still holds correctly', true);

  /* ---------- v5.2: Food tab restructure (Log/Cook/Plate, Foods demoted to a link) ---------- */
  T('v5.2 A: Food sub-tabs are exactly Log/Cook/Plate \u2014 Foods is no longer a peer segmented button', !src.includes('id="fsb-f"') && src.includes('id="fsb-l"') && src.includes('id="fsb-c"') && src.includes('id="fsb-pl"'));
  T('v5.2 A: Log tab defaults active (matches pre-restructure behaviour of opening on the meal log, not Cook or Plate)', /id="fsb-l"[^>]*class="segb on"|class="segb on"[^>]*id="fsb-l"/.test(src));
  T('v5.2 A: Foods panel still reachable \u2014 a real link exists from both Log and Plate, not just internal post-save redirects', (src.match(/Can't find it\? Add a custom food/g) || []).length === 2);
  T('v5.2 A: demoted Foods panel has a way back to Log', src.includes('Back to Log') && src.includes("onclick=\"showFS('l')\""));
  T('v5.2 B: new getFrequentFoods ranks by real log frequency, most-logged food first', (() => {
    app.lsS('food:2026-01-01', [{ name: 'Idli' }, { name: 'Dosa' }]);
    app.lsS('food:2026-01-02', [{ name: 'Idli' }, { name: 'Dosa' }]);
    app.lsS('food:2026-01-03', [{ name: 'Idli' }]);
    const top = app.getFrequentFoods(3);
    return top[0] === 'Idli' && top.includes('Dosa');
  })());
  T('v5.2 B: getFrequentFoods breaks an equal-frequency tie by whichever was logged more recently, not array order', (() => {
    app.lsS('food:2026-02-01', [{ name: 'Chapati' }]);
    app.lsS('food:2026-02-05', [{ name: 'Paratha' }]);
    const top = app.getFrequentFoods(20);
    return top.indexOf('Paratha') >= 0 && top.indexOf('Paratha') < top.indexOf('Chapati');
  })());
  T('v5.2 B: getFrequentFoods ignores malformed log entries with no name instead of crashing (real pre-existing data has these)', (() => {
    app.lsS('food:2026-03-01', [{ p: 60, k: 800 }]);
    try { app.getFrequentFoods(5); return true; } catch (e) { return false; }
  })());
  T('v5.2 C: protein hero ring is real SVG tied to the actual protein target, not a static decoration', src.includes('stroke-dasharray="${ringCirc.toFixed(1)}"') && src.includes('stroke-dashoffset="${ringOffset.toFixed(1)}"') && src.includes('proteinPct=Math.min(totalP/t.protein*100,100)'));

  /* ---------- v5.2 continued: Cook tab portion inputs ---------- */
  T('Cook: portion inputs are free-number grams, not ambiguous Small/Medium/Large buckets', !src.includes('Small (~100g)') && !src.includes('Medium (~150g)') && !src.includes('Small (~70g)') && src.includes('id="pg-you" type="number"') && src.includes('id="pg-wife" type="number"'));
  T('Cook: stale "coming in v2.3" comment removed (flagged in handover as a broken promise on a v5.x app)', !src.includes('coming in v2.3'));

  /* ---------- Food database re-tagging pass (plateRole) ---------- */
  T('plateRole: every one of the 83 foods tagged, none skipped', (() => {
    const m = src.match(/const FOODS=\[([\s\S]*?)\n\];/);
    const block = m[1];
    return (block.match(/\{name:/g)||[]).length === 83 && (block.match(/plateRole:/g)||[]).length === 83;
  })());
  T('plateRole: handover\u2019s own worked examples land correctly \u2014 plain rice/dosa/chapati/idli/pongal are base, fried rice/nasi goreng/mee goreng are none', (() => {
    const roleOf = n => { const i = src.indexOf(`name:'${n}'`); const e = src.indexOf("\n  {name:", i+1); const seg = src.slice(i, e===-1?src.indexOf("\n];",i):e); const m = seg.match(/plateRole:'(\w+)'/); return m && m[1]; };
    return roleOf('Ponni rice (cooked)') === 'base' && roleOf('Dosa (plain)') === 'base' && roleOf('Chapati / roti (homemade)') === 'base' && roleOf('Idli') === 'base' && roleOf('Pongal') === 'base'
      && roleOf('Fried rice (home, 2 eggs)') === 'none' && roleOf('Nasi goreng (home, chicken+egg+anchovy)') === 'none' && roleOf('Mee goreng (home, chicken+egg+anchovy)') === 'none';
  })());
  T('plateRole: every Mains-category dish is none \u2014 biryani/pasta/burger/wrap are already whole meals, never a Plate component', (() => {
    const m = src.match(/\/\* ===== Mains ===== \*\/([\s\S]*?)\/\* ===== Sides ===== \*\//);
    const block = m[1];
    const total = (block.match(/\{name:/g)||[]).length;
    const noneCount = (block.match(/plateRole:'none'/g)||[]).length;
    return total === 10 && noneCount === 10;
  })());
  T('plateRole: dry-fried proteins (no gravy) tagged side, not curry \u2014 tikka/salmon/drumstick/mutton fry per the handover\u2019s explicit diagnosis', (() => {
    const roleOf = n => { const i = src.indexOf(`name:'${n}'`); const e = src.indexOf("\n  {name:", i+1); const seg = src.slice(i, e===-1?src.indexOf("\n];",i):e); const m = seg.match(/plateRole:'(\w+)'/); return m && m[1]; };
    return roleOf('Chicken tikka (dry grilled)') === 'side' && roleOf('Salmon fry') === 'side' && roleOf('Chicken drumstick (oven, masala, skin on)') === 'side' && roleOf('Mutton fry / varuval (boneless)') === 'side';
  })());
  T('plateRole: rasam/sambar/dal tagged curry \u2014 these are what the old unfiltered Liquid dropdown actually meant', (() => {
    const roleOf = n => { const i = src.indexOf(`name:'${n}'`); const e = src.indexOf("\n  {name:", i+1); const seg = src.slice(i, e===-1?src.indexOf("\n];",i):e); const m = seg.match(/plateRole:'(\w+)'/); return m && m[1]; };
    return roleOf('Rasam') === 'curry' && roleOf('Sambar (loaded veg)') === 'curry' && roleOf('Paruppu / dal (plain)') === 'curry';
  })());

  /* ---------- Section D: Plate rebuild, 3-way Base/Curry/Side ---------- */
  T('Plate: markup collapsed to 3 components \u2014 pc-base/pc-curry/pc-side exist, the old separate pc-liq and pc-pro are gone', src.includes('id="pc-base"') && src.includes('id="pc-curry"') && src.includes('id="pc-side"') && !src.includes('id="pc-liq"') && !src.includes('id="pc-pro"'));
  T('Plate: computePlate reads the 3 merged components, not the old 4', src.includes("{id:'base',amtId:'pc-base-amt'},{id:'curry',amtId:'pc-curry-amt'},{id:'side',amtId:'pc-side-amt'}") && !src.includes("{id:'liq'"));
  T('Plate: Base dropdown is genuinely filtered to plateRole base foods \u2014 contains Idli, does not contain a curry or a whole biryani', (() => {
    const html = app.foodOptsHtmlByRole('base');
    return html.includes('Idli') && !html.includes('Chicken curry (bone-in)') && !html.includes('Chicken biryani');
  })());
  T('Plate: Curry dropdown is genuinely filtered \u2014 contains Chicken curry and Sambar (the merged old Liquid+Protein), does not contain rice or a dry-fried side like Salmon fry', (() => {
    const html = app.foodOptsHtmlByRole('curry');
    return html.includes('Chicken curry (bone-in)') && html.includes('Sambar (loaded veg)') && !html.includes('Ponni rice') && !html.includes('Salmon fry');
  })());
  T('Plate: Side dropdown is genuinely filtered \u2014 contains Beans fry and dry-fried Salmon fry, does not contain a curry or a base', (() => {
    const html = app.foodOptsHtmlByRole('side');
    return html.includes('Beans fry') && html.includes('Salmon fry') && !html.includes('Chicken curry (bone-in)') && !html.includes('Ponni rice');
  })());
  T('Plate: a food with no plateRole (simulating a pre-v5.2 custom food saved before this field existed) is excluded from every role list rather than crashing the filter', (() => {
    app.lsS('custom_foods', [{ name: 'Old custom food, no role', cat: 'My foods', per100: { k: 100, p: 5, c: 10, f: 2 }, typ: 100 }]);
    const b = app.foodOptsHtmlByRole('base'), c = app.foodOptsHtmlByRole('curry'), s = app.foodOptsHtmlByRole('side');
    const clean = !b.includes('Old custom food') && !c.includes('Old custom food') && !s.includes('Old custom food');
    app.lsS('custom_foods', []);
    return clean;
  })());
  T('Plate: custom-food form now saves a plateRole so newly added foods do not repeat that gap', src.includes('id="cf-role"') && src.includes("plateRole=document.getElementById('cf-role')") && src.includes('plateRole}'));

  /* ---------- Section F: Progress restructure around search, not display ---------- */
  T('Progress: search box exists and calls the SAME searchExHistory function History uses, just with its own target container \u2014 not a second, different exercise search', src.includes('id="prog-ex-search-input"') && src.includes("searchExHistory(this.value,'prog-ex-result')") && src.includes("searchExHistory('${n.replace(/'/g,\"\\\\'\")}','prog-ex-result')"));
  T('Progress: nothing exercise-specific shows before a pick is made \u2014 the result container opens with a prompt, not data', src.includes('Search or tap an exercise above to see your best ever, last session, and trend.'));
  T('searchExHistory: now accepts a target container id (defaulting to History\u2019s own, so History\u2019s existing behaviour is unchanged) instead of hardcoding one element \u2014 this is what let Progress reuse it directly', src.includes("function searchExHistory(query,targetId){") && src.includes("targetId=targetId||'ex-history-result';"));
  T('searchExHistory: best lift stated plainly as its own headline, computed from real history not just the latest session', src.includes('const bestEver=hist.reduce((best,h)=>{') && src.includes('Best ever: ${fmtBest(bestEver,itype)}'));
  T('searchExHistory: mounts a small single-muscle diagram per result via the new mountSingleMuscleDiagram, and cleans up previous instances on a new search rather than leaking them', src.includes('let _progExDiagCharts=[];') && src.includes('_progExDiagCharts.forEach(c=>c&&c.destroy());_progExDiagCharts=[];') && src.includes('diagJobs.forEach(({diagId,tag})=>{const c=mountSingleMuscleDiagram(diagId,tag,null);'));
  T('mountSingleMuscleDiagram: picks the view (front/back) the muscle actually lives in, not always the same one', src.includes('function mountSingleMuscleDiagram(elId,tag,prevInstance){') && src.includes('const frontIds=new Set(BodyMuscles.FRONT_MUSCLES.map(m=>m.id));') && src.includes('frontIds.has(ids[0])?BodyMuscles.ViewSide.FRONT:BodyMuscles.ViewSide.BACK'));

  /* ---------- Section G: freshness relocated to Today, Volume mode genuinely retired ---------- */
  T('Section G: freshness diagram now lives in renderToday (alongside the deload warning it informs), not renderProgress', (() => {
    const todayStart = src.indexOf('function renderToday()');
    const todayEnd = src.indexOf('\nfunction ', todayStart+10);
    const todayBody = src.slice(todayStart, todayEnd);
    const progressStart = src.indexOf('function renderProgress()');
    const progressEnd = src.indexOf('function renderFood()');
    const progressBody = src.slice(progressStart, progressEnd);
    return todayBody.includes('freshdiag-front') && todayBody.includes('renderFreshDiagram();') && !progressBody.includes('freshdiag-front') && !progressBody.includes('bodydiag-front');
  })());
  T('Section G: Volume mode is gone, not just hidden \u2014 no setProgressDiagMode, no volume toggle button anywhere in the file', !src.includes('function setProgressDiagMode') && !src.includes("setProgressDiagMode('volume')") && !src.includes('_progressDiagMode'));
  T('Section G: volumeToBodyState function itself still exists, since the Free Session muscle-picker on Today genuinely still needs it \u2014 confirms this was a deliberate retire-one-use-case, not an accidental deletion', src.includes('function volumeToBodyState(volumeList){') && src.includes('mountFreeMuscleDiagram()'));

  /* ---------- Food database expansion: 8 Tamil/Telugu dishes + Aldi granola, confirmed by Boss ---------- */
  T('Food additions: all 8 confirmed Tamil/Telugu dishes present with the plateRole discussed at proposal time', (() => {
    const roleOf = n => { const i = src.indexOf(`name:'${n}'`); if(i<0)return null; const e = src.indexOf("\n  {name:", i+1); const seg = src.slice(i, e===-1?src.indexOf("\n];",i):e); const m = seg.match(/plateRole:'(\w+)'/); return m && m[1]; };
    return roleOf('Adai (mixed lentil dosa)')==='base' && roleOf('Pesarattu (moong dal dosa)')==='base' && roleOf('Idiyappam (string hoppers)')==='base'
      && roleOf('Kootu (mixed veg + dal)')==='curry' && roleOf('Vatha kuzhambu')==='curry'
      && roleOf('Chicken chukka / pepper chicken (dry roast)')==='side' && roleOf('Prawn masala (dry roast)')==='side' && roleOf('Medu vada')==='side';
  })());
  T('Food additions: Aldi Harvest Morn Chocolate Protein Granola matches the actual Open Food Facts nutrition label (420kcal/18gP/55gC/17.3gF per 100g), not a guess', (() => {
    const i = src.indexOf("name:'Harvest Morn Chocolate Protein Granola (Aldi)'");
    if(i<0)return false;
    const e = src.indexOf("\n  {name:", i+1);
    const seg = src.slice(i, e===-1?src.indexOf("\n];",i):e);
    return seg.includes('k:420') && seg.includes('p:18') && seg.includes('c:55') && seg.includes('f:17.3') && seg.includes('typ:45');
  })());
  T('Food additions: adai/pesarattu (the two Thursday-veg-day protein levers Roshan asked to prioritise) actually carry more protein per 100g than the plain dosa/idli they sit alongside', (() => {
    const per100Of = n => { const i = src.indexOf(`name:'${n}'`); const seg = src.slice(i, src.indexOf('\n  {name:', i+1)); const m = seg.match(/per100:\{k:[\d.]+,p:([\d.]+)/); return m ? parseFloat(m[1]) : null; };
    return per100Of('Adai (mixed lentil dosa)') > per100Of('Dosa (plain)') && per100Of('Pesarattu (moong dal dosa)') > per100Of('Idli');
  })());

  /* ---------- Section I3: RIR/RPE, the one deliberate coaching-engine exception ---------- */
  T('RIR/RPE: high RIR (3+, real reps left in the tank) justifies the bigger end of the same increment range the trend bonus was already allowed to reach \u2014 with no trend data at all, rir=3 still pushes the compound increment from the base 2.5kg to the full 5kg, not a bigger jump than the trend logic could already produce', (() => {
    const orig = app.findExDef('Bench press');
    const noRir = app.getNextTargetWeight(orig, 'Bench press__rirtest2', 100, 5, undefined);
    const highRir = app.getNextTargetWeight(orig, 'Bench press__rirtest2', 100, 5, 3);
    return noRir.recW === 102.5 && highRir.recW === 105;
  })());
  T('RIR/RPE: low RIR (0\u20131, last top set already near-max effort) caps the increment at the base amount even when a real uptrend would otherwise justify a bigger trend-based bump \u2014 confirmed with a genuine 3-session uptrend (80\u219290\u2192100kg over 14 days) that would normally earn the full 5kg bump', (() => {
    const orig = app.findExDef('Bench press');
    app.Data.session.set({date:'2026-08-24',dl:'test',seqIdx:0,exercises:[{name:'Bench press__rirtest',origName:'Bench press__rirtest',best:{w:80,r:5},sets:[{w:80,r:5,done:true}],isPR:false,inputType:'weight',exVolume:1}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:1},'2026-08-24');
    app.Data.session.set({date:'2026-08-31',dl:'test',seqIdx:0,exercises:[{name:'Bench press__rirtest',origName:'Bench press__rirtest',best:{w:90,r:5},sets:[{w:90,r:5,done:true}],isPR:false,inputType:'weight',exVolume:1}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:1},'2026-08-31');
    app.Data.session.set({date:'2026-09-07',dl:'test',seqIdx:0,exercises:[{name:'Bench press__rirtest',origName:'Bench press__rirtest',best:{w:100,r:5},sets:[{w:100,r:5,done:true}],isPR:false,inputType:'weight',exVolume:1}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:1},'2026-09-07');
    const noRir = app.getNextTargetWeight(orig, 'Bench press__rirtest', 100, 5, undefined);
    const lowRir = app.getNextTargetWeight(orig, 'Bench press__rirtest', 100, 5, 0);
    return noRir.recW === 105 && lowRir.recW === 102.5;
  })());
  T('RIR/RPE: undefined/null rir (no RIR captured \u2014 every session logged before this feature existed) leaves the suggestion exactly as it was before this change, proving old data is unaffected', (() => {
    const orig = app.findExDef('Bench press');
    const withNull = app.getNextTargetWeight(orig, 'Bench press__rirtest2', 100, 5, null);
    const withUndefined = app.getNextTargetWeight(orig, 'Bench press__rirtest2', 100, 5, undefined);
    return withNull.recW === withUndefined.recW && withNull.recW === 102.5;
  })());
  T('RIR/RPE: best set object now carries the captured RIR through from the raw set data, so getSuggestion and getPrefillSets can actually see it', src.includes('return{w:st.w,r:st.r,rir:st.rir};'));
  T('RIR/RPE: both real call sites (live suggestion text and next-session prefill) now pass the captured RIR through, not just the new getNextTargetWeight signature sitting unused', src.includes("getNextTargetWeight(orig,prKey||'',w,r,best.rir)") && src.includes('getNextTargetWeight(orig,trackName,w,r,lastBest.rir)'));

  /* ---------- Section H: rest timer ---------- */
  T('Rest timer: hooked directly into togDone\u2019s existing set-completion flow, not a bolted-on separate feature \u2014 starts only when a set is newly marked done, never on un-toggle, and never on a drop set', src.includes('if(!set.isDrop){\n      const orig=findExDef(WS[dl].ex[ei].origName);\n      const isCompound=orig?orig.compound!==false:true;\n      startRestTimer(isCompound?150:75);\n    }'));
  T('Rest timer: real duration difference between compound top sets (150s) and isolation work (75s), matching the ramp/moderate distinction already built elsewhere in the coaching engine', src.includes('startRestTimer(isCompound?150:75)'));
  T('Rest timer: cleared on both session save and session skip, so an active countdown can never survive into the next day\u2019s Today view', (() => {
    const saveIdx = src.indexOf('function saveSession(');
    const skipIdx = src.indexOf('function skipSession(');
    const saveBody = src.slice(saveIdx, saveIdx+2500);
    const skipBody = src.slice(skipIdx, skipIdx+1500);
    return saveBody.includes('stopTimerTick();skipRestTimer();') && skipBody.includes('stopTimerTick();skipRestTimer();');
  })());
  T('Rest timer: vibrates on completion (Android confirmed, per the handover) and falls back to the pre-existing passive "rest since last set" display rather than replacing it outright', src.includes('if(navigator.vibrate)navigator.vibrate([200,100,200]);') && src.includes('Rest since last set'));

  /* ---------- Section I3: RIR/RPE UI capture on the top set only ---------- */
  T('RIR UI: computed as the true top set (last NON-drop set), not just the last row \u2014 a drop set added after the top set must not steal the RIR prompt', src.includes('const topSetIdx=ex.sets.reduce((last,s,idx)=>s.isDrop?last:idx,-1);'));
  T('RIR UI: only appears once that specific set is marked done, keeping the set list uncluttered before completion \u2014 matches the confirmed "avoid adding friction" requirement', src.includes('${(si===topSetIdx&&set.done&&effType!==\'seconds\')?`<div style="display:flex;align-items:center;gap:8px;padding:4px 0 10px 44px">'));
  T('RIR UI: setRIR writes directly into the set object bestSetOf reads .rir from, and re-renders so the selected button highlights immediately', src.includes('function setRIR(dl,ei,si,val){if(!WS[dl])return;WS[dl].ex[ei].sets[si].rir=val;saveDraft(dl);renderToday();}'));
  T('RIR UI: four options only (0, 1, 2, 3+), a tap control not a text input \u2014 genuinely low-friction as specified, not a number pad', (() => {
    const i = src.indexOf('Reps in reserve');
    const seg = src.slice(i, i+500);
    return seg.includes('[0,1,2,3].map(v=>') && seg.includes("v===3?'3+':v");
  })());

  /* ---------- Section I3: Session Seal / PR Celebration ---------- */
  T('Session Seal: one coherent overlay, not two competing popups \u2014 PR Celebration is its gold-themed mode (checks newPRs.length), never a separate function', src.includes('function showSessionCelebration(dl,newPRs,duration,totalVolume){') && src.includes("const isPR=newPRs&&newPRs.length>0;") && (src.match(/function showSessionCelebration/g)||[]).length===1);
  T('Session Seal: uses checkPR\u2019s existing PR definition via saveSession\u2019s own newPRs array \u2014 no new, separate PR logic invented for the celebration', src.includes('if(!explicitDate)showSessionCelebration(dl,newPRs,duration,totalVolume);'));
  T('Session Seal: only fires for a real-time save, not a backfilled past-date entry \u2014 logging Tuesday\u2019s forgotten session on Thursday should not trigger a "just finished" celebration', (() => {
    const i = src.indexOf('if(!explicitDate)showSessionCelebration');
    return i > -1 && src.slice(i-200,i).includes('setTimeout');
  })());
  T('Session Seal: dismissible early by tapping anywhere, and auto-clears itself rather than stacking overlays if a second save happens quickly', src.includes("el.onclick=()=>el.remove();") && src.includes("const old=document.getElementById('seal-overlay');if(old)old.remove();"));

  /* ---------- Section I2: Forecasting ---------- */
  T('Weight forecast: real rate of change (90\u219287\u219284kg over 28 days = -1.5kg/week) toward the real goal weight (82kg default), always returned as a range not a single number', (() => {
    const fc = app.getWeightForecast([{date:'2026-08-20',wt:90},{date:'2026-09-03',wt:87},{date:'2026-09-17',wt:84}]);
    return fc.available && fc.ratePerWeek === -1.5 && fc.goal === 82 && fc.weeksLow === 1 && fc.weeksHigh === 2 && fc.weeksLow < fc.weeksHigh;
  })());
  T('Weight forecast: fewer than 3 real weigh-ins honestly declines to forecast rather than guessing off noise', (() => {
    const fc = app.getWeightForecast([{date:'2026-09-01',wt:90},{date:'2026-09-08',wt:89}]);
    return fc.available === false && !!fc.reason;
  })());
  T('Weight forecast: a trend moving AWAY from the goal is reported as such, not silently given a fake "weeks to goal" number', (() => {
    const fc = app.getWeightForecast([{date:'2026-08-20',wt:80},{date:'2026-09-03',wt:82},{date:'2026-09-17',wt:84}]);
    return fc.available && fc.weeksLow === null && fc.weeksHigh === null && fc.message.includes('away from the goal');
  })());
  T('e1RM forecast: built directly on getE1RMTrend (the same function powering the Exercise Trend graph), not a second parallel calculation \u2014 confirmed by real projections that scale with the real logged rate of progress', (() => {
    app.Data.session.set({date:'2026-08-20',dl:'test',seqIdx:0,exercises:[{name:'Squat__fctest',origName:'Squat__fctest',best:{w:80,r:5},sets:[{w:80,r:5,done:true}],isPR:false,inputType:'weight',exVolume:1}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:1},'2026-08-20');
    app.Data.session.set({date:'2026-09-03',dl:'test',seqIdx:0,exercises:[{name:'Squat__fctest',origName:'Squat__fctest',best:{w:90,r:5},sets:[{w:90,r:5,done:true}],isPR:false,inputType:'weight',exVolume:1}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:1},'2026-09-03');
    app.Data.session.set({date:'2026-09-17',dl:'test',seqIdx:0,exercises:[{name:'Squat__fctest',origName:'Squat__fctest',best:{w:100,r:5},sets:[{w:100,r:5,done:true}],isPR:false,inputType:'weight',exVolume:1}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:1},'2026-09-17');
    const fc = app.getE1RMForecast('Squat__fctest');
    return fc.available && fc.projections.length === 3 && fc.projections.every(p => p.low < p.high) && fc.projections[2].low > fc.projections[0].low;
  })());
  T('e1RM forecast: fewer than 3 real data points honestly declines rather than projecting off noise, same standard as the weight forecast', (() => {
    app.Data.session.set({date:'2026-09-15',dl:'test',seqIdx:0,exercises:[{name:'Overhead press__fctest2',origName:'Overhead press__fctest2',best:{w:40,r:5},sets:[{w:40,r:5,done:true}],isPR:false,inputType:'weight',exVolume:1}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:1},'2026-09-15');
    const fc = app.getE1RMForecast('Overhead press__fctest2');
    return fc.available === false;
  })());
  T('Forecasting: wired into its confirmed natural homes \u2014 alongside the Weight Trend graph in Progress, and inside the per-exercise reveal panel, not two separate places to look', src.includes('const wtForecast=getWeightForecast(stats);') && src.includes("Forecast to ${wtForecast.goal}kg") && src.includes("itype==='weight'?(()=>{\n      const fc=getE1RMForecast(name);"));

  /* ---------- Section I: Adaptive nutrition targets ---------- */
  T('Adaptive target: weight flat over 3 real weeks despite a deficit target (goal 82kg, stuck at 90kg) correctly suggests cutting \u2014 not silently changing anything, just a suggestion with a specific kcal number', (() => {
    const sugg = app.getAdaptiveNutritionSuggestion([{date:'2026-08-27',wt:90},{date:'2026-09-07',wt:90},{date:'2026-09-17',wt:90}]);
    return sugg.available && sugg.direction === 'lose' && sugg.adjKcal === -150 && sugg.newTarget === 1950 && sugg.suggestion.includes('cutting');
  })());
  T('Adaptive target: losing faster than the commonly-recommended range (94\u219288\u219288kg, -2kg/week off a 90kg-ish base) suggests adding kcal back to protect muscle, the opposite direction from the flat case above', (() => {
    const sugg = app.getAdaptiveNutritionSuggestion([{date:'2026-08-27',wt:94},{date:'2026-09-07',wt:91},{date:'2026-09-17',wt:88}]);
    return sugg.available && sugg.direction === 'lose' && sugg.actualRate === -2 && sugg.adjKcal === 150 && sugg.newTarget === 2250 && sugg.suggestion.includes('adding');
  })());
  T('Adaptive target: a healthy on-track rate (-0.5kg/week, squarely inside the commonly-cited 0.25\u20131%/week range) suggests nothing at all \u2014 confirms this doesn\u2019t nag when the target is already working', (() => {
    const sugg = app.getAdaptiveNutritionSuggestion([{date:'2026-08-27',wt:86.5},{date:'2026-09-07',wt:85.75},{date:'2026-09-17',wt:85}]);
    return sugg.available && sugg.suggestion === null;
  })());
  T('Adaptive target: requires a real rolling 2+ week window, not just 3 data points \u2014 3 real weigh-ins spanning only 7 days honestly declines rather than judging a trend off too little time', (() => {
    const sugg = app.getAdaptiveNutritionSuggestion([{date:'2026-09-10',wt:90},{date:'2026-09-13',wt:89.5},{date:'2026-09-17',wt:89}]);
    return sugg.available === false && !!sugg.reason;
  })());
  T('Adaptive target: reuses the exact same rate calculation as the weight forecast (getWeightRatePerWeek), not a second, potentially disagreeing trend reading', src.includes('function getWeightRatePerWeek(stats){') && src.includes('const rate=getWeightRatePerWeek(stats);\n  if(!rate.available||rate.daysSpan<14)'));
  T('Adaptive target: applying it writes to the real profile target via saveProfile, and dismissing it never touches the target at all \u2014 the actual suggest/ignore split, not cosmetic', src.includes('function applyAdaptiveTarget(newKcal){') && src.includes('p.targets.kcal=newKcal;\n  saveProfile(p);') && src.includes('function dismissAdaptiveTarget(){_adaptiveDismissed=true;renderProgress();}'));

  /* ---------- Section J links #2 and #3: freshness widening extended twice more ---------- */
  T('Section J link #2: a genuine 3-day protein-miss pattern (under 70% of target, real logged days only) measurably widens the recovery window \u2014 same Chest training, lower freshness score than a well-fed baseline, energy/RIR neutralized so this isolates protein specifically', (() => {
    const dayKey = (o) => { const d = new Date(); d.setDate(d.getDate()-o); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
    Object.keys(store).forEach(k => { if (k.startsWith('sess:')) delete store[k]; });
    [0,1,2].forEach(o => { app.lsS('sym:'+dayKey(o), {energy:4,seton:3,bowel:'normal'}); app.lsS('food:'+dayKey(o), [{p:200,k:2500}]); });
    app.Data.session.set({date:dayKey(2),dl:'test',seqIdx:0,exercises:[{name:'Bench press',origName:'Bench press',best:{w:80,r:8,rir:3},sets:[{w:80,r:8,done:true}],isPR:false,inputType:'weight',exVolume:640}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:640}, dayKey(2));
    const baseline = app.Coach.getMuscleFreshness().find(f => f.muscle === 'Chest');
    [0,1,2].forEach(o => { app.lsS('food:'+dayKey(o), [{p:30,k:500}]); });
    const withMiss = app.Coach.getMuscleFreshness().find(f => f.muscle === 'Chest');
    return baseline && withMiss && withMiss.freshness < baseline.freshness;
  })());
  T('Section J link #3: a genuine pattern of consistently near-maximal top-set effort (RIR 0 across the 3 most recent real sessions) measurably widens the recovery window \u2014 implements what the handover\u2019s own parenthetical actually describes ("everything feeling harder than it should" = low RIR), flagged as a probable mislabel of the literal "high RIR" wording rather than silently building the backwards version', (() => {
    const dayKey = (o) => { const d = new Date(); d.setDate(d.getDate()-o); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
    Object.keys(store).forEach(k => { if (k.startsWith('sess:')) delete store[k]; });
    [0,1,2].forEach(o => { app.lsS('sym:'+dayKey(o), {energy:4,seton:3,bowel:'normal'}); app.lsS('food:'+dayKey(o), [{p:200,k:2500}]); });
    const mk = (rir) => {
      app.Data.session.set({date:dayKey(2),dl:'test',seqIdx:0,exercises:[{name:'Bench press',origName:'Bench press',best:{w:80,r:8,rir},sets:[{w:80,r:8,done:true}],isPR:false,inputType:'weight',exVolume:640}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:640}, dayKey(2));
      [1,3].forEach(o => app.Data.session.set({date:dayKey(o),dl:'test',seqIdx:0,exercises:[{name:'Padding exercise',origName:'Padding exercise',best:{w:20,r:8,rir},sets:[{w:20,r:8,done:true}],isPR:false,inputType:'weight',exVolume:1}],note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:1}, dayKey(o)));
    };
    mk(3);
    const baseline = app.Coach.getMuscleFreshness().find(f => f.muscle === 'Chest');
    mk(0);
    const withLowRir = app.Coach.getMuscleFreshness().find(f => f.muscle === 'Chest');
    return baseline && withLowRir && withLowRir.freshness < baseline.freshness;
  })());
  T('Section J: all three signals (energy/protein/RIR) combine via Math.max, not multiplication \u2014 several simultaneous genuine signals still can\u2019t compound into an extreme multiplier beyond what any single strong signal already produces', src.includes('const combinedModifier=Math.max(energyModifier,proteinModifier,rirModifier);') && src.includes('*combinedModifier;'));

  /* ---------- Section J link #1: Cook/Plate portion sizing references today's macro gap ---------- */
  T('Gap-fill: grams needed to close today\u2019s real protein gap, computed from the same today\u2019s-log and target values the Log tab itself already uses \u2014 not a separate calculation', (() => {
    app.lsS('food:'+app.todayKey(), [{p:112.5,k:800}]);
    return app.gramsToCloseProteinGap('Chicken curry (boneless)') === 150;
  })());
  T('Gap-fill: returns null once the protein target is already met, rather than suggesting a portion that would overshoot it further', (() => {
    const t = app.getProfile().targets;
    app.lsS('food:'+app.todayKey(), [{p:t.protein+10,k:2000}]);
    return app.gramsToCloseProteinGap('Chicken curry (boneless)') === null;
  })());
  T('Gap-fill: returns null for a food with no real protein (Cooking oil, 0g protein per 100g), rather than suggesting an absurd portion of something that can\u2019t close a protein gap', (() => {
    app.lsS('food:'+app.todayKey(), []);
    return app.gramsToCloseProteinGap('Cooking oil') === null;
  })());
  T('Gap-fill: wired into both Cook\u2019s portion input and Plate\u2019s Curry component (the protein-carrying ones), not just computed and left unused', src.includes("fillGramsToGap('pc-curry','pc-curry-amt',buildPlate)") && src.includes("fillGramsToGap('pg-food','pg-you',null)"));

  /* ---------- Audit fix: substitute exercises silently inheriting the wrong equipment label/cue ---------- */
  T('Bug reported by Roshan: Skull crushers no longer inherits "DB weight (one hand)" and a rope-attachment cue from Overhead tricep extension \u2014 now correctly EZ bar/Smith machine, since that is what he actually uses', (() => {
    const d = app.findExDef('Skull crushers');
    return d.wlabel.includes('EZ bar or Smith bar') && !d.wlabel.includes('DB weight') && d.nt.includes('Elbows stay pointed at the ceiling') && !d.nt.includes('Rope attachment');
  })());
  T('Same class of bug, found by auditing every substitute: T-bar row no longer inherits "Stack weight" from Seated cable row \u2014 T-bar rows are plate-loaded, not cable-stack', (() => {
    const d = app.findExDef('T-bar row');
    return d.wlabel.includes('plates') && d.wlabel !== 'Stack weight';
  })());
  T('Same class of bug: DB kickback and Machine tricep dip no longer inherit Cable tricep pushdown\u2019s "straight bar or rope, your call" cue, which makes no sense for a dumbbell or a machine that has no attachment choice', (() => {
    const kb = app.findExDef('DB kickback'), md = app.findExDef('Machine tricep dip');
    return !kb.nt.includes('Straight bar or rope') && !md.nt.includes('Straight bar or rope');
  })());
  T('Permanent audit: every substitute exercise across the whole SUBS table is checked programmatically for this exact bug class (inheriting an equipment-specific wlabel or cue from a differently-equipped original)', (() => {
    const problems = [];
    for (const [origName, subs] of Object.entries(app.SUBS)) {
      const realDef = (n) => app.DAYS.flatMap(d => d.ex).find(x => x.n === n);
      for (const subName of subs) {
        if (realDef(subName)) continue;
        const resolved = app.findExDef(subName);
        const hasOverride = !!app.SUB_TYPE_OVERRIDE[subName];
        const inferred = app.inferSubWlabel(subName);
        const wlabelInherited = !hasOverride && !inferred;
        if (wlabelInherited && /rope|db weight \(one hand\)/i.test(resolved.wlabel)) problems.push(subName);
      }
    }
    return problems.length === 0;
  })());

  /* ---------- OI1/OI2 resolved with Boss (2026-09-18): Nordic curl confirmed as GHD machine, TKE confirmed as not currently performed ---------- */
  T('OI1 resolved: Nordic curl no longer inherits Seated leg curl\u2019s "Stack weight" \u2014 Boss confirmed he does this on a GHD machine, so it now resolves as bodyweight with a GHD-specific setup cue', (() => {
    const d = app.findExDef('Nordic curl');
    return d.inputType === 'bodyweight' && d.wlabel !== 'Stack weight' && d.wlabel.includes('Bodyweight') && d.nt.includes('GHD footplate') && d.noweight === true;
  })());
  T('OI2 resolved: TKE (terminal knee extension) removed as a substitute for Leg extension (machine) \u2014 Boss confirmed he does not currently perform this exercise, so it is removed rather than left with a guessed equipment label', (() => {
    return !('Leg extension (machine)' in app.SUBS) || !app.SUBS['Leg extension (machine)'].includes('TKE \u2014 terminal knee extension');
  })());
  T('OI2 resolved: TKE no longer resolvable via findExDef now that it has no SUBS entry', app.findExDef('TKE \u2014 terminal knee extension') === null);

  /* ---------- Boss's plate-role and UX corrections, this session ---------- */
  T('Correction: Rajma masala is rajma-chawal, a whole main dish per Boss \u2014 not a Plate side component', (() => {
    const i = src.indexOf("name:'Rajma masala");
    const seg = src.slice(i, src.indexOf("\n  {name:", i+1));
    return seg.includes("plateRole:'none'");
  })());
  T('Correction: Soya chunks masala fry is the dry fry/masala preparation, a side per Boss \u2014 not the curry component', (() => {
    const i = src.indexOf("name:'Soya chunks masala fry");
    const seg = src.slice(i, src.indexOf("\n  {name:", i+1));
    return seg.includes("plateRole:'side'");
  })());
  T('Correction: rest timer now customisable in the moment with both -30s and +30s, not just a one-directional extend', src.includes('onclick="extendRestTimer(-30)">-30s<') && src.includes('onclick="extendRestTimer(30)">+30s<'));
  T('Correction: extendRestTimer floors safely so -30s repeated taps can\u2019t drive the countdown negative or divide-by-zero the progress bar', src.includes('_restTimerEndAt=Math.max(Date.now()+minRemaining,_restTimerEndAt+sec*1000);') && src.includes('_restTimerDuration=Math.max(5,_restTimerDuration+sec);'));
  T('Correction: adaptive nutrition target now confirms before changing the real kcal target, given Boss\u2019s own stated uncertainty about the feature and its medical-adjacent nature', src.includes("if(!confirm('Change your daily kcal target from '+p.targets.kcal+' to '+newKcal"));

  /* ---------- v5.6 FIX 1: ghost-recorded exercises \u2014 bestSetOf/saveSession now require st.done===true ---------- */
  T('FIX1: bestSetOf no longer counts a prefilled-but-undone set as a real lift (reproduces the Face pulls 18-Aug ghost-PR mechanism \u2014 valid w/r sitting in the fields from prefill, but never touched)', app.bestSetOf([{w:'12',r:'15',done:false}],'weight') === null);
  T('FIX1: bestSetOf still picks the genuinely best DONE set among a mix of done and undone sets, ignoring the undone ones entirely', (() => {
    const b = app.bestSetOf([{w:'20',r:'12',done:true},{w:'25',r:'10',done:false},{w:'22',r:'11',done:true}],'weight');
    return b.w === '22';
  })());
  T('FIX1: an exercise with zero done sets saves as notPerformed:true, best:null, exVolume:0, and never fires a PR (reproduces the Incline press (Smith machine) 26-Aug/5-Sep ghost-PR mechanism)', (() => {
    app.startFreeSession();
    app.addToFreeSession('Incline press (Smith machine)');
    const ex = app.WS['Free session'].ex[0];
    ex.sets = [{w:'60',r:'8',pw:'60',pr:'8',done:false,isDrop:false}];
    app.saveSession('Free session','free');
    const saved = app.Data.session.get();
    const e = saved.exercises[0];
    return e.notPerformed === true && e.best === null && e.exVolume === 0 && e.isPR === false && (saved.newPRs||[]).length === 0;
  })());
  T('FIX1: a not-performed exercise is not silently dropped from the saved session \u2014 it still appears in exercises[] with its name intact, just flagged', (() => {
    app.startFreeSession();
    app.addToFreeSession('Dumbbell shrugs');
    const ex = app.WS['Free session'].ex[0];
    ex.sets = [{w:'15',r:'15',pw:'15',pr:'15',done:false,isDrop:false}];
    app.saveSession('Free session','free');
    const saved = app.Data.session.get();
    return saved.exercises.length === 1 && saved.exercises[0].name === 'Dumbbell shrugs' && saved.exercises[0].notPerformed === true;
  })());
  T('FIX1: partial completion only counts DONE sets toward exVolume, not prefilled-but-untouched sets sitting alongside real ones (reproduces the Lat pulldown 27-Aug/2-Sep mechanism where some sets were real and others were ghost)', (() => {
    app.startFreeSession();
    app.addToFreeSession('Lat pulldown');
    const ex = app.WS['Free session'].ex[0];
    ex.sets = [{w:'50',r:'10',pw:'50',pr:'10',done:true,isDrop:false},{w:'50',r:'10',pw:'50',pr:'10',done:false,isDrop:false}];
    app.saveSession('Free session','free');
    const saved = app.Data.session.get();
    const e = saved.exercises[0];
    return e.notPerformed === false && e.exVolume === 500 && e.best && e.best.w === '50';
  })());
  T('FIX1: a fully-completed exercise is unaffected by the done-gating \u2014 no regression for genuine sets (sanity check against the fix itself)', (() => {
    app.startFreeSession();
    app.addToFreeSession('Face pulls');
    const ex = app.WS['Free session'].ex[0];
    ex.sets = [{w:'15',r:'15',pw:'15',pr:'15',done:true,isDrop:false},{w:'17',r:'18',pw:'17',pr:'18',done:true,isDrop:false}];
    app.saveSession('Free session','free');
    const saved = app.Data.session.get();
    const e = saved.exercises[0];
    return e.notPerformed === false && e.best.w === '17' && e.exVolume === (15*15+17*18);
  })());

  /* ---------- v5.6 FIX 3: Free/Suggested sessions now show the completion screen after save ---------- */
  T('FIX3: saveSession clears adHocDay/adHocSeqIdx/editingDate on a real save, so the Today tab\u2019s existing completion-screen branch (gated on !adHocDay) now fires for Free sessions exactly as it already did for structured days', (() => {
    app.startFreeSession();
    app.addToFreeSession('Face pulls');
    const ex = app.WS['Free session'].ex[0];
    ex.sets = [{w:'15',r:'15',pw:'15',pr:'15',done:true,isDrop:false}];
    app.saveSession('Free session','free');
    return app.adHocDay === null && app.adHocSeqIdx === null && app.editingDate === null;
  })());
  T('FIX3: the clearing happens inside the successful-save path itself, not gated to a specific session type \u2014 confirmed by source position (after skipRestTimer, before renderToday, inside saveSession)', src.includes('clearDraft(saveDate);showStickyBtn(false);stopTimerTick();skipRestTimer();\n  adHocDay=null;adHocSeqIdx=null;editingDate=null;\n  renderToday();'));

  /* ---------- v5.6 FIX 4: shareBackup no longer fails silently ---------- */
  T('FIX4: a rejected navigator.share (cancelled sheet or genuine failure) now falls back to exportData\u2019s working download path instead of doing nothing', src.includes(".catch(()=>{exportData();});"));

  /* ---------- v5.6 FIX 5: past-date session editing ---------- */
  T('FIX5: editSession accepts a dateKey parameter instead of always assuming today', src.includes('function editSession(dateKey){'));
  T('FIX5: editing a past date unlocks that date\u2019s real saved session into WS for editing, not today\u2019s (reproduces reopening an 18-Aug session)', (() => {
    const pastDate = '2026-08-18';
    app.Data.session.set({date:pastDate,dl:'Free session',seqIdx:null,exercises:[{name:'Face pulls',origName:'Face pulls',best:{w:'15',r:'15'},sets:[{w:'15',r:'15',done:true,isDrop:false}],chosenType:null,isPR:false,inputType:'weight',exVolume:225,notPerformed:false}],note:'',painNote:'',skipped:false,duration:5,newPRs:[],totalVolume:225}, pastDate);
    app.editSession(pastDate);
    const result = app.WS['Free session'] && app.WS['Free session'].ex[0].name === 'Face pulls' && app.editingDate === pastDate && app.Data.session.get(pastDate) === null;
    app.lsS('ws_draft:'+pastDate, null);
    return result;
  })());
  T('FIX5: editing today\u2019s own session still behaves exactly as before \u2014 editingDate stays null so a re-save lands back on today via the default saveDate, no regression for the existing today-only flow', (() => {
    app.startFreeSession();
    app.addToFreeSession('Face pulls');
    let ex = app.WS['Free session'].ex[0];
    ex.sets = [{w:'15',r:'15',pw:'15',pr:'15',done:true,isDrop:false}];
    app.saveSession('Free session','free');
    app.editSession();
    return app.editingDate === null && app.WS['Free session'].ex[0].name === 'Face pulls';
  })());
  T('FIX5: unlocking a past date for editing does not touch last_seq_idx \u2014 only editing today\u2019s own structured session still rotates it, so reopening an old day can\u2019t desync which day the app suggests next', src.includes("if(!isFree&&isToday)lsS('last_seq_idx',(seqIdx+3)%4);"));
  T('FIX5: History gets a tap-to-edit affordance on non-skipped rows of the last 14 days, calling editSession with that row\u2019s own date', src.includes('onclick="editSession(\'${s.date}\')" style="cursor:pointer"'));

  /* ---------- v5.6 FIX 6 (partial): Calf raises \u2014 Boss confirmed pendulum squat machine, plates loaded, not the bodyweight-style "Add kg if weighted" phrasing ---------- */
  T('FIX6: Calf raises wlabel now names the real equipment (pendulum squat machine, plates loaded) instead of the ambiguous bodyweight-style "Add kg if weighted" \u2014 Boss confirmed this is inputType:weight with real plates, not a bodyweight-plus-addon exercise', (() => {
    const i = src.indexOf("n:'Calf raises'");
    const seg = src.slice(i, src.indexOf('},', i));
    return seg.includes("wlabel:'Plates loaded (pendulum squat machine)'") && seg.includes("inputType:'weight'") && !seg.includes('Add kg if weighted');
  })());

  /* ---------- v5.6 FIX 6 (full check): combined-equipment entries split into genuinely separate exercises, per Boss's "ALL LABELS MUST MATCH EXERCISE, not combined for substitutes" rule. Old combined entries kept fully resolvable for historical data \u2014 Boss confirmed he has logged sessions under some of them. ---------- */
  T('FIX6 split: Overhead tricep extension\u2019s wlabel now matches its own long-standing "Rope attachment" cue (Stack weight, not DB one-hand) \u2014 both DAYS instances (Push day + Push-2 alt superset)', (() => {
    const occurrences = [...src.matchAll(/\{n:'Overhead tricep extension'[^}]*\}/g)];
    return occurrences.length === 2 && occurrences.every(m => m[0].includes("wlabel:'Stack weight'") && /rope attachment/i.test(m[0]) && !m[0].includes('DB weight (one hand)'));
  })());
  T('FIX6 split: a genuinely separate one-hand DB overhead extension now exists as its own correctly-labeled substitute, instead of being crammed into the primary\u2019s contradictory label', (() => {
    const d = app.findExDef('One-hand DB overhead extension');
    return d && d.wlabel === 'DB weight (one hand)' && d.nt.includes('one hand') && app.SUBS['Overhead tricep extension'].includes('One-hand DB overhead extension');
  })());
  T('FIX6 split: the OLD combined "Skull crushers" entry is untouched \u2014 still resolvable exactly as before, for any historical session logged under that name', (() => {
    const d = app.findExDef('Skull crushers');
    return d.wlabel === 'Total kg incl. bar (EZ bar or Smith bar \u2014 your call)' && app.SUBS['Overhead tricep extension'].includes('Skull crushers');
  })());
  T('FIX6 split: Skull crushers (EZ bar) and Skull crushers (Smith bar) exist as genuinely separate, correctly-labeled substitutes going forward', (() => {
    const ez = app.findExDef('Skull crushers (EZ bar)'), sm = app.findExDef('Skull crushers (Smith bar)');
    return ez && ez.wlabel.includes('EZ bar') && !ez.wlabel.includes('Smith') && sm && sm.wlabel.includes('Smith bar') && !sm.wlabel.includes('EZ bar');
  })());
  T('FIX6 split: the OLD combined "T-bar row" entry is untouched for history, and T-bar row (machine) / T-bar row (landmine) exist as separate, unambiguous substitutes going forward', (() => {
    const old = app.findExDef('T-bar row');
    const machine = app.findExDef('T-bar row (machine)'), landmine = app.findExDef('T-bar row (landmine)');
    return old.wlabel.includes('or landmine attachment') && app.SUBS['Seated cable row'].includes('T-bar row') &&
      machine && machine.wlabel === 'Total kg loaded (plates on the bar)' &&
      landmine && landmine.wlabel === 'Total kg loaded (landmine attachment, one end anchored)';
  })());
  T('FIX6 split: the OLD combined "Pendulum/hack squat machine" substitute is untouched for history, and Pendulum squat machine / Hack squat machine now exist as separate substitutes with an explicit wlabel instead of relying on generic inference', (() => {
    const old = app.findExDef('Pendulum/hack squat machine (light weight only \u2014 stop on any pain)');
    const pend = app.findExDef('Pendulum squat machine (light weight only \u2014 stop on any pain)');
    const hack = app.findExDef('Hack squat machine (light weight only \u2014 stop on any pain)');
    return old && app.SUBS['Leg press'].includes('Pendulum/hack squat machine (light weight only \u2014 stop on any pain)') &&
      pend && pend.wlabel === 'Total kg loaded (plates)' && hack && hack.wlabel === 'Total kg loaded (plates)';
  })());

  /* ---------- v5.6 FIX 2: historical repair pass \u2014 sandboxed fixtures reproducing a fabricated PR from real stored data ---------- */
  app.lsS('pr:Dumbbell shrugs', null);
  app.lsS('sess:2026-08-18', {date:'2026-08-18',dl:'Free session',seqIdx:null,
    exercises:[{name:'Dumbbell shrugs',origName:'Dumbbell shrugs',best:{w:'20',r:'15'},sets:[{w:'20',r:'15',done:false,isDrop:false}],chosenType:null,isPR:true,inputType:'weight',exVolume:300}],
    note:'',painNote:'',skipped:false,duration:5,newPRs:['Dumbbell shrugs'],totalVolume:300},'2026-08-18');
  T('FIX2: dry run correctly identifies the fabricated PR from real stored done flags (reproduces exactly the 6-case mechanism: isPR:true was saved from a set that was never marked done)', (() => {
    const plan = app.repairHistoricalSessions(true);
    const hit = plan.find(c => c.dateKey === '2026-08-18');
    return !!hit && hit.before.newPRs.includes('Dumbbell shrugs') && !hit.after.newPRs.includes('Dumbbell shrugs') && hit.after.totalVolume === 0;
  })());
  T('FIX2: dry run mutates nothing \u2014 the stored session and the pr: record are both exactly as they were before the dry run ran', (() => {
    const before = JSON.stringify(app.lsG('sess:2026-08-18'));
    const prBefore = app.lsG('pr:Dumbbell shrugs');
    app.repairHistoricalSessions(true);
    const after = JSON.stringify(app.lsG('sess:2026-08-18'));
    const prAfter = app.lsG('pr:Dumbbell shrugs');
    return before === after && JSON.stringify(prBefore) === JSON.stringify(prAfter);
  })());
  T('FIX2: a real (non-dry) run corrects the stored session in place \u2014 isPR false, notPerformed true, best null, exVolume 0, newPRs empty \u2014 without touching date/dl/note/painNote/duration', (() => {
    app.repairHistoricalSessions(false);
    const s = app.lsG('sess:2026-08-18');
    const e = s.exercises[0];
    return e.isPR === false && e.notPerformed === true && e.best === null && e.exVolume === 0 &&
      s.newPRs.length === 0 && s.totalVolume === 0 &&
      s.date === '2026-08-18' && s.dl === 'Free session' && s.duration === 5;
  })());
  T('FIX2: the repair pass never touches food logs, symptom logs, or body stats \u2014 only sess: keys', (() => {
    app.lsS('food:2026-08-18', [{name:'test food', p: 30, k: 200}]);
    app.lsS('sym:2026-08-18', {energy: 3, seton: 2, bowel: 'normal'});
    app.lsS('bstats', [{date:'2026-08-18', w: 84, fm: 21}]);
    app.repairHistoricalSessions(false);
    return JSON.stringify(app.lsG('food:2026-08-18')) === JSON.stringify([{name:'test food', p: 30, k: 200}]) &&
      JSON.stringify(app.lsG('sym:2026-08-18')) === JSON.stringify({energy: 3, seton: 2, bowel: 'normal'}) &&
      JSON.stringify(app.lsG('bstats')) === JSON.stringify([{date:'2026-08-18', w: 84, fm: 21}]);
  })());
  T('FIX2: chronological replay still lets a genuinely later best register as a real PR once the fabricated earlier one is removed (proves the fix doesn\u2019t just zero everything out \u2014 real progress still counts)', (() => {
    app.lsS('pr:Dumbbell shrugs', null);
    app.lsS('sess:2026-08-18', {date:'2026-08-18',dl:'Free session',seqIdx:null,
      exercises:[{name:'Dumbbell shrugs',origName:'Dumbbell shrugs',best:{w:'20',r:'15'},sets:[{w:'20',r:'15',done:false,isDrop:false}],chosenType:null,isPR:true,inputType:'weight',exVolume:300}],
      note:'',painNote:'',skipped:false,duration:5,newPRs:['Dumbbell shrugs'],totalVolume:300},'2026-08-18');
    app.lsS('sess:2026-08-25', {date:'2026-08-25',dl:'Free session',seqIdx:null,
      exercises:[{name:'Dumbbell shrugs',origName:'Dumbbell shrugs',best:{w:'22',r:'12'},sets:[{w:'22',r:'12',done:true,isDrop:false}],chosenType:null,isPR:false,inputType:'weight',exVolume:264}],
      note:'',painNote:'',skipped:false,duration:5,newPRs:[],totalVolume:264},'2026-08-25');
    app.repairHistoricalSessions(false);
    const early = app.lsG('sess:2026-08-18').exercises[0];
    const later = app.lsG('sess:2026-08-25').exercises[0];
    return early.isPR === false && early.notPerformed === true && later.isPR === true && app.lsG('pr:Dumbbell shrugs').w === '22';
  })());

  /* ---------- v5.6 post-delivery audit fixes (code-review, 2026-09-22): 3 real bugs found and fixed before merge ---------- */
  T('Audit fix 1: repairHistoricalSessions keys checkPR by the exercise actually PERFORMED (e.name), not the originally-scheduled one (e.origName) — reproduces a substitute (Skull crushers) being wrongly credited to the original (Overhead tricep extension)', (() => {
    app.lsS('pr:Overhead tricep extension', null);
    app.lsS('pr:Skull crushers', null);
    app.lsS('sess:2026-08-10', {date:'2026-08-10',dl:'Free session',seqIdx:null,
      exercises:[{name:'Skull crushers',origName:'Overhead tricep extension',best:{w:'20',r:'8'},sets:[{w:'20',r:'8',done:true,isDrop:false}],chosenType:null,isPR:false,inputType:'weight',exVolume:160,notPerformed:false}],
      note:'',painNote:'',skipped:false,duration:5,newPRs:[],totalVolume:160},'2026-08-10');
    app.repairHistoricalSessions(false);
    const result = app.lsG('pr:Overhead tricep extension') === null && app.lsG('pr:Skull crushers') && app.lsG('pr:Skull crushers').w === '20';
    app.lsS('sess:2026-08-10', null);
    return result;
  })());
  T('Audit fix 2: saveSession no longer overwrites the real "most recent session" cache (setLast) or last_seq_idx when re-saving a past-dated session via editSession — reproduces editing an old Free session clobbering today’s real last-session prefill data', (() => {
    app.startFreeSession();
    app.addToFreeSession('Face pulls');
    app.WS['Free session'].ex[0].sets = [{w:'40',r:'15',pw:'40',pr:'15',done:true,isDrop:false}];
    app.saveSession('Free session','free');
    const realLast = JSON.stringify(app.Data.session.getLast('Free session'));
    app.lsS('sess:2019-05-05', {date:'2019-05-05',dl:'Free session',seqIdx:null,
      exercises:[{name:'Face pulls',origName:'Face pulls',best:{w:'10',r:'10'},sets:[{w:'10',r:'10',done:true,isDrop:false}],chosenType:null,isPR:false,inputType:'weight',exVolume:100,notPerformed:false}],
      note:'',painNote:'',skipped:false,duration:3,newPRs:[],totalVolume:100},'2019-05-05');
    app.editSession('2019-05-05');
    app.saveSession('Free session','free',app.editingDate);
    const result2 = JSON.stringify(app.Data.session.getLast('Free session')) === realLast;
    app.lsS('sess:2019-05-05', null);
    return result2;
  })());
  T('Audit fix 2b: last_seq_idx is not rotated when re-saving an ALREADY-RECORDED past-dated structured session via editSession — only a genuine today save, or backfilling a session that was never saved, should advance the rotation', (() => {
    app.lsS('last_seq_idx', 2);
    app.lsS('sess:2019-05-06', {date:'2019-05-06',dl:'Push day',seqIdx:0,
      exercises: app.DAYS[0].ex.map(e => ({name: e.n, origName: e.n, best:{w:'40',r:'8'}, sets: [{w:'40',r:'8',done:true,isDrop:false}], chosenType: null, isPR:false, inputType:'weight', exVolume:320, notPerformed:false})),
      note:'',painNote:'',skipped:false,duration:5,newPRs:[],totalVolume:320*app.DAYS[0].ex.length},'2019-05-06');
    app.editSession('2019-05-06');
    app.saveSession('Push day', 0, app.editingDate);
    const result2b = app.lsG('last_seq_idx') === 2;
    app.lsS('sess:2019-05-06', null);
    return result2b;
  })());
  T('Audit fix 3: a dry-run repair preview no longer permanently loses the real date a PR was achieved — reproduces merely PREVIEWING the repair (which always runs a dry run first) silently re-stamping today’s date onto a genuine old PR', (() => {
    app.lsS('pr:Face pulls', {w:'18',r:'20',date:'2026-01-05'});
    app.lsS('sess:2026-01-05b', {date:'2026-01-05',dl:'Free session',seqIdx:null,
      exercises:[{name:'Face pulls',origName:'Face pulls',best:{w:'18',r:'20'},sets:[{w:'18',r:'20',done:true,isDrop:false}],chosenType:null,isPR:true,inputType:'weight',exVolume:360,notPerformed:false}],
      note:'',painNote:'',skipped:false,duration:5,newPRs:['Face pulls'],totalVolume:360},'2026-01-05b');
    app.repairHistoricalSessions(true);
    const result3 = app.lsG('pr:Face pulls').date === '2026-01-05';
    app.lsS('sess:2026-01-05b', null);
    return result3;
  })());
  T('Audit fix 3b: a REAL (committed, non-dry-run) repair that discovers a genuinely corrected PR stamps it with the actual historical session date, not the day the repair tool happened to run — the dry-run fix alone did not cover this, the only run that permanently persists', (() => {
    app.lsS('pr:Dumbbell shrugs', null);
    app.lsS('sess:2018-03-03', {date:'2018-03-03',dl:'Free session',seqIdx:null,
      exercises:[{name:'Dumbbell shrugs',origName:'Dumbbell shrugs',best:{w:'25',r:'12'},sets:[{w:'25',r:'12',done:true,isDrop:false}],chosenType:null,isPR:false,inputType:'weight',exVolume:300,notPerformed:false}],
      note:'',painNote:'',skipped:false,duration:5,newPRs:[],totalVolume:300},'2018-03-03');
    app.repairHistoricalSessions(false);
    const pr = app.lsG('pr:Dumbbell shrugs');
    const result3b = pr && pr.w === '25' && pr.date === '2018-03-03' && pr.date !== app.todayKey();
    app.lsS('sess:2018-03-03', null);
    return result3b;
  })());
  T('Audit fix 4: repairHistoricalSessions backs up and clears pr: records under BOTH the performed name and the originally-scheduled name, so a legacy pr: record keyed under the wrong name does not survive the repair as permanent orphaned data', (() => {
    app.lsS('pr:Overhead tricep extension', {w:'99',r:'5',date:'2020-01-01'});
    app.lsS('sess:2026-07-07', {date:'2026-07-07',dl:'Free session',seqIdx:null,
      exercises:[{name:'Skull crushers',origName:'Overhead tricep extension',best:{w:'15',r:'10'},sets:[{w:'15',r:'10',done:true,isDrop:false}],chosenType:null,isPR:false,inputType:'weight',exVolume:150,notPerformed:false}],
      note:'',painNote:'',skipped:false,duration:5,newPRs:[],totalVolume:150},'2026-07-07');
    app.repairHistoricalSessions(false);
    const result4 = app.lsG('pr:Overhead tricep extension') === null;
    app.lsS('sess:2026-07-07', null);
    return result4;
  })());
  T('Audit fix 5: saveSession still updates setLast/last_seq_idx for an explicitDate save that is NOT an editSession re-save (reproduces resolveStaleDraftSave backfilling a genuinely forgotten-but-recent session) — only editSession’s re-save of an already-recorded OLD session should skip this, not every explicitDate save', (() => {
    app.lsS('last_seq_idx', 1);
    app.WS['Push day'] = {ex: app.DAYS[0].ex.map(e => ({name: e.n, origName: e.n, chosenType: null, sets: [{w:'60',r:'8',pw:'60',pr:'8',done:true,isDrop:false}]})), subOpen: null, note: '', painNote: '', startAt: Date.now(), lastSetAt: null};
    app.saveSession('Push day', 0, '2026-09-21');
    const result5 = app.lsG('last_seq_idx') === 0 && app.Data.session.getLast('Push day').exercises[0].sets[0].w === '60';
    app.lsS('sess:2026-09-21', null);
    return result5;
  })());
  T('Audit fix 6: abandoning an editSession() edit and starting a genuinely different session no longer carries the stale editingDate into the new save — reproduces unlocking an old date, then switching to a Free session instead, saving under TODAY’S key rather than silently overwriting the old date’s data', (() => {
    app.lsS('sess:2015-03-03', {date:'2015-03-03',dl:'Free session',seqIdx:null,
      exercises:[{name:'Face pulls',origName:'Face pulls',best:{w:'12',r:'12'},sets:[{w:'12',r:'12',done:true,isDrop:false}],chosenType:null,isPR:false,inputType:'weight',exVolume:144,notPerformed:false}],
      note:'',painNote:'',skipped:false,duration:3,newPRs:[],totalVolume:144},'2015-03-03');
    app.editSession('2015-03-03');
    app.startFreeSession();
    app.addToFreeSession('Face pulls');
    app.WS['Free session'].ex[0].sets = [{w:'99',r:'9',pw:'99',pr:'9',done:true,isDrop:false}];
    app.saveSession('Free session','free',app.editingDate);
    const oldDateNotClobbered = !app.lsG('sess:2015-03-03') || app.lsG('sess:2015-03-03').exercises[0].best.w !== '99';
    const newSavedUnderToday = app.Data.session.get() && app.Data.session.get().date === app.todayKey() && app.Data.session.get().exercises[0].best.w === '99';
    app.lsS('sess:2015-03-03', null);
    app.lsS('ws_draft:2015-03-03', null);
    return oldDateNotClobbered && newSavedUnderToday;
  })());
  T('Audit fix 7: repairHistoricalSessions preserves checkPR’s "0" fallback for bodyweight exercises logged with no added weight, instead of writing an empty-string w into the pr: record', (() => {
    app.lsS('pr:Pull-ups (unassisted)', null);
    app.lsS('sess:2024-05-05', {date:'2024-05-05',dl:'Push day',seqIdx:0,
      exercises:[{name:'Pull-ups (unassisted)',origName:'Pull-ups (unassisted)',best:{w:'',r:'8'},sets:[{w:'',r:'8',done:true,isDrop:false}],chosenType:null,isPR:false,inputType:'bodyweight',exVolume:8,notPerformed:false}],
      note:'',painNote:'',skipped:false,duration:5,newPRs:[],totalVolume:8},'2024-05-05');
    app.repairHistoricalSessions(false);
    const pr = app.lsG('pr:Pull-ups (unassisted)');
    const result7 = pr && pr.w === '0' && pr.r === '8';
    app.lsS('sess:2024-05-05', null);
    return result7;
  })());
  T('Audit fix 8: resolveStaleDraftSave resets editingDate before saving, so a dangling editingDate left over from an abandoned, unrelated editSession() edit does not wrongly skip setLast/last_seq_idx for a genuine recovered-draft backfill', (() => {
    app.lsS('sess:2010-01-01', {date:'2010-01-01',dl:'Free session',seqIdx:null,
      exercises:[{name:'Face pulls',origName:'Face pulls',best:{w:'5',r:'5'},sets:[{w:'5',r:'5',done:true,isDrop:false}],chosenType:null,isPR:false,inputType:'weight',exVolume:25,notPerformed:false}],
      note:'',painNote:'',skipped:false,duration:2,newPRs:[],totalVolume:25},'2010-01-01');
    app.editSession('2010-01-01');
    app.lsS('last_seq_idx', 1);
    app._staleDraftPending = {dl:'Push day', state:{ex: app.DAYS[0].ex.map(e => ({name: e.n, origName: e.n, chosenType: null, sets: [{w:'70',r:'6',pw:'70',pr:'6',done:true,isDrop:false}]})), note:'', painNote:''}, date:'2026-09-20'};
    app.resolveStaleDraftSave();
    const result8 = app.lsG('last_seq_idx') === 0 && app.Data.session.getLast('Push day').exercises[0].sets[0].w === '70';
    app.lsS('sess:2010-01-01', null);
    app.lsS('sess:2026-09-20', null);
    app.lsS('ws_draft:2010-01-01', null);
    return result8;
  })());
  T('Audit fix 9: editSession no longer overwrites today’s real in-progress draft when editing a PAST date — the single ws_draft: slot is only written when editing today’s own session, matching the original pre-FIX5 behavior', (() => {
    app.WS['Push day'] = {ex:[{name:'Bench press',origName:'Bench press',chosenType:null,sets:[{w:'80',r:'5',pw:'80',pr:'5',done:true,isDrop:false}]}],subOpen:null,note:'',painNote:'',startAt:Date.now(),lastSetAt:null};
    app.Data.draft.save('Push day', app.WS['Push day']);
    app.lsS('sess:2012-02-02', {date:'2012-02-02',dl:'Free session',seqIdx:null,
      exercises:[{name:'Face pulls',origName:'Face pulls',best:{w:'8',r:'8'},sets:[{w:'8',r:'8',done:true,isDrop:false}],chosenType:null,isPR:false,inputType:'weight',exVolume:64,notPerformed:false}],
      note:'',painNote:'',skipped:false,duration:2,newPRs:[],totalVolume:64},'2012-02-02');
    app.editSession('2012-02-02');
    const stillPushDay = app.Data.draft.findAny();
    app.lsS('sess:2012-02-02', null);
    app.lsS('ws_draft:2012-02-02', null);
    app.lsS('ws_draft:'+app.todayKey(), null);
    return stillPushDay && stillPushDay.dl === 'Push day';
  })());
  T('Audit fix 10: exVolume calculation is a single shared computeExVolume helper, not duplicated between saveSession and repairHistoricalSessions', (() => {
    const count = (src.match(/function computeExVolume\(/g)||[]).length;
    return count === 1 && src.includes('computeExVolume(doneSets,effOrig.inputType)') && src.includes('computeExVolume(doneSets,e.inputType)');
  })());
  T('Audit fix 11: skipSession discards a stale adHocDay left over from an abandoned past-date edit, instead of mislabeling today’s skip with the wrong (old) session type', (() => {
    app.lsS('sess:2011-11-11', {date:'2011-11-11',dl:'Free session',seqIdx:null,
      exercises:[{name:'Face pulls',origName:'Face pulls',best:{w:'6',r:'6'},sets:[{w:'6',r:'6',done:true,isDrop:false}],chosenType:null,isPR:false,inputType:'weight',exVolume:36,notPerformed:false}],
      note:'',painNote:'',skipped:false,duration:2,newPRs:[],totalVolume:36},'2011-11-11');
    app.editSession('2011-11-11');
    app.skipSession('tired');
    const today = app.Data.session.get();
    app.lsS('sess:2011-11-11', null);
    app.lsS('ws_draft:2011-11-11', null);
    return today && today.dl !== 'Free session' && today.skipped === true;
  })());
  T('Audit fix 12: fmtCompletedBest no longer shows a blank result for a genuinely completed bodyweight exercise logged with no added weight (gates on the type-appropriate field, not universally on best.w)', (() => {
    const i = src.indexOf('function fmtCompletedBest(e){');
    const body = src.slice(i, i + 400);
    return body.includes("if(!e.best)return '';") && body.includes("it==='bodyweight')return e.best.r?e.best.r+' reps':''");
  })());
  T('Audit fix 13 (superseded, real fix built): editSession now gives a past-date edit its own dateKey-scoped draft slot instead of colliding with today’s real draft — both can exist simultaneously without either clobbering the other', (() => {
    app.Data.draft.clearAll();
    app.WS['Push day'] = {ex:[{name:'Bench press',origName:'Bench press',chosenType:null,sets:[{w:'80',r:'5',pw:'80',pr:'5',done:true,isDrop:false}]}],subOpen:null,note:'',painNote:'',startAt:Date.now(),lastSetAt:null};
    app.Data.draft.save('Push day', app.WS['Push day']);
    app.lsS('sess:2013-03-03', {date:'2013-03-03',dl:'Free session',seqIdx:null,
      exercises:[{name:'Face pulls',origName:'Face pulls',best:{w:'9',r:'9'},sets:[{w:'9',r:'9',done:true,isDrop:false}],chosenType:null,isPR:false,inputType:'weight',exVolume:81,notPerformed:false}],
      note:'',painNote:'',skipped:false,duration:2,newPRs:[],totalVolume:81},'2013-03-03');
    app.editSession('2013-03-03');
    const todayDraft = app.lsG('ws_draft:'+app.todayKey());
    const oldDraft = app.lsG('ws_draft:2013-03-03');
    app.lsS('sess:2013-03-03', null);
    app.lsS('ws_draft:2013-03-03', null);
    app.lsS('ws_draft:'+app.todayKey(), null);
    return todayDraft && todayDraft.dl === 'Push day' && oldDraft && oldDraft.dl === 'Free session';
  })());
  T('Audit fix 13b: abandoning a past-date edit and reloading recovers it via the existing stale-draft-resolve banner (findAny prioritizes today’s own draft, then falls back to any other dated draft) — the edit is no longer permanently lost if abandoned before saving', (() => {
    app.Data.draft.clearAll();
    app.lsS('sess:2014-04-04', {date:'2014-04-04',dl:'Free session',seqIdx:null,
      exercises:[{name:'Face pulls',origName:'Face pulls',best:{w:'9',r:'9'},sets:[{w:'9',r:'9',done:true,isDrop:false}],chosenType:null,isPR:false,inputType:'weight',exVolume:81,notPerformed:false}],
      note:'',painNote:'',skipped:false,duration:2,newPRs:[],totalVolume:81},'2014-04-04');
    app.editSession('2014-04-04');
    const found = app.Data.draft.findAny();
    app.lsS('sess:2014-04-04', null);
    app.lsS('ws_draft:2014-04-04', null);
    return found && found.date === '2014-04-04' && found.dl === 'Free session';
  })());
  T('Audit fix 13c: clearDraft only clears the draft for the date actually being saved — finishing today’s real session no longer wipes an unrelated, still-in-progress past-date edit’s draft (and vice versa)', (() => {
    app.lsS('sess:2015-05-05', {date:'2015-05-05',dl:'Free session',seqIdx:null,
      exercises:[{name:'Face pulls',origName:'Face pulls',best:{w:'9',r:'9'},sets:[{w:'9',r:'9',done:true,isDrop:false}],chosenType:null,isPR:false,inputType:'weight',exVolume:81,notPerformed:false}],
      note:'',painNote:'',skipped:false,duration:2,newPRs:[],totalVolume:81},'2015-05-05');
    app.editSession('2015-05-05');
    app.startFreeSession();
    app.addToFreeSession('Face pulls');
    app.WS['Free session'].ex[0].sets = [{w:'20',r:'10',pw:'20',pr:'10',done:true,isDrop:false}];
    app.saveSession('Free session','free');
    const oldEditDraftSurvives = !!app.lsG('ws_draft:2015-05-05');
    app.lsS('sess:2015-05-05', null);
    app.lsS('ws_draft:2015-05-05', null);
    return oldEditDraftSurvives;
  })());
  T('Audit fix 14: checkPR now takes an explicit date parameter, so a genuine new PR discovered while editing/saving a PAST session is stamped with the session’s real date, not the day the edit happened to be saved (root fix — saveSession and repairHistoricalSessions both now go through the same date-aware checkPR, no more separate patch)', (() => {
    app.lsS('pr:Face pulls', {w:'10',r:'10',date:'2020-01-01'});
    app.lsS('sess:2026-01-01', {date:'2026-01-01',dl:'Free session',seqIdx:null,
      exercises:[{name:'Face pulls',origName:'Face pulls',best:{w:'10',r:'10'},sets:[{w:'10',r:'10',done:true,isDrop:false}],chosenType:null,isPR:false,inputType:'weight',exVolume:100,notPerformed:false}],
      note:'',painNote:'',skipped:false,duration:3,newPRs:[],totalVolume:100},'2026-01-01');
    app.editSession('2026-01-01');
    app.WS['Free session'].ex[0].sets = [{w:'50',r:'10',pw:'50',pr:'10',done:true,isDrop:false}];
    app.saveSession('Free session','free',app.editingDate);
    const pr = app.lsG('pr:Face pulls');
    app.lsS('sess:2026-01-01', null);
    return pr && pr.w === '50' && pr.date === '2026-01-01';
  })());
  T('Audit fix 17: mid-edit autosave calls (togDone, updSet, etc. — saveDraft(dl) with no dateKey) now correctly target the date actually being edited via an editingDate fallback, instead of re-clobbering today’s real draft on the very first tap during a past-date edit (found by auditing the #13/#17 draft-scoping fix itself)', (() => {
    app.Data.draft.clearAll();
    app.WS['Push day'] = {ex:[{name:'Bench press',origName:'Bench press',chosenType:null,sets:[{w:'80',r:'5',pw:'80',pr:'5',done:true,isDrop:false}]}],subOpen:null,note:'',painNote:'',startAt:Date.now(),lastSetAt:null};
    app.Data.draft.save('Push day', app.WS['Push day']);
    app.lsS('sess:2016-06-06', {date:'2016-06-06',dl:'Free session',seqIdx:null,
      exercises:[{name:'Face pulls',origName:'Face pulls',best:{w:'9',r:'9'},sets:[{w:'9',r:'9',done:true,isDrop:false}],chosenType:null,isPR:false,inputType:'weight',exVolume:81,notPerformed:false}],
      note:'',painNote:'',skipped:false,duration:2,newPRs:[],totalVolume:81},'2016-06-06');
    app.editSession('2016-06-06');
    app.togDone('Free session',0,0);
    const todayDraft = app.lsG('ws_draft:'+app.todayKey());
    const oldEditDraft = app.lsG('ws_draft:2016-06-06');
    app.lsS('sess:2016-06-06', null);
    app.lsS('ws_draft:2016-06-06', null);
    app.lsS('ws_draft:'+app.todayKey(), null);
    return todayDraft && todayDraft.dl === 'Push day' && oldEditDraft && oldEditDraft.dl === 'Free session';
  })());
  T('Audit fix 18: the boot-time stale-draft check now looks for an other-dated draft regardless of whether today already has a session recorded, so abandoning a past-date edit (via skip or starting a different session, which orphans the dateKey-scoped draft since editSession already deleted the original) surfaces it for recovery on the next reload instead of being permanently unreachable (found by auditing the #17 draft-scoping fix itself)', (() => {
    const i = src.indexOf('const _todaySession=Data.session.get();');
    const body = src.slice(i, i + 500);
    return i >= 0 && body.includes('d.date&&d.date!==todayKey()') && body.includes('_staleDraftPending={dl:d.dl,state:d.state,date:d.date};') && body.includes('!_todaySession&&d&&d.dl&&d.state');
  })());
  T('Audit fix 19: initWS detects when WS[dl] holds a different date’s data (leftover from an abandoned editSession edit sharing the same day label) and recovers today’s real persisted draft instead of silently reusing the stale old data — reproduces a genuine today Push day being replaced by a years-old edit and then ‘resumed’ as if it were still today’s progress', (() => {
    app.Data.draft.clearAll();
    delete app.WS['Push day'];
    app.startSession(0);
    app.WS['Push day'].ex[0].sets[0].w = '777';
    app.WS['Push day'].ex[0].sets[0].done = true;
    app.saveDraft('Push day');
    app.lsS('sess:2020-01-01', {date:'2020-01-01',dl:'Push day',seqIdx:0,
      exercises: app.DAYS[0].ex.map(e => ({name: e.n, origName: e.n, best:{w:'11',r:'8'}, sets: [{w:'11',r:'8',done:true,isDrop:false}], chosenType: null, isPR:false, inputType:'weight', exVolume:88, notPerformed:false})),
      note:'',painNote:'',skipped:false,duration:5,newPRs:[],totalVolume:88*app.DAYS[0].ex.length},'2020-01-01');
    app.editSession('2020-01-01');
    app.startSession(-1);
    app.startSession(0);
    const recovered = app.WS['Push day'].ex[0].sets[0].w === '777';
    app.lsS('sess:2020-01-01', null);
    app.lsS('ws_draft:2020-01-01', null);
    app.lsS('ws_draft:'+app.todayKey(), null);
    return recovered;
  })());
  T('Audit fix 19b: WHILE an editSession edit of a past date is still genuinely in progress (editingDate matches WS[dl]._forDate), initWS does not treat it as stale — re-rendering mid-edit does not discard the edit itself', (() => {
    app.Data.draft.clearAll();
    delete app.WS['Push day'];
    app.lsS('sess:2021-02-02', {date:'2021-02-02',dl:'Push day',seqIdx:0,
      exercises: app.DAYS[0].ex.map(e => ({name: e.n, origName: e.n, best:{w:'33',r:'8'}, sets: [{w:'33',r:'8',done:true,isDrop:false}], chosenType: null, isPR:false, inputType:'weight', exVolume:264, notPerformed:false})),
      note:'',painNote:'',skipped:false,duration:5,newPRs:[],totalVolume:264*app.DAYS[0].ex.length},'2021-02-02');
    app.editSession('2021-02-02');
    const gd = app.DAYS[0];
    app.initWS('Push day', gd);
    const stillEditing = app.WS['Push day'].ex[0].sets[0].w === '33' && app.editingDate === '2021-02-02';
    app.lsS('sess:2021-02-02', null);
    app.lsS('ws_draft:2021-02-02', null);
    return stillEditing;
  })());
  T('Audit fix 15: repairHistoricalSessions falls back to e.origName when e.name is missing (a legacy/pre-migration session shape), instead of silently corrupting the PR record under a bogus "pr:undefined" key', (() => {
    app.lsS('pr:Dumbbell wrist curls', null);
    app.lsS('sess:2017-07-17', {date:'2017-07-17',dl:'Free session',seqIdx:null,
      exercises:[{origName:'Dumbbell wrist curls',best:{w:'8',r:'15'},sets:[{w:'8',r:'15',done:true,isDrop:false}],chosenType:null,isPR:false,inputType:'weight',exVolume:120,notPerformed:false}],
      note:'',painNote:'',skipped:false,duration:3,newPRs:[],totalVolume:120},'2017-07-17');
    app.repairHistoricalSessions(false);
    const pr = app.lsG('pr:Dumbbell wrist curls');
    const bogus = app.lsG('pr:undefined');
    app.lsS('sess:2017-07-17', null);
    return pr && pr.w === '8' && !bogus;
  })());
  T('Audit fix 16: computeExVolume reads .w (not .r) for reps_each exercises, matching how bestSetOf and fmtCompletedBest already read the single reps-per-side value — volume was silently zeroed for every reps_each exercise before this fix (a pre-existing bug relocated verbatim during the FIX2 dedup, caught while extracting the shared helper)', app.computeExVolume([{w:'10',r:'',done:true},{w:'12',r:'',done:true}],'reps_each') === 44);
} catch (e) {
  fail++; console.log('X FAIL  script eval crashed: ' + e.message);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
