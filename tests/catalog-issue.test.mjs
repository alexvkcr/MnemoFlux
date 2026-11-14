import test from 'node:test';
import assert from 'node:assert/strict';
import {attachmentMap,validateChange} from '../scripts/catalog-issue.mjs';
const url='https://github.com/user-attachments/assets/12345678-1234-1234-1234-123456789abc';
test('las issues identifican un único adjunto por palabra',()=>{
 const found=attachmentMap(`\`\`\`json\n{"image":"set"}\n\`\`\`\n![es-gaban](${url})`);
 assert.equal(found.get('es-gaban'),url);
 assert.throws(()=>attachmentMap(`![es-gaban](${url})\n![es-gaban](${url})`),/Varias imágenes/);
});
test('se aceptan parches de imágenes sin reenviar el vocabulario',()=>{
 assert.doesNotThrow(()=>validateChange({id:'es-gaban',language:'es',operation:'patch',image:'set'}));
 assert.doesNotThrow(()=>validateChange({id:'es-gaban',language:'es',operation:'patch',image:'remove'}));
 assert.throws(()=>validateChange({id:'es-gaban',language:'es',operation:'patch',image:['a','b']}),/Imagen/);
 assert.throws(()=>validateChange({id:'es-gaban',language:'es',operation:'delete',image:'set'}),/No adjuntes/);
});
