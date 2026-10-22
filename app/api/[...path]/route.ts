import {NextRequest,NextResponse} from 'next/server';
import {getStore,makeSnapshots} from '../../../lib/store';
import {resolveAnalysis,simulate,summarize} from '../../../lib/engine';
import {withCustomerLanguage} from '../../../lib/customer-language';
import {scopeData} from '../../../lib/scope';
import {traceDetail,traceHistory} from '../../../lib/call-traces';
export const runtime='nodejs';
export const dynamic='force-dynamic';
function json(value:unknown,init?:ResponseInit){return NextResponse.json(withCustomerLanguage(value),init);}
function fail(e:unknown){const error=e instanceof Error?e.message:'Request failed';return json({error},{status:/stale|reused|cannot be changed/i.test(error)?409:/scope/i.test(error)?403:/not found/i.test(error)?404:400});}
function scope(deals:ReturnType<ReturnType<typeof getStore>['dataset']>['deals'],req:NextRequest){const {reps}=getStore().dataset(),q=req.nextUrl.searchParams;return deals.filter(d=>(!q.get('team')||reps.find(r=>r.id===d.ownerId)?.teamId===q.get('team'))&&(!q.get('rep')||d.ownerId===q.get('rep')));}
function actorData(req:NextRequest){return scopeData(getStore().read(),req.cookies.get('demo-actor')?.value??'revenue');}
export async function GET(req:NextRequest,{params}:{params:Promise<{path:string[]}>}){
 if((await params).path[0]==='traces')try{
  const path=(await params).path,data=actorData(req),ids=data.deals.map(d=>d.id);
  if(path.length===1)return json(traceHistory(getStore().savedAnalysisRuns(ids),data.deals),{headers:{'Cache-Control':'no-store'}});
  const id=Number(path[1]);if(path.length!==2||!/^\d+$/.test(path[1])||!Number.isSafeInteger(id)||id<1)return json({error:'Saved call not found'},{status:404});
  const row=getStore().savedAnalysisRuns(ids,id)[0],deal=row&&data.deals.find(d=>d.id===row.dealId);
  if(!row||!deal)return json({error:'Saved call not found'},{status:404});
  return json(traceDetail(row,deal),{headers:{'Cache-Control':'no-store'}});
 }catch(e){return fail(e);}
 try{const p=(await params).path;if(p[0]==='ai'&&p[1]==='status')return json({configured:false,model:process.env.OPENAI_MODEL?.trim()||'gpt-5-mini'},{headers:{'Cache-Control':'no-store'}});if(p[0]==='data'){const data=actorData(req),deals=scope(data.deals,req),ids=new Set(deals.map(d=>d.id));return json({...data,deals,actions:data.actions.filter(a=>ids.has(a.dealId)),audit:data.audit.filter(a=>ids.has(a.dealId)),liveAnalyses:Object.fromEntries(Object.entries(data.liveAnalyses??{}).filter(([id])=>ids.has(id))),summary:summarize(deals,data.liveAnalyses),snapshots:makeSnapshots(deals)},{headers:{'Cache-Control':'no-store'}});}
 if(p[0]==='opportunities'&&p[1]){const data=actorData(req),d=data.deals.find(d=>d.id===p[1]);if(!d)return json({error:'Opportunity not found'},{status:404});return json({deal:d,analysis:resolveAnalysis(d,data.liveAnalyses?.[d.id])});}
 return json({error:'Endpoint not found'},{status:404});}catch(e){return fail(e);}
}
export async function POST(req:NextRequest,{params}:{params:Promise<{path:string[]}>}){
 try{const origin=req.headers.get('origin');if(origin&&new URL(origin).host!==req.headers.get('host'))return json({error:'Cross-origin write refused'},{status:403});const p=(await params).path,store=getStore(),body=await req.json();
 if(p.length===1&&p[0]==='feedback')return json(store.saveFeedback({rating:body?.rating,message:body?.message}),{status:201,headers:{'Cache-Control':'no-store'}});
 if(p[0]==='decisions'){const actor=req.cookies.get('demo-actor')?.value??'m1';return json(store.decide({...body,actor}));}
 if(p[0]==='session'){const data=store.dataset();if(body.actor!=='revenue'&&![...data.reps,...data.managers].some(p=>p.id===body.actor))throw new Error('Unknown demo persona');const response=json({ok:true});response.cookies.set('demo-actor',body.actor,{httpOnly:true,sameSite:'strict',path:'/'});return response;}
 if(p[0]==='simulate'){if(!Array.isArray(body.overrides))throw new Error('Overrides must be an array');const deals=scope(actorData(req).deals,req).filter(d=>!body.ids||Array.isArray(body.ids)&&body.ids.includes(d.id));return json(simulate(deals,body.overrides,actorData(req).liveAnalyses));}
 if(p[0]==='reset'){if(body.confirm!=='RESET_DEMO')throw new Error('Explicit reset confirmation required');store.reset();return json({ok:true});}
 if(p[0]==='analyze'){const data=actorData(req),deal=data.deals.find(d=>d.id===body.dealId);if(!deal)throw new Error('Opportunity not found');if(body.provider==='openai')return json({error:'Live analysis is disabled. This demo displays saved or synthetic results only.'},{status:503});return json(resolveAnalysis(deal,data.liveAnalyses?.[deal.id]));}
 return json({error:'Endpoint not found'},{status:404});}catch(e){return fail(e);}
}
