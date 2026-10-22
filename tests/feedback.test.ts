import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Store} from '../lib/store.ts';

test('feedback saves a rating and trimmed optional text, persists and survives demo reset',()=>{
 const dir=mkdtempSync(join(tmpdir(),'feedback-')),path=join(dir,'test.db');let store=new Store(path);
 try{
  const result=store.saveFeedback({rating:4,message:'  Helpful demo.  '});assert.ok(result.id>0);
  store.saveFeedback({rating:5,message:''});store.close();store=new Store(path);store.reset();
  const rows=store.db.prepare('SELECT rating,message,created_at FROM feedback ORDER BY id').all();
  assert.equal(rows.length,2);assert.equal(rows[0].rating,4);assert.equal(rows[0].message,'Helpful demo.');
  assert.ok(Number.isFinite(Date.parse(String(rows[0].created_at))));assert.equal(rows[1].message,'');
 }finally{store.close();rmSync(dir,{recursive:true,force:true});}
});
test('feedback rejects invalid ratings and text without writing rows',()=>{
 const store=new Store(':memory:');
 try{
  for(const rating of [0,6,2.5,'5',null,NaN])assert.throws(()=>store.saveFeedback({rating,message:''}),/rating/i);
  for(const message of [null,{},'a'.repeat(2001)])assert.throws(()=>store.saveFeedback({rating:5,message}),/feedback/i);
  assert.equal(store.db.prepare('SELECT COUNT(*) AS n FROM feedback').get()!.n,0);
 }finally{store.close();}
});
