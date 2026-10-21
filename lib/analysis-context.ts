import {createHash} from 'node:crypto';
import {AS_OF} from './seed.ts';
import {analyze} from './engine.ts';
import type {Deal} from './types.ts';
/** Raw records only: fixture answers and synthetic extraction annotations are excluded. */
export function buildDealContext(deal:Deal){
 const baseline=analyze(deal);
 return {asOf:AS_OF,policy:{buyerInactivityDays:21,evidenceFreshnessDays:30},opportunity:{id:deal.id,account:deal.account,name:deal.name,valueInr:deal.value,stage:deal.stage,category:deal.category,closeDate:deal.closeDate,nextStep:deal.nextStep,nextStepDate:deal.nextStepDate},stakeholders:deal.stakeholders,claims:deal.claims,activities:deal.activities.filter(a=>a.date<=AS_OF).map(({commitments:_annotations,...raw})=>raw),closeDateHistory:deal.dateHistory.filter(h=>h.date<=AS_OF),deterministicFindings:baseline.findings.filter(f=>!['unsupported','contradiction'].includes(f.type))};
}
export function hashDeal(deal:Deal){return createHash('sha256').update(JSON.stringify(buildDealContext(deal))).digest('hex');}
