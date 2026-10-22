export interface TraceUsage {inputTokens:number|null;cachedInputTokens:number|null;outputTokens:number|null;totalTokens:number|null}
export interface InrRates {input:number;cachedInput:number;output:number}
export const INR_PER_USD_ASSUMPTION=90;
export const TRACE_PRICING={verifiedOn:'2026-10-22',source:'https://developers.openai.com/api/docs/models/gpt-5-mini',inrPerUsd:INR_PER_USD_ASSUMPTION};
const token=(value:unknown)=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0?value:null;
export function recordedUsage(value:unknown):TraceUsage {
 const row=value&&typeof value==='object'?value as Record<string,unknown>:{};
 const inputTokens=token(row.inputTokens),outputTokens=token(row.outputTokens),cached=token(row.cachedInputTokens);
 const cachedInputTokens=inputTokens!==null&&cached!==null&&cached<=inputTokens?cached:null;
 return {inputTokens,cachedInputTokens,outputTokens,totalTokens:inputTokens!==null&&outputTokens!==null?inputTokens+outputTokens:null};
}
export function defaultInrRates(model:string|null):InrRates|null {
 return model&&/^gpt-5-mini(?:-\d{4}-\d{2}-\d{2})?$/.test(model)?{input:.25*INR_PER_USD_ASSUMPTION,cachedInput:.025*INR_PER_USD_ASSUMPTION,output:2*INR_PER_USD_ASSUMPTION}:null;
}
export function validInrRates(value:InrRates|null):value is InrRates {return !!value&&Object.values(value).every(n=>Number.isFinite(n)&&n>=0&&n<=1_000_000_000);}
export function estimateInr(usage:TraceUsage,rates:InrRates|null):number|null {
 if(!validInrRates(rates)||token(usage.inputTokens)===null||token(usage.outputTokens)===null)return null;
 const input=usage.inputTokens!,output=usage.outputTokens!,cached=usage.cachedInputTokens??0;
 if(token(cached)===null||cached>input)return null;
 return ((input-cached)*rates.input+cached*rates.cachedInput+output*rates.output)/1_000_000;
}
export function formatInr(value:number|null):string {
 if(value===null||!Number.isFinite(value))return 'Not available';
 if(value>0&&value<.000001)return '<₹0.000001';
 return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:2,maximumFractionDigits:6}).format(value);
}
