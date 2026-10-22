'use client';
import {useState} from 'react';
import type {FormEvent} from 'react';
import {CheckCircle2,MessageSquare,Star,X} from 'lucide-react';

export default function Feedback(){
 const [open,setOpen]=useState(false),[rating,setRating]=useState(0),[message,setMessage]=useState('');
 const [saving,setSaving]=useState(false),[saved,setSaved]=useState(false),[error,setError]=useState('');
 function show(){setRating(0);setMessage('');setError('');setSaved(false);setOpen(true);}
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(saving||!rating)return;setSaving(true);setError('');
  try{
   const response=await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({rating,message}),signal:AbortSignal.timeout(15000)});
   if(!response.ok)throw new Error('Your feedback could not be saved. Please try again.');
   setSaved(true);
  }catch{setError('Your feedback could not be saved. Please try again.');}finally{setSaving(false);}
 }
 return <><button className="primary feedback-link" onClick={show}><MessageSquare size={17}/>Leave feedback</button>{open&&<div className="overlay feedback-overlay"><div className="small-dialog feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
  <div className="card-title"><h2 id="feedback-title">{saved?'Thank you for your feedback':'Leave feedback'}</h2><button className="icon-button" aria-label="Close feedback" disabled={saving} onClick={()=>setOpen(false)}><X size={19}/></button></div>
  {saved?<div className="feedback-success" role="status"><CheckCircle2 size={30}/><p>Your rating and feedback have been saved.</p><button className="primary" onClick={()=>setOpen(false)}>Done</button></div>:<form onSubmit={submit}>
   <p className="muted">How was your experience with DealSignal?</p>
   <fieldset className="feedback-rating"><legend>Your rating</legend><div className="feedback-stars">{[1,2,3,4,5].map(value=><label key={value} className={value<=rating?'selected':''} title={`${value} ${value===1?'star':'stars'}`}><input className="sr-only" type="radio" name="feedback-rating" aria-label={`${value} ${value===1?'star':'stars'}`} value={value} checked={rating===value} onChange={()=>setRating(value)} required/><Star size={30} aria-hidden="true"/></label>)}</div><span className="feedback-rating-value" aria-live="polite">{rating?`${rating} out of 5`:'Choose 1 to 5 stars'}</span></fieldset>
   <label className="feedback-message" htmlFor="feedback-message">Your feedback <span className="muted">(optional)</span><textarea id="feedback-message" name="feedback-message" rows={4} maxLength={2000} placeholder="What worked well? What could be better?" value={message} onChange={event=>setMessage(event.target.value)}/></label>
   <div className="feedback-count">{message.length.toLocaleString('en-IN')} / 2,000 characters</div>
   {error&&<p className="error-inline" role="alert">{error}</p>}
   <div className="dialog-actions"><button className="secondary" type="button" data-modal-close disabled={saving} onClick={()=>setOpen(false)}>Cancel</button><button className="primary" type="submit" disabled={!rating||saving}>{saving?'Saving feedback…':'Submit feedback'}</button></div>
  </form>}
 </div></div>}</>;
}
