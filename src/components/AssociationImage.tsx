import type {VocabEntry} from '../types';

/** Imagen opcional de la película mnemotécnica, nunca usada como respuesta automática. */
export function AssociationImage({entry}:{entry:VocabEntry}){
 if(!entry.image)return null;
 const src=import.meta.env.BASE_URL+entry.image.replace(/^\/+/, '');
 return <figure className="association-figure">
  <a href={src} target="_blank" rel="noopener noreferrer" title="Ampliar ilustración">
   <img src={src} loading="lazy" alt={`Ilustración de la asociación mnemotécnica de ${entry.word}`}/>
  </a>
 </figure>;
}
