import type { Attempt, Discovery, LocalState } from '../types';
const DB_NAME='mnemoflux';
const STORE='progress';
const KEY='v1';
const EMPTY: LocalState={version:1,discoveries:[],attempts:[],favorites:[]};
let dbPromise:Promise<IDBDatabase>|null=null;
function db():Promise<IDBDatabase> {
  if(!dbPromise) dbPromise=new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,1);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE);};
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
  return dbPromise;
}
export async function loadState():Promise<LocalState> {
  const database=await db();
  return new Promise((resolve,reject)=>{
    const request=database.transaction(STORE,'readonly').objectStore(STORE).get(KEY);
    request.onsuccess=()=>resolve(validatedState(request.result));request.onerror=()=>reject(request.error);
  });
}
export async function persistState(state:LocalState):Promise<void>{
  const database=await db();
  return new Promise((resolve,reject)=>{
    const transaction=database.transaction(STORE,'readwrite');
    transaction.objectStore(STORE).put(state,KEY);
    transaction.oncomplete=()=>resolve();transaction.onerror=()=>reject(transaction.error);
  });
}
export function validatedState(source:unknown):LocalState {
  if(!source||typeof source!=='object')return structuredClone(EMPTY);
  const s=source as Partial<LocalState>;
  const discoveries:Array<Discovery>=Array.isArray(s.discoveries)?s.discoveries.filter(x=>x && typeof x.wordId==='string' && typeof x.timestamp==='number' && typeof x.language==='string'):[];
  const attempts:Array<Attempt>=Array.isArray(s.attempts)?s.attempts.filter(x=>x && typeof x.wordId==='string' && typeof x.timestamp==='number' && ['immediate','association','hint','miss'].includes(x.grade)):[];
  const favorites=Array.isArray(s.favorites)?s.favorites.filter(x=>typeof x==='string'):[];
  return {version:1,discoveries,attempts,favorites};
}
export const emptyState=()=>structuredClone(EMPTY);
