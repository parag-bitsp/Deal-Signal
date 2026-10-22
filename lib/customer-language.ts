/** Update presentation wording without changing persisted source records or cache hashes. */
export function withCustomerLanguage<T>(value:T):T {
 if(typeof value==='string')return value.replace(/\bbuyers?\b/gi,word=>{
  const replacement=word.toLowerCase()==='buyers'?'customers':'customer';
  return word===word.toUpperCase()?replacement.toUpperCase():word[0]===word[0].toUpperCase()?replacement[0].toUpperCase()+replacement.slice(1):replacement;
 }) as T;
 if(Array.isArray(value))return value.map(item=>withCustomerLanguage(item)) as T;
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,withCustomerLanguage(item)])) as T;
 return value;
}
