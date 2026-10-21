import type {AppData} from './types.ts';
export function scopeData(data:AppData,actor:string):AppData {
 if(actor==='revenue')return data;
 const person=[...data.reps,...data.managers].find(p=>p.id===actor);if(!person)throw new Error('Unknown persona scope');
 const deals=data.deals.filter(d=>person.role==='Sales manager'?data.reps.find(r=>r.id===d.ownerId)?.teamId===person.teamId:d.ownerId===person.id);
 const ids=new Set(deals.map(d=>d.id));return {...data,deals,liveAnalyses:Object.fromEntries(Object.entries(data.liveAnalyses??{}).filter(([id])=>ids.has(id))),actions:data.actions.filter(a=>ids.has(a.dealId)),audit:data.audit.filter(a=>ids.has(a.dealId))};
}
