'use strict';
/* modes and HTML import */
const TABVIS=[['props','visual','json','comps','docs','canvas','forge3d'],['props','visual','css','json','events','comps','docs','code','canvas','forge3d'],['props','visual','css','json','jsb','events','comps','docs','code','canvas','forge3d']];
let mode=1;try{mode=Number(storeGet('mode')??1)||0}catch{}
$('#mode').value=mode;
$('#mode').addEventListener('change',e=>{mode=+e.target.value;storeSet('mode',mode);if(!TABVIS[mode].includes(tab))tab='props';renderTabs();renderEdit()});
function h2t(el){const out=[];el.childNodes.forEach(c=>{if(c.nodeType!==1)return;const tag=c.tagName.toLowerCase();if(/^(script|style|link|meta|title)$/.test(tag))return;const kids=h2t(c);if(!DEFS[tag]){out.push(...kids);return}const v=DEFS[tag].void,text=[...c.childNodes].filter(t=>t.nodeType===3).map(t=>t.textContent.trim()).filter(Boolean).join(' '),attrs={};[...c.attributes].forEach(a=>{if(!/^on/i.test(a.name))attrs[a.name]=a.value});out.push({uid:++uid,tag,text:v?'':text,attrs,children:v?[]:kids})});return out}
$('#epane').addEventListener('click',e=>{if(e.target.id==='h2tgo'){const v=$('#h2t').value.trim();if(!v)return;const doc=new DOMParser().parseFromString(v,'text/html');mut(()=>{S.tree=h2t(doc.body);sel=null},true);flash('HTML imported. Scripts and on* handlers were removed.')}});
