'use strict';
/* editing actions */
function mut(fn,full){snap();fn();full?renderAll():refresh()}
function dl(name,text,type='text/plain'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function project(){return{format:'athena-forge-project',version:'1.0',project:{name:'My Project'},html:{tree:S.tree},css:{rules:S.css},javascript:{events:S.events,code:S.js||''},json:{text:S.json},components:customC(),settings:{}}}
function load(p){if(p?.format!=='athena-forge-project'&&p?.format!=='webforge-project')throw new Error('Not an Athena Forge project file');snap();
 const rules=(p.css.rules||[]).map(r=>({sel:r.sel||'',media:r.media||'',body:r.body||''}));
 const evs=(p.javascript.events||[]).map(e=>({target:e.target||'',event:e.event||'click',action:e.action||'text',value:e.value||'',to:e.to||''}));
 S={tree:p.html.tree||[],css:rules,events:evs,js:p.javascript.code||'',json:p.json.text||'{}'};
 if(Array.isArray(p.components)&&p.components.length){const have=customC(),names=new Set(have.map(c=>c.name));p.components.forEach(c=>{if(c&&c.name&&c.node&&!names.has(c.name))have.push(c)});storeSet('components',JSON.stringify(have))}
 uid=Math.max(0,...all().map(x=>x.uid));sel=null;renderAll()}
