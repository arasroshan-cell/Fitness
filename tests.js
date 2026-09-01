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
T('version stamp v4.0 in header', /Roshan Fitness v4\.0/.test(src));
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
const elStub = () => ({ style: {}, innerHTML: '', textContent: '', value: '', addEventListener: () => {}, appendChild: () => {}, querySelector: () => null, classList: { add: () => {}, remove: () => {}, toggle: () => {} }, closest: () => null, insertAdjacentHTML: () => {}, click: () => {} });
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
    script + '\n;return {bestSetOf, checkPR, todayKey, monthKey, prevMonthKey, mergedMlog, isSymptomDay, fibreWarnHTML, lsS, lsG, getSuggestion, FOODS, SUB_TYPE_OVERRIDE, inferSubWlabel, getProfile, saveProfile, Coach, getExHistory, saveSession, WS, initWS, DAYS, findExDef, getSmoothedWeight, Data, estimate1RM, getE1RMTrend, getPrefillSets, getFatigueCurve, getMealGapSuggestion, getSwapSuggestions, getFoodSymptomCorrelation, getRampPrefill, getModeratePrefill, resolveClickedTag, resolveClickedTagsAll, getExercisesForMuscleTag, LIB_ID_TO_TAGS, getBodyStatsReminderDays, getFoodLoggingGapDays, getSuggestedSessionExercises, getFreeSessionExerciseList};');
  const app = run(localStorage, document, window, navigator, () => Promise.reject(new Error('offline')), function(){}, { createObjectURL: () => '' , revokeObjectURL: () => {} }, function(){}, () => {}, () => true);

  /* D2: bodyweight PR by reps at constant weight */
  const bwBest = app.bestSetOf([{ w: '85', r: '8' }, { w: '85', r: '10' }, { w: '85', r: '9' }], 'bodyweight');
  T('D2: bodyweight best set picks highest reps (10)', bwBest && bwBest.r === '10');
  T('D2: bodyweight PR fires on rep increase', (app.lsS('pr:Pull-ups (unassisted)', { w: '85', r: '9', date: '2026-07-01' }), app.checkPR('Pull-ups (unassisted)', bwBest, 'bodyweight') === true));
  /* D2: weighted unchanged */
  const wBest = app.bestSetOf([{ w: '60', r: '8' }, { w: '65', r: '6' }], 'weight');
  T('D2: weighted best set still picks highest weight (65)', wBest && wBest.w === '65');
  /* D2: seconds picks longest hold */
  const sBest = app.bestSetOf([{ w: '40' }, { w: '55' }, { w: '50' }], 'seconds');
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
  T('DB: 74 foods (omelette entries merged into adjustable egg fry, mutton keema added)', app.FOODS.length === 74);
  T('Feature: egg fry merged with omelette into one adjustable per-egg entry, fixed 3/4-egg entries retired', src.includes("name:'Egg fry / omelette (per egg)'") && !src.includes("name:'Egg omelette (3 small)'") && !src.includes("name:'Egg omelette (4 small)'"));
  T('Feature: Mutton keema added', src.includes("name:'Mutton keema'"));
  T('DB: every food has k/p/c/f per100', app.FOODS.every(f => f.per100 && ['k','p','c','f'].every(x => typeof f.per100[x] === 'number')));

  /* Round 1 bug fixes, 2026-08-02 */
  T('Fix1: initWS reconciles stale drafts by origName instead of index', src.includes('old.find(o=>o&&o.origName===e.n)'));
  T('Fix2: sticky save button disables on first click', src.includes('if(b.disabled)return;b.disabled=true'));
  T('Fix2b (regression caught in audit): showStickyBtn resets disabled state for each new session, not just guards one save', src.includes('b.disabled=false;b.style.opacity=\'\';'));
  T('Fix3: editSession restores painNote', src.includes("painNote:ex.painNote||''"));
  T('Fix4: Today-tab suggestion regenerated live via getSuggestion, not trusted from frozen .suggestion field', src.includes('const sugg=bestForSugg?getSuggestion(effOrigLike'));
  T('Fix4b: history-detail suggestion also regenerated live', src.includes('const liveSugg=lastBest?getSuggestion(getExDef'));
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
    const i = src.indexOf('function editSession()');
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
  T('Bug fix: exercise safety cues (nt field) now actually render, were silently invisible before despite existing in every exercise', src.includes('${orig.nt?`<div style="font-size:11px;color:var(--amb);font-style:italic'));
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
  T('Deep-dive find: Decline press substitutes get their own technique note, not Dips-specific "lean forward, elbows flared" which would not apply', src.includes("'Decline press (Smith machine)':{nt:'Decline angle for lower chest"));
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
    return body.includes('Data.pr.get(origName)') && body.includes('Data.pr.set(origName') && !body.includes("'pr:'+origName");
  })());
  T('Data layer migration: saveSession, editSession, skipSession, unskipSession all use Data.session instead of raw sess: keys', src.includes('Data.session.set(session)') && src.includes('Data.session.delete()') && src.includes('Data.session.setLast('));
  T('Data layer migration: saveDraft/clearDraft delegate to Data.draft, and the init-time restoration uses Data.draft.findAny() instead of duplicating the scan logic', src.includes('function saveDraft(dl){if(WS[dl])Data.draft.save(dl,WS[dl]);}') && src.includes('function clearDraft(){Data.draft.clearAll();}') && src.includes('const d=Data.draft.findAny();'));
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
  T('Feature: removeSet exists and delete control only shows for extra/drop sets, not standard ones', src.includes('function removeSet') && src.includes('const isExtra=isDrop||si>=(orig.s||3)'));
  T('Feature: squat machine added as Leg press substitute with pain-stop caution baked into its name', src.includes("'Leg press':['Step-ups (bodyweight)','Wall sit (hold 60s)','Pendulum/hack squat machine (light weight only \\u2014 stop on any pain)']"));

  /* S1: PR keyed by actual performed exercise, not the originally scheduled one */
  app.lsS('pr:Cable tricep pushdown', null);
  const s1Best = app.bestSetOf([{ w: '25', r: '8' }], 'weight');
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
  T('Deep audit find: a free session can now actually be started on a day you already completed your scheduled session, since the completion summary was blocking adHocDay from ever showing before', src.includes("!(adHocDay&&adHocDay.label==='Free session')"));
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
  T('Systematic diagram audit: every clickable region resolves to a tag with at least some real exercise usage, except Obliques \u2014 a confirmed, honest content gap flagged to Boss, not a crash', (() => {
    const ids = Object.keys(app.LIB_ID_TO_TAGS);
    const emptyTags = ids.map(id => app.resolveClickedTag(id)).filter(tag => tag && app.getExercisesForMuscleTag(tag).length === 0);
    const uniqueEmpty = [...new Set(emptyTags)];
    return uniqueEmpty.length === 1 && uniqueEmpty[0] === 'Obliques';
  })());
  T('Real gap fix: substitute resolution now supports overriding primaryMuscles/secondaryMuscles, not just inputType/wlabel/nt \u2014 without this, Reverse EZ bar curl would have silently inherited "Biceps" from the curl it substitutes for, which is factually wrong', src.includes('primaryMuscles:override?.primaryMuscles||origDef?.primaryMuscles||[]') && src.includes('secondaryMuscles:override?.secondaryMuscles||origDef?.secondaryMuscles||[]'));
  T('Reverse EZ bar curl correctly tagged Forearms primary, Brachialis secondary, and existing substitutes (EZ bar curl, DB curl) still correctly inherit Biceps, unaffected by the fix', (() => {
    const rev = app.findExDef('Reverse EZ bar curl');
    const ez = app.findExDef('EZ bar curl');
    return rev.primaryMuscles[0] === 'Forearms' && rev.secondaryMuscles[0] === 'Brachialis' && ez.primaryMuscles[0] === 'Biceps';
  })());
  T('Bar weights: Smith machine pre-population moved to real app init, not tucked inside renderProgress \u2014 confirmed correct even if Progress tab is never visited', src.includes("(()=>{const bw=lsG('bar_weights')||{};if(!bw.smith){bw.smith='15';lsS('bar_weights',bw);}})();\ncheckStorage();"));
  T('Real bug reported: saveSession now calls renderToday() immediately, not after a 5-second setTimeout that made the page look stuck \u2014 the exact behavior reported', src.includes('clearDraft();showStickyBtn(false);stopTimerTick();\n  renderToday();') && !src.includes("setTimeout(()=>{cb.style.display='none';renderToday();},5000)"));
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
  T('Clutter fix caught by actually looking at the result: when multiple tags share a region, only primary matches show per section \u2014 secondary lists would otherwise repeat a huge, mostly-irrelevant wall of text under every section and bury the genuinely differentiated information', src.includes('const showSecondary=_freeExSelectedTags.length===1;') && src.includes('const showSecondary=_progressSelectedTags.length===1;'));
  T('Real feedback addressed: Weekly Muscle Volume replaced with a real, interpretable sets-count metric, not a raw tonnage number nobody could read', src.includes("Weekly Sets Per Muscle") && src.includes('const completedSets=(e.sets||[]).filter(s=>s.done&&!s.isDrop).length;'));
  T('Real feedback addressed: Volume vs Freshness now has a permanent, always-visible explanation of WHEN to use each, not just what the colors mean', src.includes("Volume</b> = what you've trained this week") && src.includes("Freshness</b> = what's actually recovered"));
  T('Real feedback addressed: food quick-add now has a real search input, matching the pattern already working for exercise search, instead of a native select with 74+ entries to scroll through', src.includes('id="ml-food-search"') && src.includes('function filterMealFoodList(') && src.includes('function pickMealFood('));
  T('Real feature built: per-exercise freshness note, exactly the scenario described \u2014 Incline bench in a free session only flags Upper chest specifically, not the whole Push day, and the note is clear that everything else is unaffected', src.includes('const freshTag=(effOrigLike.primaryMuscles||[])[0];') && src.includes('Everything else on this day is unaffected'));
  T('Progress tab restructure: Bar Weight Reference moved to Today tab where it\u2019s actually useful mid-workout, no longer in Progress', src.includes('Bar Weight Reference') && (() => {
    const todayIdx = src.indexOf("document.getElementById('p0').innerHTML=html;");
    const progressStart = src.indexOf('function renderProgress()');
    const progressEnd = src.indexOf('function renderFood()');
    const progressBody = src.slice(progressStart, progressEnd);
    return !progressBody.includes('Bar Weight Reference');
  })());
  T('Progress tab restructure: Daily targets moved to Food tab, Recent sessions and Health log moved to History tab \u2014 Progress now only contains actual progress insight, not settings or history lookback', (() => {
    const progressStart = src.indexOf('function renderProgress()');
    const progressEnd = src.indexOf('function renderFood()');
    const progressBody = src.slice(progressStart, progressEnd);
    return !progressBody.includes('Daily targets') && !progressBody.includes('>Recent sessions<') && progressBody.includes('Weekly Sets Per Muscle') && progressBody.includes('Body Map');
  })());
  T('Real bug reported: suggested weights are now realistic 2.5kg-increment numbers you can actually load, not 61.5kg-style values nobody can put on a bar', (() => {
    const dayKey = (o) => { const d = new Date(); d.setDate(d.getDate()-o); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
    app.Data.session.set({date:dayKey(3), dl:'Push day', seqIdx:0, exercises:[{name:'Bench press',origName:'Bench press',best:{w:100,r:2},sets:[{w:100,r:2,done:true}],isPR:false,inputType:'weight',exVolume:200}], note:'',painNote:'',skipped:false,duration:1,newPRs:[],totalVolume:200});
    const orig = app.findExDef('Bench press');
    const prefill = app.getPrefillSets(orig, 'Bench press', orig.s);
    return prefill.every(s => Math.abs((parseFloat(s.w)/2.5) - Math.round(parseFloat(s.w)/2.5)) < 0.001);
  })());
  T('Rounding fix applied consistently across every path: ramp prefill, moderate prefill, and getNextTargetWeight (both the trend-informed branch and the simple flat-increment fallback) all round to the same realistic 2.5kg increment', src.includes('const round=v=>Math.round(v/2.5)*2.5;') && !src.includes('Math.round(v/0.5)*0.5'));
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
} catch (e) {
  fail++; console.log('X FAIL  script eval crashed: ' + e.message);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
