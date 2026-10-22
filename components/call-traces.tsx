'use client';
import {useEffect,useMemo,useState} from 'react';
import {ArrowUpRight,Check,Clock3,Database,FileJson,IndianRupee,ListTree,RefreshCw,Search,ShieldCheck} from 'lucide-react';
import type {CallTraceDetail,CallTraceSummary,TraceHistory} from '../lib/call-traces';
import {estimateInr,formatInr} from '../lib/trace-cost';

const count=(value:number|null)=>value===null?'Not recorded':value.toLocaleString('en-IN');
const modelKey=(run:CallTraceSummary)=>run.model??'unknown';
function recordedAt(value:string|null){return value&&Number.isFinite(Date.parse(value))?new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kolkata'}).format(new Date(value))+' IST':'Not recorded';}

export default function CallTraces(){
 const [historyData,setHistoryData]=useState<TraceHistory|null>(null),[selectedId,setSelectedId]=useState<number|null>(null),[detail,setDetail]=useState<CallTraceDetail|null>(null);
 const [loading,setLoading]=useState(true),[error,setError]=useState(''),[detailError,setDetailError]=useState(''),[revision,setRevision]=useState(0),[query,setQuery]=useState(''),[model,setModel]=useState('all');
 useEffect(()=>{
  const controller=new AbortController();setLoading(true);setError('');
  fetch('/api/traces',{signal:controller.signal}).then(async response=>{if(!response.ok)throw new Error('Saved calls could not be loaded. Try refreshing the records.');return response.json() as Promise<TraceHistory>;}).then(history=>{
   setHistoryData(history);const linked=Number(new URLSearchParams(location.search).get('run'));
   setSelectedId(current=>history.runs.some(run=>run.id===linked)?linked:history.runs.some(run=>run.id===current)?current:history.runs[0]?.id??null);
  }).catch(e=>{if(e.name!=='AbortError')setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return()=>controller.abort();
 },[revision]);
 const runs=useMemo(()=>historyData?.runs??[],[historyData]);
 const models=useMemo(()=>[...new Set(runs.map(modelKey))],[runs]);
 const visible=useMemo(()=>runs.filter(run=>(model==='all'||modelKey(run)===model)&&(!query||`${run.account} ${run.dealId} ${run.runId??''} ${run.model??''}`.toLowerCase().includes(query.trim().toLowerCase()))),[runs,model,query]);
 useEffect(()=>{if(historyData&&!visible.some(run=>run.id===selectedId))setSelectedId(visible[0]?.id??null);},[visible,historyData,selectedId]);
 useEffect(()=>{
  setDetail(null);setDetailError('');if(selectedId===null)return;
  const params=new URLSearchParams(location.search);params.set('run',String(selectedId));window.history.replaceState({},'',`${location.pathname}?${params}`);
  const controller=new AbortController();fetch(`/api/traces/${selectedId}`,{signal:controller.signal}).then(async response=>{if(!response.ok)throw new Error(response.status===404?'This saved call is no longer available in this view.':'The saved call could not be loaded. Refresh to retry.');return response.json() as Promise<CallTraceDetail>;}).then(setDetail).catch(e=>{if(e.name!=='AbortError')setDetailError(e.message);});
  return()=>controller.abort();
 },[selectedId,revision]);
 const priced=visible.map(run=>estimateInr(run.usage,run.rates)),knownCosts=priced.filter((value):value is number=>value!==null);
 const totalCost=visible.length&&!knownCosts.length?null:knownCosts.reduce((sum,value)=>sum+value,0),unpriced=visible.length-knownCosts.length;
 const tokenTotal=visible.reduce((sum,run)=>sum+(run.usage.inputTokens??0)+(run.usage.outputTokens??0),0),partialUsage=visible.filter(run=>run.usage.totalTokens===null).length;
 const selectedRates=detail?.rates??null,selectedCost=detail?estimateInr(detail.usage,selectedRates):null;

 return <section className="trace-screen" aria-label="Call traces and cost explorer">
  <div className="trace-intro"><span className="trace-readonly"><ShieldCheck size={16}/>Read-only · Live generation disabled</span><button className="secondary" disabled={loading} onClick={()=>setRevision(value=>value+1)}><RefreshCw size={15} className={loading?'spin':''}/>Refresh saved traces</button></div>
  <div className="trace-metrics">
   <div><span><ListTree size={16}/>Saved model calls</span><strong>{visible.length.toLocaleString('en-IN')}</strong><small>{historyData?.savedCopies?`${historyData.savedCopies} duplicate saved ${historyData.savedCopies===1?'copy':'copies'} counted once`:'Calls with a saved assessment'}</small></div>
   <div><span><FileJson size={16}/>Recorded tokens</span><strong>{count(tokenTotal)}</strong><small>{partialUsage?`${partialUsage} call(s) have partial or missing usage`:'Input and output; cache counted once'}</small></div>
   <div><span><IndianRupee size={16}/>Estimated model cost</span><strong>{formatInr(totalCost)}</strong><small>{unpriced?`Partial: ${unpriced} call(s) cannot be priced`:'Token estimate at the rates below'}</small></div>
   <div><span><Database size={16}/>Viewing these records</span><strong>₹0.00</strong><small>No new model requests</small></div>
  </div>
  <div className="trace-toolbar"><label className="trace-search"><Search size={16}/><span className="sr-only">Search saved calls</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search account, run ID or model"/></label><label className="trace-model">Model<select value={model} onChange={e=>setModel(e.target.value)}><option value="all">All models</option>{models.map(name=><option key={name} value={name}>{name==='unknown'?'Model not recorded':name}</option>)}</select></label><span className="tiny muted">All costs in INR</span></div>
  {error?<div className="error-banner" role="alert">{error}</div>:!historyData?<div className="card trace-empty" role="status">Loading saved call records…</div>:!runs.length?<div className="card trace-empty"><ListTree size={30}/><h2>No saved model calls</h2><p>This demo can use synthetic analysis without calling a model. Saved call records will appear here when they are available.</p><p>Opening or refreshing this screen never generates new results.</p><a className="secondary" href="/opportunities">Explore opportunities <ArrowUpRight size={15}/></a></div>:!visible.length?<div className="card trace-empty"><Search size={28}/><h2>No saved calls match</h2><p>Try another account, run ID or model.</p><button className="secondary" onClick={()=>{setQuery('');setModel('all');}}>Clear filters</button></div>:<div className="trace-workspace">
   <section className="card trace-run-list" aria-label="Saved calls"><div className="trace-list-heading"><h2>Saved calls</h2><span>{visible.length} shown</span></div><div className="trace-runs">{visible.map(run=><button key={run.id} className={`trace-run ${run.id===selectedId?'selected':''}`} aria-pressed={run.id===selectedId} onClick={()=>setSelectedId(run.id)}><div className="trace-run-top"><strong>{run.account}</strong><span>{formatInr(estimateInr(run.usage,run.rates))}</span></div><span className="trace-run-model">{run.model??'Model not recorded'}</span><div className="trace-run-bottom"><span>{recordedAt(run.generatedAt)}</span><span>{count(run.usage.totalTokens)}{run.usage.totalTokens!==null?' tokens':''}</span></div><small>{run.dealId} · {run.sourceMatches===false?'Source context changed':'Saved assessment'}</small></button>)}</div></section>
   <section className="card trace-detail" aria-label="Selected call trace">
    {detailError?<div className="error-inline" role="alert">{detailError}</div>:!detail?<p role="status">Loading selected call…</p>:<>
     <div className="trace-detail-heading"><div><span className="page-kicker">Saved model run</span><h2>{detail.account}</h2><p>{detail.model??'Model not recorded'}</p></div><div className="trace-cost-value"><strong>{formatInr(selectedCost)}</strong><small>Estimated token cost</small></div></div>
     <div className="trace-detail-links"><span className="trace-pill"><Check size={13}/>Saved result</span><span className={`trace-pill ${detail.sourceMatches===false?'warning':''}`}>{detail.sourceMatches===null?'Source hash not recorded':detail.sourceMatches?'Source hash matches':'Source context changed'}</span><a href={`/opportunities/${encodeURIComponent(detail.dealId)}`}>Inspect opportunity <ArrowUpRight size={14}/></a></div>
     <dl className="trace-facts"><div><dt>Recorded</dt><dd>{recordedAt(detail.generatedAt)}</dd></div><div><dt>Duration</dt><dd><Clock3 size={13}/>{detail.durationMs===null?'Not recorded':`${(detail.durationMs/1000).toFixed(2)} s`}</dd></div><div><dt>Run ID</dt><dd className="trace-id">{detail.runId??'Not recorded'}</dd></div><div><dt>Prompt version</dt><dd>{detail.promptVersion??'Not recorded'}</dd></div></dl>
     <details className="trace-section" open><summary>Token usage and cost</summary><div className="trace-table-wrap"><table className="trace-token-table"><thead><tr><th>Usage</th><th>Tokens</th><th>INR / 1M tokens</th></tr></thead><tbody><tr><th>Input, including provider cache</th><td>{count(detail.usage.inputTokens)}</td><td>{formatInr(selectedRates?.input??null)}</td></tr><tr><th>Provider-cached input <small>Included in input above</small></th><td>{count(detail.usage.cachedInputTokens)}</td><td>{formatInr(selectedRates?.cachedInput??null)}</td></tr><tr><th>Output</th><td>{count(detail.usage.outputTokens)}</td><td>{formatInr(selectedRates?.output??null)}</td></tr><tr className="trace-total"><th>Total recorded tokens</th><td>{count(detail.usage.totalTokens)}</td><td>{formatInr(selectedCost)} estimated</td></tr></tbody></table></div>{detail.usage.cachedInputTokens===null&&<p className="trace-note">Provider cache usage was not recorded. The estimate uses the full input rate; it does not assume a cache discount.</p>}</details>
    </>}
   </section>
  </div>}
  <p className="trace-footer-note">Saved records only, up to 200 saved entries. Failed or unsaved requests may be absent. Default GPT-5 mini estimates use an illustrative conversion of INR 90 per USD. Costs estimate recorded token usage, not a billing statement; hosting and taxes are excluded. Viewing saved results makes no model calls.</p>
 </section>;
}
