import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Store} from '../lib/store.ts';
import {analyze} from '../lib/engine.ts';
import {hashDeal} from '../lib/analysis-context.ts';
import {scopeData} from '../lib/scope.ts';
import {traceDetail,traceHistory} from '../lib/call-traces.ts';
import {defaultInrRates,estimateInr,formatInr,recordedUsage} from '../lib/trace-cost.ts';

function save(store:Store,index:number,runId:string){
 const deal=store.dataset().deals[index];
 const analysis={...analyze(deal),provider:'OpenAI live',live:{runId,model:'gpt-5-mini-2025-08-07',generatedAt:'2026-10-20T10:00:00Z',inputHash:hashDeal(deal),promptVersion:'test',summary:'Saved customer assessment',limitations:[],usage:{inputTokens:1000,outputTokens:500,totalTokens:1500}}};
 store.saveAnalysis(deal.id,analysis);return {deal,analysis};
}

test('saved history includes older runs, stays in persona scope and is read-only',()=>{
 const store=new Store(':memory:');
 try {
  save(store,0,'first');save(store,0,'second');save(store,1,'other-rep');
  const allowed=scopeData(store.read(),'r1').deals.map(d=>d.id);
  const rows=store.savedAnalysisRuns(allowed);
  assert.equal(rows.length,2);assert.deepEqual(rows.map(r=>r.analysis.live?.runId),['second','first']);
  assert.ok(rows.every(r=>r.dealId==='opp-001'));
  assert.equal(store.savedAnalysisRuns(allowed,1).length,1);
  assert.equal(store.savedAnalysisRuns(allowed,3).length,0);
  assert.deepEqual(store.savedAnalysisRuns([]),[]);
  assert.equal(store.db.prepare('SELECT COUNT(*) AS n FROM analysis_runs').get()!.n,3);
 } finally {store.close();}
});

test('duplicate saved copies count as one call and historical source mismatches remain inspectable',()=>{
 const store=new Store(':memory:');
 try {
  const first=save(store,0,'same-call');store.saveAnalysis(first.deal.id,first.analysis);save(store,0,'another-call');
  const rows=store.savedAnalysisRuns([first.deal.id]),history=traceHistory(rows,store.dataset().deals);
  assert.equal(history.runs.length,2);assert.equal(history.savedCopies,1);assert.equal(history.runs[1].id,2);
  assert.equal(history.runs[0].sourceMatches,true);
  const changed=structuredClone(first.deal);changed.activities[0].body+=' new evidence';
  assert.equal(traceDetail(rows[0],changed).sourceMatches,false);
  assert.deepEqual(traceHistory(rows,[]).runs,[]);
 } finally {store.close();}
});

test('INR token math includes cached input once and uses full input when the cache breakdown is missing',()=>{
 const rates=defaultInrRates('gpt-5-mini-2025-08-07')!;
 const usage=recordedUsage({inputTokens:1000,cachedInputTokens:200,outputTokens:500,totalTokens:1700});
 assert.equal(usage.totalTokens,1500);assert.ok(Math.abs(estimateInr(usage,rates)!-.10845)<1e-12);
 const older=recordedUsage({inputTokens:1000,outputTokens:500});assert.equal(older.cachedInputTokens,null);assert.equal(estimateInr(older,rates),.1125);
 assert.equal(formatInr(.000015),'₹0.000015');assert.equal(formatInr(100000),'₹1,00,000.00');
});

test('missing, invalid or unsupported usage never becomes a zero-cost estimate',()=>{
 const rates=defaultInrRates('gpt-5-mini');
 assert.equal(estimateInr(recordedUsage(null),rates),null);
 assert.equal(estimateInr(recordedUsage({inputTokens:-1,outputTokens:5}),rates),null);
 assert.equal(estimateInr(recordedUsage({inputTokens:5,outputTokens:NaN}),rates),null);
 assert.equal(defaultInrRates('gpt-5-mini-unpriced-variant'),null);
 assert.equal(estimateInr(recordedUsage({inputTokens:100,outputTokens:5}),null),null);
 assert.equal(estimateInr(recordedUsage({inputTokens:100,outputTokens:5}),{input:-1,cachedInput:0,output:2}),null);
 assert.equal(recordedUsage({inputTokens:100,cachedInputTokens:101,outputTokens:10}).cachedInputTokens,null);
 assert.equal(estimateInr(recordedUsage({inputTokens:0,cachedInputTokens:0,outputTokens:0}),rates),0);
});

test('trace details expose only saved results and safe current context, never invented requests or arbitrary headers',()=>{
 const store=new Store(':memory:');
 try {
  const saved=save(store,0,'safe-projection'),row=store.savedAnalysisRuns([saved.deal.id])[0];
  Object.assign(row.analysis,{headers:{Authorization:'DO-NOT-EXPOSE'},request:{apiKey:'DO-NOT-EXPOSE'}});
  Object.assign(saved.deal.activities[0],{headers:{Authorization:'DO-NOT-EXPOSE'}});
  const detail=traceDetail(row,saved.deal);
  assert.equal(detail.originalRequest,null);assert.equal(detail.originalProviderResponse,null);assert.equal(detail.durationMs,null);
  assert.equal(detail.result.summary,'Saved customer assessment');assert.ok(detail.context.activities.length);
  assert.ok(!JSON.stringify(detail).includes('DO-NOT-EXPOSE'));
  assert.ok(!JSON.stringify(detail.context).includes('commitments'));
 } finally {store.close();}
});
