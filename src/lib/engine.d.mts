export function normalizedAnswer(value: string): string;
export function isWrittenCorrect(answer: string, entry: {word:string; variants?:string[]}): boolean;
export function stateFor(wordId:string, discoveries:unknown[], attempts:unknown[], policy?:unknown): string;
export function nextDueAt(wordId:string, discoveries:unknown[], attempts:unknown[], policy?:unknown): number|null;
export function orderEntries<T extends {id:string;word:string}>(entries:T[],mode:string,attempts:unknown[],discoveries:unknown[],now?:number): T[];
export function shuffle<T>(list:T[], random?:()=>number):T[];
