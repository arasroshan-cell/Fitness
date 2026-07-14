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
T('version stamp v2.2b in header', /Roshan Fitness v2\.2b/.test(src));
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
    script + '\n;return {bestSetOf, checkPR, todayKey, monthKey, prevMonthKey, mergedMlog, isSymptomDay, fibreWarnHTML, lsS, lsG, getSuggestion, FOODS};');
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
} catch (e) {
  fail++; console.log('X FAIL  script eval crashed: ' + e.message);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
