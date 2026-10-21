import {NextRequest,NextResponse} from 'next/server';
import {getStore,makeSnapshots} from '../../../lib/store';
import {analyze,simulate,summarize} from '../../../lib/engine';
import {runLiveAnalysis,liveConfig,LiveAnalysisError} from '../../../lib/openai';
import {scopeData} from '../../../lib/scope';
export const runtime='nodejs';
export const dynamic='force-dynamic';
function fail(e:unknown){if(e instanceof LiveAnalysisError)return NextResponse.json({error:e.message},{status:e.status});const error=e instanceof Error?e.message:'Request failed';return NextResponse.json({error},{status:/stale|reused|cannot be changed/i.test(error)?409:/scope/i.test(error)?403:/not found/i.test(error)?404:400});}
function scope(deals:ReturnType<ReturnType<typeof getStore>['dataset']>['deals'],req:NextRequest){const {reps}=getStore().dataset(),q=req.nextUrl.searchParams;return deals.filter(d=>(!q.get('team')||reps.find(r=>r.id===d.ownerId)?.teamId===q.get('team'))&&(!q.get('rep')||d.ownerId===q.get('rep')));}
function actorData(req:NextRequest){return scopeData(getStore().read(),req.cookies.get('demo-actor')?.value??'revenue');}
export async function GET(req:NextRequest,{params}:{params:Promise<{path:string[]}>}){
 try{const p=(await params).path;if(p[0]==='ai'&&p[1]==='status'){const config=liveConfig();return NextResponse.json({configured:!!config.apiKey,model:config.model},{headers:{'Cache-Control':'no-store'}});}if(p[0]==='data'){const data=actorData(req),deals=scope(data.deals,req),ids=new Set(deals.map(d=>d.id));return NextResponse.json({...data,deals,actions:data.actions.filter(a=>ids.has(a.dealId)),audit:data.audit.filter(a=>ids.has(a.dealId)),liveAnalyses:Object.fromEntries(Object.entries(data.liveAnalyses??{}).filter(([id])=>ids.has(id))),summary:summarize(deals,data.liveAnalyses),snapshots:makeSnapshots(deals)},{headers:{'Cache-Control':'no-store'}});}
 if(p[0]==='opportunities'&&p[1]){const d=actorData(req).deals.find(d=>d.id===p[1]);if(!d)return NextResponse.json({error:'Opportunity not found'},{status:404});return NextResponse.json({deal:d,analysis:analyze(d)});}
 return NextResponse.json({error:'Endpoint not found'},{status:404});}catch(e){return fail(e);}
}
export async function POST(req:NextRequest,{params}:{params:Promise<{path:string[]}>}){
 try{const origin=req.headers.get('origin');if(origin&&new URL(origin).host!==req.headers.get('host'))return NextResponse.json({error:'Cross-origin write refused'},{status:403});const p=(await params).path,store=getStore(),body=await req.json();
 if(p[0]==='decisions'){const actor=req.cookies.get('demo-actor')?.value??'m1';return NextResponse.json(store.decide({...body,actor}));}
 if(p[0]==='session'){const data=store.dataset();if(body.actor!=='revenue'&&![...data.reps,...data.managers].some(p=>p.id===body.actor))throw new Error('Unknown demo persona');const response=NextResponse.json({ok:true});response.cookies.set('demo-actor',body.actor,{httpOnly:true,sameSite:'strict',path:'/'});return response;}
 if(p[0]==='simulate'){if(!Array.isArray(body.overrides))throw new Error('Overrides must be an array');const deals=scope(actorData(req).deals,req).filter(d=>!body.ids||Array.isArray(body.ids)&&body.ids.includes(d.id));return NextResponse.json(simulate(deals,body.overrides,actorData(req).liveAnalyses));}
 if(p[0]==='reset'){if(body.confirm!=='RESET_DEMO')throw new Error('Explicit reset confirmation required');store.reset();return NextResponse.json({ok:true});}
 if(p[0]==='analyze'){const deal=actorData(req).deals.find(d=>d.id===body.dealId);if(!deal)throw new Error('Opportunity not found');if(body.provider==='openai'){const result=await runLiveAnalysis(deal);store.saveAnalysis(deal.id,result);return NextResponse.json(result);}return NextResponse.json(analyze(deal));}
 return NextResponse.json({error:'Endpoint not found'},{status:404});}catch(e){return fail(e);}
}
