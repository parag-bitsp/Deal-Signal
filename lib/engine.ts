import type {Analysis, Category, ClaimResult, Deal, Finding, Summary, Snapshot} from './types.ts';
import { AS_OF } from './seed.ts';
const days=(a:string,b:string)=>Math.floor((Date.parse(a)-Date.parse(b))/86400000);
export function analyze(deal:Deal,asOf=AS_OF,claimResults?:ClaimResult[]):Analysis {
 const records=deal.activities.filter(a=>a.date<=asOf);
 const buyer=records.filter(a=>a.direction==='inbound'&&a.meaningful&&(a.type!=='Meeting'||a.completed));
 const last=buyer.map(a=>a.date).sort().at(-1)??deal.createdAt;
 const inactiveDays=Math.max(0,days(asOf,last));
 const claims:ClaimResult[]=claimResults??deal.claims.map(claim=>{
  const candidates=records.flatMap(a=> (a.commitments??[]).filter(c=>c.kind===claim.kind&&c.quote.length>0&&a.body.includes(c.quote)&&deal.stakeholders.find(s=>s.id===a.stakeholderId)?.authority.includes(claim.kind)&&a.direction==='inbound').map(c=>({a,c}))).sort((a,b)=>b.a.date.localeCompare(a.a.date));
  const latest=candidates[0];let status:ClaimResult['status']='Unverified',reason='No current, explicit statement from an authorized buyer supports this claim.',sourceIds:string[]=[];
  if(latest){const sameDate=candidates.filter(c=>c.a.date===latest.a.date);const conflict=sameDate.some(x=>x.c.value!==latest.c.value);sourceIds=[...new Set(sameDate.map(x=>x.a.id))];
   if(conflict)reason='Conflicting authoritative statements on the same date need human resolution.';
   else if(days(asOf,latest.a.date)>30)reason='The last buyer statement is older than the 30-day reconfirmation policy.';
   else {status=latest.c.value?'Verified':'Contradicted';reason=latest.c.value?'An authorized buyer explicitly confirms this commitment.':'An authorized buyer explicitly conflicts with the CRM assertion.';}
  }
  return {...claim,status,reason,sourceIds,confidence:latest?'High':'Medium',confidenceReason:latest?'Explicit structured evidence in synthetic buyer records.':'No qualifying statement found in the supplied record scope.',searchedRecordIds:records.map(a=>a.id)};
 });
 const findings:Finding[]=[];
 const add=(type:string,title:string,detail:string,severity:Finding['severity'],sourceIds:string[]=[])=>findings.push({id:`${deal.id}-${type}`,type,title,detail,severity,sourceIds});
 const missingStep=!deal.nextStep||!deal.nextStepDate||deal.nextStepDate<asOf;
 if(inactiveDays>=21)add('inactivity',`${inactiveDays} days without buyer activity`,'Only meaningful inbound replies and completed buyer meetings count. Rep follow-ups do not reset this clock.','Medium',buyer.filter(a=>a.date===last).map(a=>a.id));
 if(missingStep)add('next-step','No current dated next step','The next step is missing or overdue. Agree a specific action and date with the buyer.','Medium');
 if(inactiveDays>=21&&missingStep)add('zombie','Dormant deal needs requalification','Buyer inactivity and no actionable next step indicate a zombie candidate.','High');
 const pushes=deal.dateHistory.filter(h=>h.date<=asOf&&days(asOf,h.date)<=90&&h.to>h.from);
 if(pushes.length>=2)add('slippage',`${pushes.length} close-date pushes`,`${pushes.filter(h=>h.sourceId).length} buyer-supported; ${pushes.filter(h=>!h.sourceId).length} without buyer confirmation. Review the purchasing plan.`,'Medium',pushes.flatMap(h=>h.sourceId?[h.sourceId]:[]));
 const contradictions=claims.filter(c=>c.status==='Contradicted');if(contradictions.length)add('contradiction','Buyer evidence contradicts CRM',contradictions.map(c=>c.text).join('; '),'High',contradictions.flatMap(c=>c.sourceIds));
 const procurement=buyer.filter(a=>a.procurementDays!==undefined).sort((a,b)=>b.date.localeCompare(a.date))[0];
 const timelineBlocked=!!procurement&&procurement.procurementDays!>days(deal.closeDate,asOf);
 const supported=claims.length===3&&claims.every(c=>c.status==='Verified')&&!timelineBlocked;
 if(deal.category==='Commit'&&!supported)add('unsupported','Commit lacks buyer support',`${claims.filter(c=>c.status!=='Verified').length} of 3 required commitments lack current verification.`,'High',claims.filter(c=>c.status!=='Verified').flatMap(c=>c.sourceIds));
 if(procurement&&timelineBlocked)add('timeline','Procurement exceeds time to close',`Buyer states ${procurement.procurementDays} days are needed; ${Math.max(0,days(deal.closeDate,asOf))} days remain.`,'High',[procurement.id]);
 const risk=findings.some(f=>f.severity==='High')?'High':findings.length?'Medium':'Low';
 const title=contradictions.length||claims.some(c=>c.kind==='approval'&&c.status!=='Verified')?'Arrange an approval-alignment meeting':inactiveDays>=21?'Requalify the opportunity with the buyer':missingStep?'Agree a dated next step':'Confirm the purchasing plan';
 return {risk,claims,findings,inactiveDays,pushes:pushes.length,coverage:buyer.length?'Supplied deal records':'No buyer records',supported,asOf,provider:'Simulated analysis',recommendation:{title,rationale:'Resolve the specific evidence gaps before relying on this commitment.',draft:`Hi ${deal.stakeholders[0]?.name.split(' ')[0]??'team'},\n\nCould we arrange a 30-minute approval-alignment meeting with your finance decision-maker? We would like to confirm budget approval, the purchasing timeline, and the remaining procurement steps for ${deal.name}.\n\nWould 23 October work for your team?\n\nThank you.`}};
}
export function resolveAnalysis(deal:Deal,saved?:Analysis):Analysis {return saved?{...saved,...analyze(deal,AS_OF,saved.claims),provider:saved.provider,recommendation:saved.recommendation,live:saved.live}:analyze(deal);}
export function summarize(deals:Deal[],saved:Record<string,Analysis>={}):Summary {
 const summary:Summary={pipeline:0,commit:0,supported:0,gap:0,coverage:null,count:deals.length,high:0,medium:0,low:0,slipped:0};
 for(const d of deals){const a=resolveAnalysis(d,saved[d.id]);summary.pipeline+=d.value;summary[a.risk.toLowerCase() as 'high'|'medium'|'low']++;if(a.pushes>=2)summary.slipped++;if(d.category==='Commit'){summary.commit+=d.value;if(a.supported)summary.supported+=d.value;}}
 summary.gap=summary.commit-summary.supported;summary.coverage=summary.commit?summary.supported/summary.commit:null;return summary;
}
export function simulate(deals:Deal[],overrides:{id:string;category:string}[],saved:Record<string,Analysis>={}) {
 const seen=new Set<string>();for(const o of overrides){if(seen.has(o.id)||!deals.some(d=>d.id===o.id)||!['Commit','Best Case','Pipeline'].includes(o.category))throw new Error('Invalid or duplicate scenario override');seen.add(o.id);}
 const baseline=summarize(deals,saved);const scenario=summarize(deals.map(d=>({...d,category:(overrides.find(o=>o.id===d.id)?.category??d.category) as Category})),saved);return {baseline,scenario,delta:scenario.commit-baseline.commit};
}
export function money(n:number,full=false){return full?new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n):n>=10000000?`₹${(n/10000000).toFixed(2)} Cr`:`₹${(n/100000).toFixed(1)} L`}
export function historicalSnapshots(deals:Deal[]):Snapshot[]{return Array.from({length:8},(_,i)=>{const date=new Date(Date.UTC(2026,8,1+i*7)).toISOString().slice(0,10);let pipeline=0,commit=0,supported=0;for(const d of deals.filter(d=>d.createdAt<=date)){const event=(d.categoryHistory??[{date:d.createdAt,category:d.category,value:d.value}]).filter(h=>h.date<=date).sort((a,b)=>b.date.localeCompare(a.date))[0];if(!event)continue;pipeline+=event.value;if(event.category==='Commit'){commit+=event.value;if(analyze(d,date).supported)supported+=event.value;}}return {date,pipeline,commit,supported};});}
