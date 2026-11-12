import test from 'node:test';
import assert from 'node:assert/strict';
import {isWrittenCorrect,stateFor,nextDueAt,orderEntries,DAY} from '../src/lib/engine.mjs';
const entry={id:'x',word:'Hender',variants:['Hendir']};
test('acepta alternativas y espacios pero no tildes incorrectas',()=>{
 assert.equal(isWrittenCorrect('  HENDIR ',entry),true);
 assert.equal(isWrittenCorrect('Hénder',entry),false);
 assert.equal(isWrittenCorrect(' in   illo tempore ',{word:'In illo tempore'}),true);
});
test('descubrimiento no es un acierto',()=>{
 assert.equal(stateFor('x',[],[]),'new');
 assert.equal(stateFor('x',[{wordId:'x',timestamp:0}],[]),'learning');
 assert.equal(nextDueAt('x',[{wordId:'x',timestamp:0}],[]),0);
});
test('promoción y retroceso por fallo',()=>{
 const discoveries=[{wordId:'x',timestamp:0}];
 const attempts=[0,2,5,8].map((day,i)=>({wordId:'x',grade:i<2?'association':'immediate',timestamp:day*DAY}));
 assert.equal(stateFor('x',discoveries,attempts),'mastered');
 assert.equal(stateFor('x',discoveries,[...attempts,{wordId:'x',grade:'miss',timestamp:9*DAY}]),'consolidating');
 assert.equal(stateFor('x',discoveries,[...attempts,{wordId:'x',grade:'miss',timestamp:9*DAY},{wordId:'x',grade:'miss',timestamp:10*DAY}]),'learning');
});
test('repeticiones en sesión no promocionan estado ni vencimiento',()=>{
 const d=[{wordId:'x',timestamp:0}];const a=[{wordId:'x',grade:'miss',timestamp:DAY},{wordId:'x',grade:'immediate',timestamp:DAY+1000,repeatInSession:true}];
 assert.equal(nextDueAt('x',d,a),2*DAY);
});
test('alfabético no utiliza orden original',()=>{
 const result=orderEntries([{id:'2',word:'Zeta'},{id:'1',word:'Árbol'}],'alphabetical',[],[]);
 assert.equal(result[0].word,'Árbol');
});
