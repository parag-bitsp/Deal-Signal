import {Check,Minus,AlertTriangle,HelpCircle} from 'lucide-react';
import type {Risk,Status} from '../lib/types';
export function Badge({value}:{value:Risk|Status|string}){const tone=['Verified','Approved','Completed','Low'].includes(value)?'good':['High','Contradicted','Rejected'].includes(value)?'bad':'warn';return <span className={`badge ${tone}`}><span className="status-dot"/>{value==='Low'?'No detected risk':value==='High'?'High risk':value==='Medium'?'Watch':value}</span>}
export function ClaimIcon({status}:{status:Status}){return status==='Verified'?<Check size={16}/>:status==='Contradicted'?<AlertTriangle size={16}/>:<HelpCircle size={16}/>}
export function Empty({title='No opportunities match',detail='Try a different search or clear your filters.'}:{title?:string;detail?:string}){return <div className="empty"><Minus size={26}/><h3>{title}</h3><p>{detail}</p></div>}
