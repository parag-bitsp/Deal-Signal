import type {Analysis,Deal} from './types.ts';
import {hashDeal} from './analysis-context.ts';
import {AS_OF} from './seed.ts';
import {defaultInrRates,estimateInr,recordedUsage,TRACE_PRICING} from './trace-cost.ts';
import type {InrRates,TraceUsage} from './trace-cost.ts';

export interface SavedAnalysisRun {id:number;dealId:string;analysis:Analysis}
export interface CallTraceSummary {
 id:number;runId:string|null;dealId:string;account:string;model:string|null;generatedAt:string|null;
 promptVersion:string|null;validationVersion:string|null;inputHash:string|null;sourceMatches:boolean|null;
 durationMs:number|null;usage:TraceUsage;rates:InrRates|null;estimatedCostInr:number|null;
}
export interface CallTraceDetail extends CallTraceSummary {
 originalRequest:null;originalProviderResponse:null;
 context:{asOf:string;opportunity:{id:string;account:string;name:string;valueInr:number;stage:string;category:string};stakeholders:unknown[];claims:unknown[];activities:unknown[]};
 result:{summary:string|null;limitations:string[];claims:unknown[];recommendation:{title:string;rationale:string;draft:string}};
}
export interface TraceHistory {runs:CallTraceSummary[];savedCopies:number;limit:number;pricing:typeof TRACE_PRICING}
const text=(value:unknown)=>typeof value==='string'&&value.trim()?value:null;
export function traceSummary(row:SavedAnalysisRun,deal:Deal):CallTraceSummary {
 const live=row.analysis.live,usage=recordedUsage(live?.usage),model=text(live?.model),rates=defaultInrRates(model),inputHash=text(live?.inputHash);
 return {id:row.id,runId:text(live?.runId),dealId:deal.id,account:deal.account,model,generatedAt:text(live?.generatedAt),promptVersion:text(live?.promptVersion),validationVersion:text(live?.validationVersion),inputHash,sourceMatches:inputHash?inputHash===hashDeal(deal):null,durationMs:null,usage,rates,estimatedCostInr:estimateInr(usage,rates)};
}
export function traceHistory(rows:SavedAnalysisRun[],deals:Deal[]):TraceHistory {
 const allowed=new Map(deals.map(d=>[d.id,d])),seen=new Set<string>(),runs:CallTraceSummary[]=[];let savedCopies=0;
 for(const row of rows){const deal=allowed.get(row.dealId);if(!deal)continue;const runId=text(row.analysis.live?.runId),identity=runId?JSON.stringify([row.dealId,runId]):'record-'+row.id;if(seen.has(identity)){savedCopies++;continue;}seen.add(identity);runs.push(traceSummary(row,deal));}
 return {runs,savedCopies,limit:200,pricing:TRACE_PRICING};
}
export function traceDetail(row:SavedAnalysisRun,deal:Deal):CallTraceDetail {
 const analysis=row.analysis;
 return {...traceSummary(row,deal),originalRequest:null,originalProviderResponse:null,
  context:{asOf:AS_OF,opportunity:{id:deal.id,account:deal.account,name:deal.name,valueInr:deal.value,stage:deal.stage,category:deal.category},
   stakeholders:deal.stakeholders.map(s=>({id:s.id,name:s.name,title:s.title,authority:s.authority})),claims:deal.claims.map(c=>({id:c.id,kind:c.kind,text:c.text})),
   activities:deal.activities.filter(a=>a.date<=AS_OF).map(a=>({id:a.id,date:a.date,type:a.type,direction:a.direction,author:a.author,subject:a.subject,body:a.body,stakeholderId:a.stakeholderId,completed:a.completed,procurementDays:a.procurementDays}))},
  result:{summary:text(analysis.live?.summary),limitations:(analysis.live?.limitations??[]).filter(v=>typeof v==='string'),
   claims:analysis.claims.map(c=>({id:c.id,text:c.text,kind:c.kind,status:c.status,reason:c.reason,confidence:c.confidence,sourceIds:c.sourceIds,citations:c.citations?.map(q=>({activityId:q.activityId,quote:q.quote}))})),
   recommendation:{title:analysis.recommendation.title,rationale:analysis.recommendation.rationale,draft:analysis.recommendation.draft}}};
}
