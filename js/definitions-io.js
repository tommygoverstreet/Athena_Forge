'use strict';
/* load and export definition files (JSON) so the vocabulary can grow without editing code */
function refreshAdd(){$('#addtag').innerHTML=Object.entries(DEFS).map(([t,d])=>`<option value="${t}">&lt;${t}&gt; — ${esc(d.cat)}</option>`).join('')}
function mergeDefs(o){let c=0;const S1=x=>esc(String(x??''));
 if(Array.isArray(o)){o.forEach(x=>{
  if(Array.isArray(x)&&x.length===3&&typeof x[0]==='string'&&/^[-\w]+$/.test(x[0])&&!VF.some(v=>v[0]===x[0])){VF.push([x[0],S1(x[1]),Array.isArray(x[2])?x[2].map(String).map(esc):x[2]==='color'?'color':S1(x[2])]);c++}
  else if(x&&typeof x.k==='string'&&typeof x.t==='string'&&Array.isArray(x.f)&&!JSC.some(j=>j.k===x.k)){JSC.push({k:S1(x.k),l:S1(x.l||x.k),note:x.note?String(x.note):'',t:x.t,f:x.f.map(f=>[String(f[0]).replace(/[^\w]/g,''),S1(f[1]),Array.isArray(f[2])?f[2].map(String):String(f[2]??'')])});c++}})}
 else if(o&&typeof o==='object'){Object.entries(o).forEach(([t,d])=>{if(/^[a-z][a-z0-9-]*$/.test(t)&&d&&d.cat&&!DEFS[t]){DEFS[t]={cat:String(d.cat),void:!!d.void,text:d.text?String(d.text):undefined,fields:(d.fields||[]).map(f=>({k:String(f.k).replace(/[^\w-]/g,''),label:S1(f.label||f.k),opts:Array.isArray(f.opts)?f.opts.map(String):undefined}))};c++}});refreshAdd()}
 return c}
document.querySelector('#epane').addEventListener('click',e=>{const id=e.target.id;
 if(id==='defload')document.querySelector('#deffile').click();
 else if(id==='defexp'){dl('html-elements.json',JSON.stringify(DEFS,null,2),'application/json');dl('css-properties.json',JSON.stringify(VF,null,2),'application/json');dl('js-constructs.json',JSON.stringify(JSC,null,2),'application/json')}});
document.querySelector('#deffile').addEventListener('change',async e=>{try{const n=mergeDefs(JSON.parse(await e.target.files[0].text()));flash(n?`Added ${n} definition${n>1?'s':''}`:'Nothing new in that file')}catch(er){flash('Could not read definitions: '+er.message)}e.target.value=''});
