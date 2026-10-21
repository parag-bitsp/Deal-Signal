import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Store} from '../lib/store.ts';
test('approval persists, is idempotent, rejects stale changes and appends audit',()=>{
 const dir=mkdtempSync(join(tmpdir(),'pipeline-test-'));const path=join(dir,'test.db');let s=new Store(path);
 const input={dealId:'opp-001',status:'Approved' as const,draft:'Arrange approval meeting',version:0,key:'approval-one',actor:'m1'};
 const a=s.decide(input);assert.equal(a.status,'Approved');assert.equal(a.version,1);assert.deepEqual(s.decide(input),a);assert.throws(()=>s.decide({...input,key:'stale'}),/stale/i);s.close();s=new Store(path);
 assert.equal(s.read().actions[0].draft,input.draft);assert.equal(s.read().audit.length,1);const done=s.decide({...input,status:'Completed',version:1,key:'complete'});assert.equal(done.status,'Completed');assert.equal(s.read().audit.length,2);s.reset();assert.equal(s.read().actions.length,0);s.close();rmSync(dir,{recursive:true});
});
test('cannot complete unapproved action or let a rep act on another rep deal',()=>{
 const s=new Store(':memory:');assert.throws(()=>s.decide({dealId:'opp-001',status:'Completed',version:0,draft:'x',key:'x',actor:'m1'}),/approve/i);assert.throws(()=>s.decide({dealId:'opp-001',status:'Approved',version:0,draft:'x',key:'y',actor:'r2'}),/scope/i);s.close();
});
test('completion preserves the approved draft and rejects unapproved replacement',()=>{
 const s=new Store(':memory:');s.decide({dealId:'opp-001',status:'Approved',version:0,draft:'Approved original',key:'a',actor:'m1'});assert.throws(()=>s.decide({dealId:'opp-001',status:'Completed',version:1,draft:'Unapproved replacement',key:'b',actor:'m1'}),/approved draft/i);assert.equal(s.read().actions[0].draft,'Approved original');s.close();
});
