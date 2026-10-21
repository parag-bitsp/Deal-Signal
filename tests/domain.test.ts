import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../lib/seed.ts';
import { analyze, summarize, simulate, historicalSnapshots } from '../lib/engine.ts';

test('seed has 150 connected opportunities, 20 reps and 4 managers', () => {
 const d=createSeed(); assert.equal(d.deals.length,150); assert.equal(d.reps.length,20); assert.equal(d.managers.length,4);
 for(const x of d.deals){assert.ok(d.reps.some(r=>r.id===x.ownerId));assert.ok(x.value>=500000&&x.value<=2000000); for(const c of x.claims)assert.ok(c.id);}
 assert.deepEqual(createSeed(),d); assert.equal(d.deals.filter(x=>x.scenario).length,20);
});
test('anchor separates contradicted budget from unverified approval with sources',()=>{
 const a=analyze(createSeed().deals[0]); assert.equal(a.claims.find(c=>c.kind==='budget')?.status,'Contradicted'); assert.equal(a.claims.find(c=>c.kind==='approval')?.status,'Unverified'); assert.equal(a.pushes,2); assert.equal(a.risk,'High'); assert.ok(a.claims[0].sourceIds.length);
});
test('simulation removes precisely 20 lakh from Commit and preserves baseline',()=>{
 const d=createSeed().deals,before=JSON.stringify(d); const s=simulate(d,[{id:d[0].id,category:'Best Case'}]);assert.equal(s.delta,-2000000);assert.equal(JSON.stringify(d),before);
 assert.throws(()=>simulate(d,[{id:'missing',category:'Commit'}]));assert.throws(()=>simulate(d,[{id:d[0].id,category:'Won'}]));assert.throws(()=>simulate(d,[{id:d[0].id,category:'Pipeline'},{id:d[0].id,category:'Best Case'}]));
});
test('empty Commit coverage is null and totals reconcile',()=>{
 assert.equal(summarize([]).coverage,null);const d=createSeed().deals,s=summarize(d);assert.equal(s.pipeline,d.reduce((n,x)=>n+x.value,0));assert.equal(s.gap,s.commit-s.supported);
});
test('rep outbound activity does not reset inactivity and 21 day boundary is inclusive',()=>{
 const x=structuredClone(createSeed().deals[1]);x.activities=x.activities.filter(a=>a.direction==='outbound'); x.createdAt='2026-09-29';x.nextStep='';x.nextStepDate='';const a=analyze(x);assert.equal(a.inactiveDays,21);assert.ok(a.findings.some(f=>f.type==='zombie'));
});
test('missing corpus produces unverified gaps without fabricated citations',()=>{
 const x=structuredClone(createSeed().deals[0]); x.activities=[];const a=analyze(x);assert.ok(a.claims.every(c=>c.status==='Unverified'&&c.sourceIds.length===0));assert.equal(a.coverage,'No buyer records');
});
test('all twenty scenarios exercise expected labels',()=>{
 const d=createSeed().deals;for(const x of d.filter(x=>x.scenario)){const a=analyze(x);for(const expected of x.expected??[])assert.ok(a.findings.some(f=>f.type===expected),`${x.scenario}: missing ${expected}`);}
 const healthy=analyze(d[4]);assert.equal(healthy.risk,'Low'); assert.ok(healthy.claims.every(c=>c.status==='Verified'));
});
test('procurement blocker excludes otherwise verified Commit from supported revenue',()=>{
 const d=structuredClone(createSeed().deals[4]);d.category='Commit';d.activities.push({id:'blocker',date:'2026-10-19',type:'Email',direction:'inbound',author:d.stakeholders[1].name,stakeholderId:d.stakeholders[1].id,subject:'Remaining procurement',body:'We require 30 days for procurement.',meaningful:true,procurementDays:30});assert.equal(analyze(d).supported,false);assert.equal(summarize([d]).supported,0);
});
test('fabricated quote is excluded and seed commitment quotes match source bodies',()=>{
 const ds=createSeed().deals;for(const d of ds)for(const a of d.activities)for(const c of a.commitments??[])assert.ok(a.body.includes(c.quote),`${a.id}: missing quote`);
 const d=structuredClone(ds[4]);for(const a of d.activities)for(const c of a.commitments??[])c.quote='INVENTED QUOTE';assert.ok(analyze(d).claims.every(c=>c.status==='Unverified'));
});
test('historical snapshots use dated forecast categories rather than current category',()=>{
 const d=structuredClone(createSeed().deals[0]);d.categoryHistory=[{date:'2026-08-12',category:'Pipeline',value:d.value},{date:'2026-09-25',category:'Commit',value:d.value}];const points=historicalSnapshots([d]);assert.equal(points[0].commit,0);assert.equal(points.at(-1)?.commit,2000000);
});
