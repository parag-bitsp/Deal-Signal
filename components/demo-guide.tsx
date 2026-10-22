'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,BookOpen,X} from 'lucide-react';

const progressKey='dealsignal-demo-script';
const anchor='/opportunities/opp-001';
const steps=[
 {title:'Spot the forecast gap',href:'/revenue',action:'Open revenue dashboard',instruction:'On Revenue intelligence, compare Committed forecast with Evidence-supported Commit. Look at Unsupported Commit, then find Aster Manufacturing in the opportunities table.',expect:'A forecast category reflects the rep’s report. Customer evidence determines how much of that Commit is supported.'},
 {title:'Read the customer’s evidence',href:anchor,action:'Investigate Aster Manufacturing',instruction:'Open the ₹20 lakh Aster Manufacturing opportunity. In Evidence, select “View customer evidence” under “Budget is approved” and read the customer’s email. Close the source to continue.',expect:'In the seeded demo, budget approval is Contradicted: finance approval is still pending. Economic-customer approval is separately Unverified.'},
 {title:'Check the slipping close date',href:`${anchor}?tab=Close-date%20history`,action:'Open close-date history',instruction:'Select the Close-date history tab. Read the two pushes and their supporting records, then return to Evidence.',expect:'Two close-date pushes provide another reason to investigate whether the deal can close on schedule.'},
 {title:'Review a human-approved next step',href:anchor,action:'Open the proposed intervention',instruction:'In Next-best action, select “Review follow-up”. Read or edit the draft, then select “Record demo approval”. If a decision is already recorded, inspect it and the Decision history tab instead.',expect:'The approval and reviewed draft are saved internally. No email is sent and no CRM record is updated.'},
 {title:'Test the forecast impact',href:anchor,action:'Open the forecast sandbox',instruction:'Select “Simulate reclassification” in Forecast sandbox. Keep Best Case selected and compare Baseline Commit with Scenario Commit. Close the scenario when finished.',expect:'Moving Aster out of Commit reduces the scenario’s committed forecast by ₹20 lakh. The baseline remains unchanged; a better evidence ratio does not mean new evidence was obtained.'},
 {title:'Inspect the decision trail and review brief',href:'/audit',action:'Open decision trail',instruction:'Open Decision trail to find the recorded Aster decision. Then return to Revenue intelligence, select “Weekly review brief”, and download the brief.',expect:'A recorded decision is traceable to its reviewer. The brief brings the current scope’s evidence gaps and proposed next steps together.'}
];
function remember(step:number,open:boolean){try{sessionStorage.setItem(progressKey,JSON.stringify({step,open}));}catch{/* The guide also works when browser storage is unavailable. */}}
export function DemoGuide(){
 return <div className="demo-guide-layout">
  <section className="card demo-guide-main">
   <span className="soft-tag">For hiring managers · About 5 minutes</span>
   <h2>Walk through DealSignal in five minutes</h2>
   <p className="demo-guide-intro">A sales rep calls a deal committed. Does the customer’s evidence support that forecast? Follow Aster Manufacturing from an unsupported commitment to a reviewed next step and a forecast scenario.</p>
   <a className="primary demo-start" href="/revenue" onClick={()=>remember(0,true)}>Start guided demo <ArrowRight size={16}/></a>
   <p className="demo-guide-hint">The Demo script panel keeps these instructions available as you explore. Use Next step when you are ready.</p>
   <ol className="demo-walkthrough">{steps.map((step,i)=><li key={step.title}>
    <h3>{step.title}</h3><p>{step.instruction}</p>
    <div className="demo-expected"><strong>What to look for</strong><p>{step.expect}</p></div>
    <a className="demo-step-link" href={step.href} onClick={()=>remember(i,true)}>{step.action}<ArrowRight size={14}/></a>
   </li>)}</ol>
  </section>
  <aside className="demo-guide-notes">
   <section className="card"><h2>What this project demonstrates</h2><p>Connecting source evidence, customer authority and freshness to forecast review, with a human decision before any action.</p><p>Rules detect inactivity and repeated slippage. Claim analysis uses simulated extraction or saved AI results. Source records remain available for inspection.</p><p>The dataset contains 150 synthetic opportunities, 20 representatives and four managers. All money is in INR.</p></section>
   <section className="card"><h2>Explore without setup</h2><p>No login or API key is needed to follow this script. The walkthrough uses existing analysis results without generating new ones.</p><p>The expected claim statuses describe the seeded simulated demo. Saved analysis may produce different labels; inspect the sources and provider shown.</p></section>
   <section className="card"><h2>A shared demonstration</h2><p>Visitors share saved decisions. If an approval already exists, inspect it rather than starting over.</p><p>Reset demo data clears everyone’s decisions and saved AI results. It is not needed to follow this guide.</p><p>No real CRM or email is connected. Evidence completeness is not a win probability, and this demo makes no claim of measured revenue improvement.</p></section>
  </aside>
 </div>;
}
export function DemoScript(){
 const [open,setOpen]=useState(false),[step,setStep]=useState(0);
 const closeButton=useRef<HTMLButtonElement>(null),toggleButton=useRef<HTMLButtonElement>(null);
 useEffect(()=>{try{const saved=JSON.parse(sessionStorage.getItem(progressKey)||'null');if(saved&&Number.isInteger(saved.step)&&saved.step>=0&&saved.step<steps.length){setStep(saved.step);setOpen(saved.open===true);}}catch{}},[]);
 function change(next:number){setStep(next);remember(next,true);}
 function toggle(value:boolean){setOpen(value);remember(step,value);requestAnimationFrame(()=>{if(value)closeButton.current?.focus();else toggleButton.current?.focus();});}
 const current=steps[step];
 return <aside className="demo-script-dock" aria-label="Demo walkthrough tools">
  {open&&<section id="demo-script-panel" className="demo-script-panel" role="region" aria-label="Demo script">
   <div className="demo-script-heading"><span>Step {step+1} of {steps.length}</span><button ref={closeButton} className="icon-button" aria-label="Close demo script" onClick={()=>toggle(false)}><X size={18}/></button></div>
   <div className="demo-script-body" aria-live="polite"><h2>{current.title}</h2><p>{current.instruction}</p><div className="demo-expected"><strong>What to look for</strong><p>{current.expect}</p></div><a className="demo-step-link" href={current.href} onClick={()=>remember(step,true)}>Open this screen <ArrowRight size={14}/></a></div>
   <div className="demo-script-controls"><button className="secondary" disabled={step===0} onClick={()=>change(step-1)}>Previous step</button>{step<steps.length-1?<button className="primary" onClick={()=>change(step+1)}>Next step <ArrowRight size={14}/></button>:<button className="primary" onClick={()=>toggle(false)}>Finish walkthrough</button>}</div>
   <a className="demo-script-full" href="/guide">Read full guide</a>
  </section>}
  <button ref={toggleButton} className="demo-script-toggle" aria-expanded={open} aria-controls={open?'demo-script-panel':undefined} onClick={()=>toggle(!open)}><BookOpen size={17}/>Demo script</button>
 </aside>;
}
