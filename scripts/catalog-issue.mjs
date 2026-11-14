import sharp from 'sharp';

const LANGUAGES=new Set(['es','en','de','fr','it']);
const REQUIRED=['word','meaning','bridge','association'];
const LIMIT=10*1024*1024;
const imagePath=id=>`public/images/${id}.webp`;
const canonicalImage=id=>`images/${id}.webp`;
const validId=id=>typeof id==='string'&&/^([a-z]{2})-[a-z0-9-]{1,120}$/.test(id);
const issueImageRe=/!\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g;
function attachmentMap(body){
 const clean=body.replace(/```[\s\S]*?```/g,'');
 const images=new Map();
 for(const match of clean.matchAll(issueImageRe)){
  const id=match[1],url=match[2];
  if(!validId(id))continue;
  if(images.has(id))throw Error(`Varias imágenes para ${id}: se admite una sola por palabra.`);
  const u=new URL(url);
  if(u.hostname!=='github.com'||!/^\/user-attachments\/assets\/[a-f0-9-]{36}$/i.test(u.pathname))throw Error(`El adjunto de ${id} debe ser una imagen de GitHub Issues.`);
  images.set(id,url);
 }
 return images;
}
async function fetchImage(url){
 const response=await fetch(url,{headers:{Accept:'image/*'},signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error(`No se pudo descargar la imagen adjunta: HTTP ${response.status}`);
 const declared=Number(response.headers.get('content-length')||0);
 if(declared>LIMIT)throw Error('La imagen original supera 10 MB.');
 const bytes=Buffer.from(await response.arrayBuffer());
 if(!bytes.length||bytes.length>LIMIT)throw Error('La imagen está vacía o supera 10 MB.');
 const metadata=await sharp(bytes,{limitInputPixels:30_000_000}).metadata();
 if(!['png','jpeg','webp'].includes(metadata.format)||metadata.pages>1)throw Error('Solo se admiten PNG, JPEG o WebP estáticos.');
 if(!metadata.width||!metadata.height||metadata.width>8192||metadata.height>8192)throw Error('Dimensiones de imagen no admitidas.');
 const optimized=await sharp(bytes).rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:82,effort:5}).toBuffer();
 if(optimized.length>2*1024*1024)throw Error('La imagen optimizada supera 2 MB.');
 return optimized;
}
function validateChange(change){
 if(!change||!validId(change.id)||!LANGUAGES.has(change.language)||!change.id.startsWith(change.language+'-'))throw Error('Identificador o idioma inválido.');
 if(!['upsert','patch','delete'].includes(change.operation))throw Error('Operación inválida.');
 for(const key of REQUIRED){
  if(change[key]!==undefined&&(typeof change[key]!=='string'||change[key].length>3500||!change[key].trim()))throw Error(`Campo ${key} inválido.`);
 }
 if(change.category!==undefined&&(typeof change.category!=='string'||change.category.length>120))throw Error('Categoría inválida.');
 if(change.variants!==undefined&&(!Array.isArray(change.variants)||change.variants.some(v=>typeof v!=='string'||v.length>150)))throw Error('Variantes inválidas.');
 if(change.image!==undefined&&!['set','remove'].includes(change.image))throw Error('Imagen: usa "set" o "remove".');
 if(change.operation==='delete'&&change.image!==undefined)throw Error('No adjuntes imagen a una eliminación de palabra.');
}
export async function processCatalogIssue({github,context,core}){
 const body=context.payload.issue.body||'';
 const match=body.match(/```json\s*([\s\S]*?)\s*```/);
 if(!match)throw Error('La issue necesita un bloque JSON.');
 const data=JSON.parse(match[1]);
 if(data.schema!==1||!Array.isArray(data.changes)||data.changes.length<1||data.changes.length>20)throw Error('Se esperan entre 1 y 20 cambios (schema 1).');
 const images=attachmentMap(body);
 const ids=new Set();
 const {owner,repo}=context.repo;
 const head=await github.rest.git.getRef({owner,repo,ref:'heads/main'});
 const parent=head.data.object.sha;
 const commit=await github.rest.git.getCommit({owner,repo,commit_sha:parent});
 const files=new Map();const tree=[];
 for(const change of data.changes){
  validateChange(change);
  if(ids.has(change.id))throw Error(`Entrada duplicada: ${change.id}`);
  ids.add(change.id);
  if(!files.has(change.language)){
   const path=`public/catalog/${change.language}.json`;
   let entries=[];
   try{
    const response=await github.rest.repos.getContent({owner,repo,path,ref:'main'});
    if(Array.isArray(response.data)||response.data.type!=='file')throw Error('Catálogo inválido');
    entries=JSON.parse(Buffer.from(response.data.content,'base64').toString('utf8'));
    if(!Array.isArray(entries))throw Error('El catálogo debe ser un array');
   }catch(error){if(error.status!==404)throw error;}
   files.set(change.language,entries);
  }
  const entries=files.get(change.language);
  const index=entries.findIndex(e=>e.id===change.id);
  const previous=index<0?null:entries[index];
  if(change.operation==='delete'){
   if(!previous)throw Error(`No existe ${change.id}`);
   entries.splice(index,1);
   if(previous.image)tree.push({path:imagePath(change.id),mode:'100644',type:'blob',sha:null});
   continue;
  }
  if(!previous&&!REQUIRED.every(key=>typeof change[key]==='string'&&change[key].trim()))throw Error(`Para crear ${change.id} hay que aportar palabra, significado, puente y asociación.`);
  if(change.operation==='patch'&&!previous)throw Error(`No existe la entrada que quieres modificar: ${change.id}`);
  const next={...previous,...Object.fromEntries(Object.entries(change).filter(([key])=>!['operation','image'].includes(key))),id:change.id,language:change.language};
  for(const key of REQUIRED)next[key]=next[key].trim();
  next.category=next.category||'';
  next.variants=next.variants||[];
  if(change.image==='set'){
   const url=images.get(change.id);
   if(!url)throw Error(`Falta adjuntar la imagen de ${change.id} como ![${change.id}](URL).`);
   const processed=await fetchImage(url);
   const blob=await github.rest.git.createBlob({owner,repo,content:processed.toString('base64'),encoding:'base64'});
   tree.push({path:imagePath(change.id),mode:'100644',type:'blob',sha:blob.data.sha});
   next.image=canonicalImage(change.id);
  }else if(change.image==='remove'){
   if(images.has(change.id))throw Error(`Hay una imagen adjunta a ${change.id}, pero has pedido eliminarla.`);
   delete next.image;
   if(previous?.image)tree.push({path:imagePath(change.id),mode:'100644',type:'blob',sha:null});
  }else if(images.has(change.id)){
   throw Error(`La issue adjunta una imagen a ${change.id}, pero falta image: "set" en el JSON.`);
  }
  if(index>=0)entries[index]=next;else entries.push(next);
 }
 for(const id of images.keys())if(!ids.has(id))throw Error(`Adjunto sin entrada correspondiente: ${id}`);
 for(const [language,entries] of files){
  const path=`public/catalog/${language}.json`;
  const content=JSON.stringify(entries.sort((a,b)=>a.word.localeCompare(b.word,'es')),null,2)+'\n';
  const blob=await github.rest.git.createBlob({owner,repo,content,encoding:'utf-8'});
  tree.push({path,mode:'100644',type:'blob',sha:blob.data.sha});
 }
 const newTree=await github.rest.git.createTree({owner,repo,tree,base_tree:commit.data.tree.sha});
 const newCommit=await github.rest.git.createCommit({owner,repo,message:`catalog: actualizar vocabulario e imágenes (#${context.issue.number})`,tree:newTree.data.sha,parents:[parent]});
 await github.rest.git.updateRef({owner,repo,ref:'heads/main',sha:newCommit.data.sha,force:false});
 await github.rest.issues.createComment({owner,repo,issue_number:context.issue.number,body:`✅ Catálogo actualizado con éxito en el commit ${newCommit.data.sha.slice(0,10)}.`});
 await github.rest.issues.update({owner,repo,issue_number:context.issue.number,state:'closed'});
 core.setOutput('changed','true');
}
