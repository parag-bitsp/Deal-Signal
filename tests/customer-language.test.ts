import {test} from 'node:test';
import assert from 'node:assert/strict';
import {withCustomerLanguage} from '../lib/customer-language.ts';
import {Store} from '../lib/store.ts';
import {analyze,resolveAnalysis} from '../lib/engine.ts';
import {hashDeal} from '../lib/analysis-context.ts';

test('legacy evidence and saved results use customer wording without mutating stored records',()=>{
 const legacy={subject:'Buyer confirmation',body:"The buyer’s budget and BUYERS' approval.",nested:[{summary:'Economic-buyer review; buyers replied.',inputHash:'abc123'}],buyerInactivityDays:21,enabled:false};
 const before=structuredClone(legacy),display=withCustomerLanguage(legacy);
 assert.equal(display.subject,'Customer confirmation');
 assert.equal(display.body,"The customer’s budget and CUSTOMERS' approval.");
 assert.equal(display.nested[0].summary,'Economic-customer review; customers replied.');
 assert.equal(display.nested[0].inputHash,'abc123');
 assert.equal(display.buyerInactivityDays,21);
 assert.equal(display.enabled,false);
 assert.deepEqual(legacy,before);
});

test('presentation wording preserves a valid cached assessment and its source provenance',()=>{
 const store=new Store(':memory:');
 try {
  const deal=store.dataset().deals[0];deal.claims[1].text='Economic buyer has approved the purchase';
  store.db.prepare('UPDATE opportunities SET record=? WHERE id=?').run(JSON.stringify(deal),deal.id);
  const saved={...analyze(deal),provider:'OpenAI live',live:{runId:'cached-terminology',model:'gpt-5-mini',generatedAt:'2026-10-20T10:00:00Z',inputHash:hashDeal(deal),promptVersion:'test',summary:'Buyer approval is not recorded.',limitations:[],usage:null}};
  store.saveAnalysis(deal.id,saved);
  const display=withCustomerLanguage(store.read()),cached=display.liveAnalyses![deal.id];
  assert.equal(resolveAnalysis(display.deals[0],cached).live?.summary,'Customer approval is not recorded.');
  assert.equal(cached.live?.inputHash,saved.live.inputHash);
  assert.equal(store.read().liveAnalyses![deal.id].live?.summary,'Buyer approval is not recorded.');
  assert.equal(store.dataset().deals[0].claims[1].text,'Economic buyer has approved the purchase');
 } finally {store.close();}
});

test('an existing approved draft can be completed using its displayed customer wording',()=>{
 const store=new Store(':memory:');
 try {
  const original='Please confirm the buyer approval.';
  const approved=store.decide({dealId:'opp-001',status:'Approved',draft:original,actor:'m1',version:0,key:'legacy-approval'});
  const completed=store.decide({dealId:'opp-001',status:'Completed',draft:withCustomerLanguage(approved.draft),actor:'m1',version:approved.version,key:'complete-legacy-approval'});
  assert.equal(completed.status,'Completed');
  assert.equal(completed.draft,original,'Completion must preserve the stored approved draft');
  assert.equal(withCustomerLanguage(completed).draft,'Please confirm the customer approval.');
  assert.throws(()=>store.decide({dealId:'opp-002',status:'Completed',draft:'Unapproved text',actor:'m1',version:0,key:'no-approval'}),/Approve/);
 } finally {store.close();}
});
