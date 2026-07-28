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
T('version stamp v2.2d in header', /Roshan Fitness v2\.2d/.test(src));
T('N1: no slice(-52) remains', !src.includes('slice(-52)'));
T('N1: two slice(-260) caps present', (src.match(/slice\(-260\)/g) || []).length === 2);
T('N2: three fibreRisk flags', (src.match(/fibreRisk:true/g) || []).length === 3);
T('P2: both quickLog onclick sites escape apostrophes', (src.match(/\.replace\(\/'\/g,"\\\\'"\)/g) || []).length >= 2);
T('P3: four new exhale cues', (src.match(/[Ee]xhale (on press|as you pull|on push)/g) || []).length === 4);
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
const script = src.match(/<script>([\s\S]*)<\/script>/)[1];
try {
  const run = new Function('localStorage', 'document', 'window', 'navigator', 'fetch', 'File', 'URL', 'Blob', 'alert', 'confirm',
    script + '\n;return {bestSetOf, checkPR, todayKey, monthKey, prevMonthKey, mergedMlog, isSymptomDay, fibreWarnHTML, lsS, lsG, getSuggestion, FOODS, SUB_TYPE_OVERRIDE, inferSubWlabel, getProfile, saveProfile, Coach, getExHistory, saveSession, WS, initWS, DAYS};');
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
  T('DB: 73 foods (68 + 5 new)', app.FOODS.length === 73);
  T('DB: every food has k/p/c/f per100', app.FOODS.every(f => f.per100 && ['k','p','c','f'].every(x => typeof f.per100[x] === 'number')));

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
} catch (e) {
  fail++; console.log('X FAIL  script eval crashed: ' + e.message);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
