import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {createSeed} from './seed.ts';
import {historicalSnapshots} from './engine.ts';
import {hashDeal} from './analysis-context.ts';
import type {Action, AppData, Dataset, Deal, Snapshot, Analysis} from './types.ts';
export interface DecisionInput {dealId:string;status:Action['status'];draft:string;version:number;key:string;actor:string}
export class Store {
 db:DatabaseSync;
 constructor(path:string){if(path!==':memory:')mkdirSync(dirname(path),{recursive:true});this.db=new DatabaseSync(path);this.db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY,value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS opportunities(id TEXT PRIMARY KEY,record TEXT NOT NULL); CREATE TABLE IF NOT EXISTS actions(deal_id TEXT PRIMARY KEY,record TEXT NOT NULL); CREATE TABLE IF NOT EXISTS requests(key TEXT PRIMARY KEY,payload TEXT NOT NULL,result TEXT NOT NULL); CREATE TABLE IF NOT EXISTS analysis_runs(id INTEGER PRIMARY KEY AUTOINCREMENT,deal_id TEXT NOT NULL,record TEXT NOT NULL); CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY AUTOINCREMENT,dealId TEXT,event TEXT,actor TEXT,at TEXT,detail TEXT);`);if(!this.db.prepare('SELECT key FROM meta WHERE key=?').get('users'))this.reset();}
 reset(){const seed=createSeed();this.db.exec('BEGIN IMMEDIATE');try{this.db.exec('DELETE FROM opportunities;DELETE FROM actions;DELETE FROM requests;DELETE FROM audit;DELETE FROM analysis_runs;');this.db.prepare('INSERT OR REPLACE INTO meta VALUES (?,?)').run('users',JSON.stringify({reps:seed.reps,managers:seed.managers}));const stmt=this.db.prepare('INSERT INTO opportunities VALUES (?,?)');for(const d of seed.deals)stmt.run(d.id,JSON.stringify(d));this.db.exec('COMMIT');}catch(e){this.db.exec('ROLLBACK');throw e;}}
 dataset():Dataset{const users=JSON.parse(String(this.db.prepare('SELECT value FROM meta WHERE key=?').get('users')!.value));const deals=this.db.prepare('SELECT record FROM opportunities ORDER BY id').all().map(r=>JSON.parse(String(r.record)));return {...users,deals};}
 read():AppData{const data=this.dataset(),liveAnalyses:Record<string,Analysis>={};for(const row of this.db.prepare('SELECT deal_id,record FROM analysis_runs ORDER BY id DESC').all()){const id=String(row.deal_id);if(liveAnalyses[id])continue;const run:Analysis=JSON.parse(String(row.record)),deal=data.deals.find(d=>d.id===id);if(deal&&run.live?.inputHash===hashDeal(deal))liveAnalyses[id]=run;}return {...data,liveAnalyses,actions:this.db.prepare('SELECT record FROM actions').all().map(r=>JSON.parse(String(r.record))),audit:this.db.prepare('SELECT * FROM audit ORDER BY id DESC LIMIT 200').all() as unknown as AppData['audit'],snapshots:makeSnapshots(data.deals)};}
 decide(input:DecisionInput):Action{
  if(!input.key||input.key.length>200||!input.draft.trim()||input.draft.length>10000||!['Approved','Rejected','Completed'].includes(input.status)||!Number.isInteger(input.version))throw new Error('Invalid decision');
  const data=this.dataset(),deal=data.deals.find(d=>d.id===input.dealId);if(!deal)throw new Error('Opportunity not found');const owner=data.reps.find(r=>r.id===deal.ownerId)!;const actor=[...data.reps,...data.managers].find(p=>p.id===input.actor);if(!actor||!(actor.id===owner.id||actor.role==='Sales manager'&&actor.teamId===owner.teamId))throw new Error('Actor is outside deal scope');
  this.db.exec('BEGIN IMMEDIATE');try{
   const old=this.db.prepare('SELECT payload,result FROM requests WHERE key=?').get(input.key);
   if(old){if(old.payload!==JSON.stringify(input))throw new Error('Idempotency key reused with different input');this.db.exec('COMMIT');return JSON.parse(String(old.result));}
   const row=this.db.prepare('SELECT record FROM actions WHERE deal_id=?').get(input.dealId);const current:Action|undefined=row?JSON.parse(String(row.record)):undefined;
   if((current?.version??0)!==input.version)throw new Error('Stale action version; reload and retry');
   if(input.status==='Completed'&&current?.status!=='Approved')throw new Error('Approve the action before completing it');
   if(input.status==='Completed'&&current?.draft!==input.draft)throw new Error('Completion must preserve the approved draft');
   if(current?.status==='Completed')throw new Error('Completed action cannot be changed');
   const at=new Date().toISOString();const result:Action={id:`action-${input.dealId}`,dealId:input.dealId,status:input.status,draft:input.draft,version:input.version+1,updatedAt:at,actor:actor.name};
   this.db.prepare('INSERT OR REPLACE INTO actions VALUES (?,?)').run(input.dealId,JSON.stringify(result));
   this.db.prepare('INSERT INTO audit(dealId,event,actor,at,detail) VALUES (?,?,?,?,?)').run(input.dealId,input.status,actor.name,at,JSON.stringify({before:current??null,after:result,provider:this.read().liveAnalyses?.[input.dealId]?.provider??'Simulated analysis',runId:this.read().liveAnalyses?.[input.dealId]?.live?.runId??null}));
   this.db.prepare('INSERT INTO requests VALUES (?,?,?)').run(input.key,JSON.stringify(input),JSON.stringify(result));this.db.exec('COMMIT');return result;
  }catch(e){this.db.exec('ROLLBACK');throw e;}
 }
 saveAnalysis(dealId:string,analysis:Analysis){const deal=this.dataset().deals.find(d=>d.id===dealId);if(!deal||!analysis.live||analysis.live.inputHash!==hashDeal(deal))throw new Error('Stale analysis input; reload and retry');this.db.prepare('INSERT INTO analysis_runs(deal_id,record) VALUES (?,?)').run(dealId,JSON.stringify(analysis));}
 close(){this.db.close();}
}
export function makeSnapshots(deals:Deal[]):Snapshot[]{return historicalSnapshots(deals);}
const g=globalThis as unknown as {pipelineStore?:Store};
export function getStore(){return g.pipelineStore??(g.pipelineStore=new Store(process.env.PIPELINE_DB??join(process.cwd(),'data','pipeline.db')));}
