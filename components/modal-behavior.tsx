'use client';
import {useEffect} from 'react';
/** Shared keyboard focus and scroll behavior for the topmost source/review dialog. */
export default function ModalBehavior(){
 useEffect(()=>{
  let active:HTMLElement|null=null,opener:HTMLElement|null=null;const overflow=document.body.style.overflow;
  const focusables=(el:HTMLElement)=>[...el.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter(x=>x.getClientRects().length>0);
  function sync(){const dialogs=[...document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]')].filter(x=>x.getClientRects().length>0);const next=dialogs.at(-1)??null;if(next===active)return;if(next){if(!active)opener=document.activeElement instanceof HTMLElement?document.activeElement:null;active=next;document.body.style.overflow='hidden';requestAnimationFrame(()=>focusables(next)[0]?.focus())}else{active=null;document.body.style.overflow=overflow;if(opener?.isConnected)opener.focus();opener=null;}}
  function key(e:KeyboardEvent){if(!active)return;const controls=focusables(active);if(e.key==='Tab'){const first=controls[0],last=controls.at(-1);if(!active.contains(document.activeElement)){e.preventDefault();first?.focus()}else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}if(e.key==='Escape'){const close=active.querySelector<HTMLButtonElement>('button[aria-label^="Close"],button[data-modal-close]');if(close){e.preventDefault();e.stopImmediatePropagation();close.click()}}}
  const observer=new MutationObserver(sync);observer.observe(document.body,{childList:true,subtree:true});document.addEventListener('keydown',key,true);sync();return()=>{observer.disconnect();document.removeEventListener('keydown',key,true);document.body.style.overflow=overflow};
 },[]);return null;
}
