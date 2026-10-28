'use strict';
/* JSON tree editor */
const isC=x=>x!==null&&typeof x==='object',jtype=x=>x===null?'null':Array.isArray(x)?'array':typeof x;
const jget=(r,pa)=>pa.reduce((o,k)=>o[k],r);
function jrows(v,path,d){return Object.entries(v).map(([k,x])=>{const pa=[...path,Array.isArray(v)?+k:k],pj=esc(JSON.stringify(pa)),t=jtype(x),A=`data-jp="${pj}"`;
 const key=Array.isArray(v)?`<code>${k}</code>`:`<input data-jk ${A} value="${esc(k)}" aria-label="Key">`;
 const val=isC(x)?`<span style="flex:1;color:var(--mute)">${t} (${Object.keys(x).length})</span>`:t==='null'?'<span style="flex:1;color:var(--mute)">null</span>':t==='boolean'?`<select data-jv ${A}><option ${x?'selected':''}>true</option><option ${x?'':'selected'}>false</option></select>`:`<input data-jv ${A} ${t==='number'?'type="number" step="any"':''} value="${esc(x)}" aria-label="Value">`;
 return`<div class="jr" style="margin-left:${d*14}px">${key}<select data-jt ${A} aria-label="Type">${['string','number','boolean','null','object','array'].map(o=>`<option ${o===t?'selected':''}>${o}</option>`).join('')}</select>${val}${isC(x)?`<button data-ja="add" ${A} title="Add child">+</button>`:''}<button data-ja="dup" ${A} title="Duplicate">⧉</button><button data-ja="up" ${A} title="Move up">↑</button><button data-ja="down" ${A} title="Move down">↓</button><button data-ja="nest" ${A} title="Nest inside a new level">⇥</button><button data-ja="unnest" ${A} title="Move up one level">⇤</button><button data-ja="del" ${A} title="Delete">✕</button></div>`+(isC(x)?jrows(x,pa,d+1):'')}).join('')}
function jtree(){let r;try{r=JSON.parse(S.json)}catch{return'<div id="jtree"><div class="bad">The JSON text below has an error. Fix it to use the tree editor.</div></div>'}
 return`<div id="jtree"><div class="row"><button data-ja="add" data-jp="[]">Add to ${Array.isArray(r)?'array':'root'}</button></div>${isC(r)&&Object.keys(r).length?jrows(r,[],0):'<div class="empty">Empty. Add a property to begin.</div>'}</div>`}
function reorder(o,fn){const e=Object.entries(o);fn(e);Object.keys(o).forEach(k=>delete o[k]);e.forEach(([k,v])=>o[k]=v)}
function jmut(fn,full=true){let r;try{r=JSON.parse(S.json)}catch{return}fn(r);mut(()=>S.json=JSON.stringify(r,null,2));if(full)renderEdit();else{const t=$('#jsonta');if(t)t.value=S.json}}
const conv=(x,t)=>t==='string'?(isC(x)?'':x===null?'':String(x)):t==='number'?(Number(x)||0):t==='boolean'?(x==='false'?false:!!x):t==='null'?null:t==='object'?{}:[];
ep.addEventListener('click',e=>{const t=e.target,a=t.dataset.ja;if(!a)return;const pa=JSON.parse(t.dataset.jp);
 jmut(r=>{if(a==='add'){const c=jget(r,pa);if(Array.isArray(c))c.push('new');else{let k='key',i=1;while(k in c)k='key'+(++i);c[k]=''}return}
  const par=jget(r,pa.slice(0,-1)),k=pa[pa.length-1],arr=Array.isArray(par),idx=arr?k:Object.keys(par).indexOf(k);
  if(a==='nest')par[k]=arr?[par[k]]:{value:par[k]};
  else if(a==='unnest'){if(pa.length<2)return;const gp=jget(r,pa.slice(0,-2)),pk=pa[pa.length-2],val=par[k];arr?par.splice(k,1):delete par[k];Array.isArray(gp)?gp.splice(pk+1,0,val):reorder(gp,en=>{let nk=arr?'item':k;while(en.some(x=>x[0]===nk))nk+='_';en.splice(Object.keys(gp).indexOf(pk)+1,0,[nk,val])})}
  else if(a==='del')arr?par.splice(k,1):delete par[k];
  else if(a==='dup'){const c=JSON.parse(JSON.stringify(par[k]));arr?par.splice(k+1,0,c):reorder(par,en=>en.splice(idx+1,0,[k+'_copy',c]))}
  else{const j=a==='up'?idx-1:idx+1,len=Object.keys(par).length;if(j<0||j>=len)return;arr?([par[idx],par[j]]=[par[j],par[idx]]):reorder(par,en=>{[en[idx],en[j]]=[en[j],en[idx]]})}})});
ep.addEventListener('input',e=>{const t=e.target;if(t.dataset.jv!==undefined){const pa=JSON.parse(t.dataset.jp);jmut(r=>{const par=jget(r,pa.slice(0,-1)),k=pa[pa.length-1],cur=par[k];par[k]=typeof cur==='number'?(t.value===''?0:Number(t.value)):typeof cur==='boolean'?t.value==='true':t.value},false)}
 else if(t.id==='jsonta'){const b=$('#jtree');if(b)b.outerHTML=jtree()}});
ep.addEventListener('change',e=>{const t=e.target;
 if(t.dataset.jk!==undefined){const pa=JSON.parse(t.dataset.jp);jmut(r=>{const par=jget(r,pa.slice(0,-1)),k=pa[pa.length-1];if(t.value&&t.value!==k&&!(t.value in par))reorder(par,en=>{en[Object.keys(par).indexOf(k)][0]=t.value})})}
 else if(t.dataset.jt!==undefined){const pa=JSON.parse(t.dataset.jp);jmut(r=>{const par=jget(r,pa.slice(0,-1)),k=pa[pa.length-1];par[k]=conv(par[k],t.value)})}
 else if(t.id==='jsc'){jsk=t.value;renderJSB()}});
