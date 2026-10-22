import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSeed} from '../lib/seed.ts';
import {buildDealContext,hashDeal} from '../lib/analysis-context.ts';
import {runLiveAnalysis,validateLiveOutput} from '../lib/openai.ts';
import {summarize,simulate} from '../lib/engine.ts';
const deal=createSeed().deals[0];
function response(){return {summary:'The budget assertion conflicts with finance evidence; approval and timing remain unsupported.',claims:deal.claims.map(c=>({claimId:c.id,status:c.kind==='budget'?'Contradicted':'Unverified',reason:c.kind==='budget'?'Finance explicitly says approval is pending.':'No authorized approval or date confirmation was supplied.',confidence:'High',confidenceReason:'Direct source review.',citations:c.kind==='budget'?[{activityId:'opp-001-a4',quote:'Finance approval is still pending; please do not treat budget as approved.'}]:[]})),recommendation:{title:'Align with finance',rationale:'Resolve budget and approval before relying on Commit.',draft:'Could we arrange a finance alignment meeting?'},limitations:['Synthetic source records only.']};}
test('live context contains raw records without fixture answers or synthetic extraction labels',()=>{
 const text=JSON.stringify(buildDealContext(deal));assert.ok(text.includes('Finance approval is still pending'));assert.ok(!text.includes('"commitments"'));assert.ok(!text.includes('"expected"'));assert.ok(!text.includes('"scenario"'));assert.equal(hashDeal(deal),hashDeal(structuredClone(deal)));const changed=structuredClone(deal);changed.activities[0].body+=' changed';assert.notEqual(hashDeal(changed),hashDeal(deal));
});
test('valid live output keeps deterministic pushes and carries actual model claims into totals',()=>{
 const result=validateLiveOutput(deal,response());assert.equal(result.claims[0].status,'Contradicted');assert.equal(result.pushes,2);assert.equal(result.supported,false);assert.equal(result.provider,'OpenAI live');assert.equal(result.claims[0].citations?.[0].quote,'Finance approval is still pending; please do not treat budget as approved.');
 const healthy=structuredClone(createSeed().deals[4]);healthy.category='Commit';const live=structuredClone(result);live.claims=healthy.claims.map(c=>({...c,status:'Unverified',reason:'No support',sourceIds:[],confidence:'Medium',confidenceReason:'Missing',searchedRecordIds:[]}));assert.equal(summarize([healthy],{[healthy.id]:live}).supported,0);assert.equal(simulate([healthy],[{id:healthy.id,category:'Best Case'}],{[healthy.id]:live}).delta,-healthy.value);
});
test('rejects fabricated quotations, wrong-deal citations and incomplete claim coverage',()=>{
 const fabricated=response();fabricated.claims[0].citations[0].quote='Invented customer interaction';assert.throws(()=>validateLiveOutput(deal,fabricated),/quote/i);const foreign=response();foreign.claims[0].citations[0].activityId='opp-002-a1';assert.throws(()=>validateLiveOutput(deal,foreign),/source/i);const missing=response();missing.claims.pop();assert.throws(()=>validateLiveOutput(deal,missing),/claim/i);
});
test('cannot verify using rep assertion, stale evidence or an unauthorized champion',()=>{
 for(const sourceId of ['opp-001-a2','opp-001-a1']){const value=response();const a=deal.activities.find(a=>a.id===sourceId)!;value.claims[0]={...value.claims[0],status:'Verified',citations:[{activityId:sourceId,quote:a.body}]};assert.throws(()=>validateLiveOutput(deal,value),/authorized/i);}
 const stale=structuredClone(deal);stale.activities.find(a=>a.id==='opp-001-a4')!.date='2026-08-01';assert.throws(()=>validateLiveOutput(stale,response()),/current/i);
});
test('separate purchase authorization cannot be contradicted by finance status alone',()=>{
 const value=response();value.claims[1]={...value.claims[1],status:'Contradicted',citations:[...value.claims[0].citations]};const result=validateLiveOutput(deal,value),approval=result.claims.find(c=>c.kind==='approval')!;assert.equal(approval.status,'Unverified');assert.equal(approval.modelStatus,'Contradicted');assert.match(approval.validationNote??'',/purchase authorization/i);assert.equal(result.claims[0].status,'Contradicted');
});
test('Responses request is schema-constrained, excludes fixture labels, and returns usage without secrets',async()=>{
 let sent:Record<string,any>={};const http:typeof fetch=async(_url,init)=>{sent=JSON.parse(String(init?.body));return Response.json({id:'resp_test',status:'completed',model:'gpt-5-mini',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(response())}]}],usage:{input_tokens:500,output_tokens:250,total_tokens:750}})};
 const result=await runLiveAnalysis(deal,{apiKey:'test-key-not-real',model:'gpt-5-mini',timeoutMs:1000,maxOutputTokens:6000},http);assert.equal(sent.store,false);assert.equal(sent.text.format.type,'json_schema');assert.equal(sent.text.format.strict,true);assert.equal(result.live?.usage?.totalTokens,750);assert.ok(!JSON.stringify(result).includes('test-key-not-real'));assert.ok(result.live?.inputHash);assert.ok(!sent.input.includes('"commitments"'));
});
test('no key causes no HTTP call; upstream failure and refusal never fall back to simulation',async()=>{
 let calls=0;const http:typeof fetch=async()=>{calls++;return Response.json({error:{message:'sensitive upstream detail'}},{status:401})};const config={apiKey:'',model:'gpt-5-mini',timeoutMs:1000,maxOutputTokens:6000};await assert.rejects(()=>runLiveAnalysis(deal,config,http),/OPENAI_API_KEY/);assert.equal(calls,0);await assert.rejects(()=>runLiveAnalysis(deal,{...config,apiKey:'test-key'},http),/API key/i);assert.equal(calls,1);
 await assert.rejects(()=>runLiveAnalysis(deal,{...config,apiKey:'test-key'},async()=>Response.json({status:'completed',output:[{type:'message',content:[{type:'refusal',refusal:'Cannot comply'}]}]})),/refused/i);
});
