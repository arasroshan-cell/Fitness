/* tests_sweta.js — Sweta Fitness harness. Run: node tests_sweta.js sweta.html */
const fs=require('fs');
const src=fs.readFileSync(process.argv[2]||'sweta.html','utf8');
let pass=0,fail=0;
function T(n,c){if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('X FAIL  '+n);}}

/* static */
T('version stamp v1.0',/Sweta Fitness v1\.0/.test(src));
T('kcal floor present',src.includes('kcalFloor:1200'));
T('no fibreRisk logic (stripped by design)',!src.includes('fibreWarnHTML'));
T('no Flare/seton module (stripped by design)',!/seton/i.test(src));
T('cycle tracking present',src.includes('cycle_starts'));
T('surrogate scan clean',(()=>{for(let i=0;i<src.length;i++){const c=src.charCodeAt(i);if(c>=0xD800&&c<=0xDBFF){const n=src.charCodeAt(i+1);if(!(n>=0xDC00&&n<=0xDFFF))return false;i++;}else if(c>=0xDC00&&c<=0xDFFF)return false;}return true;})());

/* behavioural */
const store={};
const localStorage={getItem:k=>(k in store?store[k]:null),setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];},key:i=>Object.keys(store)[i]??null,get length(){return Object.keys(store).length;}};
const elStub=()=>({style:{},innerHTML:'',textContent:'',value:'',classList:{add:()=>{},remove:()=>{},toggle:()=>{}},addEventListener:()=>{},click:()=>{},dataset:{t:'0'}});
const document=new Proxy({},{get:(t,p)=>{
  if(p==='getElementById')return()=>elStub();
  if(p==='querySelectorAll')return()=>[];
  if(p==='createElement')return()=>elStub();
  if(p==='addEventListener')return()=>{};
  if(p==='body')return elStub();
  return()=>{};
}});
const navigator={onLine:false};
const script=src.match(/<script>([\s\S]*)<\/script>/)[1];
try{
  const run=new Function('localStorage','document','navigator','fetch','File','Blob','URL','FileReader','alert','prompt','window',
    script+'\n;return {T,foodGroups,allFoods,isVegDay,foodOptions,saladTotals,fruitBowlTotals,cycleInfo,lossRateWarn,coachAfterLog,lsS,dayTotals,logFoodEntry,VEG_DAYS,SALAD_ING,DRESSINGS,todayKey,dateKeyOf};');
  const app=run(localStorage,document,navigator,()=>Promise.reject(new Error('off')),function(){},function(){},{createObjectURL:()=>'',revokeObjectURL:()=>{}},function(){},()=>{},()=>'20',{});

  T('targets: 1350 kcal / 75g protein / goal 50kg',app.T.kcal===1350&&app.T.protein===75&&app.T.goalW===50);
  T('veg days are Mon/Thu/Sat',JSON.stringify(app.VEG_DAYS)==='[1,4,6]');
  T('isVegDay true on a Thursday',app.isVegDay(new Date('2026-07-16'))===true);
  T('isVegDay false on a Wednesday',app.isVegDay(new Date('2026-07-15'))===false);

  /* tagging layer */
  const fs2=app.allFoods();
  T('DB inherits Roshan foods + Sweta additions (>= 85 entries)',fs2.length>=85);
  const rice=fs2.find(f=>/coconut rice/i.test(f.name));
  T('tagging: coconut rice → grain',app.foodGroups(rice).includes('grain'));
  const chik=fs2.find(f=>f.name==='Chicken curry (boneless)');
  T('tagging: chicken curry → protein',app.foodGroups(chik).includes('protein'));
  const shake=fs2.find(f=>f.name==='Breakfast shake (full)');
  T('shake is honest: ~520 kcal per glass',Math.abs(shake.per100.k*shake.typ/100-519)<15);
  T('shake protein ~14g',Math.abs(shake.per100.p*shake.typ/100-14.1)<1.5);

  /* salad: dressing counted */
  app.SALAD_ING.forEach(()=>{});
  const emptyS=app.saladTotals();
  T('empty salad logs nothing',emptyS.names.length===0);

  /* cycle prediction */
  app.lsS('cycle_starts',['2026-05-17','2026-06-14']);
  const ci=app.cycleInfo();
  T('cycle: day counter runs',ci.day>=1);
  T('cycle: prediction active after 2 logs (avg 28d)',ci.predicted!==null);

  /* loss-rate guard */
  app.lsS('bstats',[{date:'2026-07-07',w:53.5},{date:'2026-07-14',w:52.6}]);
  T('loss guard fires at 1.7%/wk',app.lossRateWarn().includes('faster than the healthy'));
  app.lsS('bstats',[{date:'2026-07-07',w:53.5},{date:'2026-07-14',w:53.3}]);
  T('healthy pace praised at 0.37%/wk',app.lossRateWarn().includes('healthy pace'));

  /* coach: over-budget warning */
  const big=fs2.find(f=>f.name==='Breakfast shake (full)');
  app.logFoodEntry(big,1);app.logFoodEntry(big,1);app.logFoodEntry(big,1);
  const tips=app.coachAfterLog();
  T('coach flags over-budget day',tips.some(x=>x.m.includes('over')));
}catch(e){fail++;console.log('X FAIL  eval crashed: '+e.message);}
console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
