import {useEffect,useMemo,useState} from 'react';
import {Heart,Search,X} from 'lucide-react';
import {nextDueAt,stateFor} from '../lib/engine';
import type {Language,LocalState,RecallGrade,VocabEntry} from '../types';

type Filter='all'|'new'|'discovered'|'due'|'learning'|'consolidating'|'mastered';
type Item={entry:VocabEntry;status:string;dueAt:number|null};
const labels:Record<string,string>={new:'Nueva',learning:'Aprendiendo',consolidating:'Consolidando',mastered:'Dominada'};
const grades:Record<RecallGrade,string>={immediate:'Inmediatamente',association:'Mediante asociación',hint:'Con pista',miss:'Fallada'};
const formatDate=(ts:number)=>new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',year:'numeric'}).format(ts);
type Props={entries:VocabEntry[];state:LocalState;languages:Language[]};

export default function ReviewLibrary({entries,state,languages}:Props){
 const [filter,setFilter]=useState<Filter>('all');
 const [query,setQuery]=useState('');
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const items=useMemo<Item[]>(()=>entries.filter(e=>languages.includes(e.language)).map(entry=>({
  entry,status:stateFor(entry.id,state.discoveries,state.attempts),
  dueAt:nextDueAt(entry.id,state.discoveries,state.attempts)
 })),[entries,state,languages]);
 const now=Date.now();
 const needle=query.trim().toLocaleLowerCase('es-ES');
 const visible=items.filter(({entry,status,dueAt})=>
  (filter==='all'||filter==='discovered'&&status!=='new'||filter==='due'&&dueAt!==null&&dueAt<=now||filter===status) &&
  (!needle||(entry.word+' '+entry.meaning+' '+entry.bridge).toLocaleLowerCase('es-ES').includes(needle))
 ).sort((a,b)=>a.entry.word.localeCompare(b.entry.word,'es'));
 const detail=items.find(x=>x.entry.id===selectedId);
 const attempts=detail?state.attempts.filter(a=>a.wordId===detail.entry.id).slice().sort((a,b)=>a.timestamp-b.timestamp):[];
 const reviews=attempts.filter(a=>!a.repeatInSession);
 const correct=reviews.filter(a=>a.grade!=='miss').length;
 const misses=reviews.filter(a=>a.grade==='miss').length;
 const discoveredAt=state.discoveries.find(d=>d.wordId===selectedId)?.timestamp;
 const lastReview=reviews.at(-1);
 const totalDiscovered=items.filter(x=>x.status!=='new').length;
 const totalDue=items.filter(x=>x.dueAt!==null&&x.dueAt<=now).length;
 useEffect(()=>{
  if(!selectedId)return;
  const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setSelectedId(null)};
  document.addEventListener('keydown',close);
  return()=>document.removeEventListener('keydown',close);
 },[selectedId]);
 return <section className="review-section">
  <header className="heading"><div className="eyebrow">SEGUIMIENTO DEL VOCABULARIO</div><h1>Revisar</h1><p>Consulta todas las palabras o filtra las descubiertas y las pendientes. Toca una para ver su asociación y estadísticas.</p></header>
  <div className="review-overview">
   <div><strong>{items.length}</strong><span>Disponibles</span></div>
   <div><strong>{totalDiscovered}</strong><span>Descubiertas</span></div>
   <div><strong>{totalDue}</strong><span>Pendientes de repaso</span></div>
  </div>
  <div className="library-toolbar review-toolbar">
   <div className="search-field"><Search size={18}/><input aria-label="Buscar palabras para revisar" placeholder="Buscar palabra, significado o puente…" value={query} onChange={e=>setQuery(e.target.value)}/></div>
   <select aria-label="Filtrar palabras para revisar" value={filter} onChange={e=>setFilter(e.target.value as Filter)}>
    <option value="all">Todas las palabras</option>
    <option value="new">Nuevas</option>
    <option value="discovered">Descubiertas</option>
    <option value="due">Pendientes de repaso</option>
    <option value="learning">Aprendiendo</option>
    <option value="consolidating">Consolidando</option>
    <option value="mastered">Dominadas</option>
   </select>
  </div>
  <p className="review-count">{visible.length} de {items.length} palabras</p>
  <div className="review-word-list">
   {visible.map(({entry,status,dueAt})=><button key={entry.id} type="button" className="review-word-row" onClick={()=>setSelectedId(entry.id)} aria-label={'Ver ficha y estadísticas de '+entry.word}>
    <span className="review-word-info"><span className="review-word-heading"><strong>{entry.word}</strong><span className={'pill '+status}>{labels[status]}</span>{dueAt!==null&&dueAt<=now&&<span className="review-due">Pendiente</span>}</span><span className="review-word-meaning">{entry.meaning}</span></span>
    <span className="review-word-open" aria-hidden="true">›</span>
   </button>)}
   {!visible.length&&<div className="empty">No hay palabras que coincidan con estos filtros.</div>}
  </div>
  {detail&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedId(null)}}>
   <div className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
    <header className="review-modal-header">
     <div><span className="review-modal-eyebrow">FICHA DE VOCABULARIO · {detail.entry.language.toUpperCase()}</span><h2 id="review-modal-title">{detail.entry.word}</h2><span className={'pill '+detail.status}>{labels[detail.status]}</span>{state.favorites.includes(detail.entry.id)&&<span className="review-favorite"><Heart size={14} fill="currentColor"/> Favorita</span>}</div>
     <button type="button" autoFocus className="icon-button" aria-label="Cerrar ficha" onClick={()=>setSelectedId(null)}><X size={20}/></button>
    </header>
    <div className="review-detail">
     <h3>Significado</h3><p>{detail.entry.meaning}</p>
     <h3>Imagen o palabra puente</h3><p>{detail.entry.bridge}</p>
     <h3>Asociación inverosímil</h3><p className="review-association">{detail.entry.association}</p>
     {!!detail.entry.variants?.length&&<><h3>Variantes admitidas</h3><p>{detail.entry.variants.join(', ')}</p></>}
     {!!detail.entry.category&&<p className="review-category">Categoría: {detail.entry.category}</p>}
    </div>
    <section className="review-progress">
     <h3>Estadísticas de esta palabra</h3>
     <div className="review-numbers">
      <div><strong>{reviews.length}</strong><span>Repasos</span></div>
      <div><strong>{correct}</strong><span>Aciertos</span></div>
      <div><strong>{misses}</strong><span>Fallos</span></div>
      <div><strong>{attempts.length-reviews.length}</strong><span>Segundas oportunidades</span></div>
     </div>
     <div className="review-meta">
      <span>Descubierta</span><strong>{discoveredAt===undefined?'Sin descubrir':formatDate(discoveredAt)}</strong>
      <span>Último repaso</span><strong>{lastReview?formatDate(lastReview.timestamp)+' · '+grades[lastReview.grade]:'Sin repasos'}</strong>
      <span>Próximo repaso</span><strong>{detail.dueAt===null?'No programado':detail.dueAt<=now?'Pendiente':formatDate(detail.dueAt)}</strong>
     </div>
     {!!attempts.length&&<div className="review-history"><h3>Últimos intentos</h3>{attempts.slice(-5).reverse().map(a=><div key={a.id} className="review-history-row"><span>{formatDate(a.timestamp)}{a.repeatInSession?' · segunda oportunidad':''}</span><span className={'pill '+a.grade}>{grades[a.grade]}</span></div>)}</div>}
    </section>
   </div>
  </div>}
 </section>
}
