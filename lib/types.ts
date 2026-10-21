export type Category = 'Pipeline' | 'Best Case' | 'Commit';
export type ClaimKind = 'budget' | 'approval' | 'timeline';
export type Status = 'Verified' | 'Unverified' | 'Contradicted';
export type Risk = 'High' | 'Medium' | 'Low';
export interface Person {id:string;name:string;teamId:string;role:string}
export interface Stakeholder {id:string;name:string;title:string;authority:ClaimKind[]}
export interface Activity {id:string;date:string;type:'Email'|'Meeting'|'CRM note';direction:'inbound'|'outbound'|'internal';author:string;stakeholderId?:string;subject:string;body:string;meaningful:boolean; commitments?:{kind:ClaimKind;value:boolean;quote:string}[];completed?:boolean; procurementDays?:number}
export interface Claim {id:string;kind:ClaimKind;text:string}
export interface Deal {id:string;account:string;name:string;sector:string;city:string;ownerId:string;value:number;stage:string;category:Category;categoryHistory?:{date:string;category:Category;value:number}[];createdAt:string;closeDate:string;nextStep:string;nextStepDate:string;stakeholders:Stakeholder[];claims:Claim[];activities:Activity[];dateHistory:{date:string;from:string;to:string;reason:string;sourceId?:string}[];stageHistory:{date:string;stage:string}[];scenario?:string;expected?:string[]}
export interface Dataset {reps:Person[];managers:Person[];deals:Deal[]}
export interface ClaimResult extends Claim {status:Status;reason:string;sourceIds:string[];confidence:'High'|'Medium';confidenceReason:string;searchedRecordIds:string[];citations?:{activityId:string;quote:string}[];modelStatus?:Status;validationNote?:string}
export interface Finding {id:string;type:string;title:string;detail:string;sourceIds:string[];severity:Risk}
export interface Analysis {risk:Risk;claims:ClaimResult[];findings:Finding[];inactiveDays:number;pushes:number;coverage:string;supported:boolean;recommendation:{title:string;rationale:string;draft:string};asOf:string;provider:string;live?:{runId:string;model:string;generatedAt:string;inputHash:string;promptVersion:string;validationVersion?:string;summary:string;limitations:string[];usage:{inputTokens:number;outputTokens:number;totalTokens:number}|null}}
export interface Summary {pipeline:number;commit:number;supported:number;gap:number;coverage:number|null;count:number;high:number;medium:number;low:number;slipped:number}
export interface Action {id:string;dealId:string;status:'Pending'|'Approved'|'Rejected'|'Completed';draft:string;version:number;updatedAt:string;actor:string}
export interface Audit {id:number;dealId:string;event:string;actor:string;at:string;detail:string}
export interface Snapshot {date:string;pipeline:number;commit:number;supported:number}
export interface AppData extends Dataset {actions:Action[];audit:Audit[];snapshots:Snapshot[];liveAnalyses?:Record<string,Analysis>}
