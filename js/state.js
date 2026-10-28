'use strict';
/* state */
let uid=0;function n(tag,o={}){return{uid:++uid,tag,text:o.text??(DEFS[tag]?.text||''),attrs:o.attrs||{},children:o.children||[]}}
let S=TEMPLATES.hello(),sel=null,hist=[],fut=[],tab='props',timer;
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const clone=o=>JSON.parse(JSON.stringify(o));
/* storage: athena: keys, reading legacy webforge: keys once (migration) */
function storeGet(k){try{const v=localStorage.getItem('athena:'+k);if(v!==null)return v;return localStorage.getItem('webforge:'+k)}catch{return null}}
function storeSet(k,v){try{localStorage.setItem('athena:'+k,v)}catch{}}
function find(id,list=S.tree,parent=null){for(let i=0;i<list.length;i++){if(list[i].uid===id)return{node:list[i],list,i,parent};const r=find(id,list[i].children,list[i]);if(r)return r}return null}
function all(list=S.tree,out=[]){list.forEach(x=>{out.push(x);all(x.children,out)});return out}
function snap(){hist.push(JSON.stringify(S));if(hist.length>100)hist.shift();fut=[]}
function restore(str){S=JSON.parse(str);uid=Math.max(0,...all().map(x=>x.uid));if(sel&&!find(sel))sel=null;renderAll()}
function undo(){if(!hist.length)return;fut.push(JSON.stringify(S));restore(hist.pop())}
function redo(){if(!fut.length)return;hist.push(JSON.stringify(S));restore(fut.pop())}
