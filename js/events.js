'use strict';
/* events */
$('#addtag').innerHTML=Object.entries(DEFS).map(([t,d])=>`<option value="${t}">&lt;${t}&gt; — ${d.cat}</option>`).join('').replace(/&lt;/g,'<').replace(/<(\w+)>/g,'&lt;$1&gt;');
$('#b-add').onclick=()=>mut(()=>{const x=n($('#addtag').value),f=sel&&find(sel);(f&&!DEFS[f.node.tag].void?f.node.children:S.tree).push(x);sel=x.uid},true);
$('#tree').addEventListener('click',e=>{const d=e.target.closest('.node');if(d){sel=+d.dataset.id;renderTree();if(tab==='props')renderEdit()}});
$('#tree').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.target.click()}});
$('#treebtns').addEventListener('click',e=>{const a=e.target.dataset.a,f=sel&&find(sel);if(!a||!f)return;mut(()=>{const{list,i,node,parent}=f;
 if(a==='del'){list.splice(i,1);sel=null}
 else if(a==='dup'){const c=clone(node);(function r(z){z.uid=++uid;z.children.forEach(r)})(c);if(c.attrs.id)delete c.attrs.id;list.splice(i+1,0,c);sel=c.uid}
 else if(a==='up'&&i>0)[list[i-1],list[i]]=[list[i],list[i-1]];
 else if(a==='down'&&i<list.length-1)[list[i+1],list[i]]=[list[i],list[i+1]];
 else if(a==='in'&&i>0&&!DEFS[list[i-1].tag].void){list.splice(i,1);list[i-1].children.push(node)}
 else if(a==='out'&&parent){const g=find(parent.uid);list.splice(i,1);g.list.splice(g.i+1,0,node)}},true)});
$('#etabs').addEventListener('click',e=>{if(e.target.dataset.t){tab=e.target.dataset.t;renderTabs();renderEdit()}});
const ep=$('#epane');
ep.addEventListener('input',e=>{const t=e.target,f=sel&&find(sel);
 if(t.dataset.p&&f)mut(()=>f.node.text=t.value);
 else if(t.dataset.a&&f)mut(()=>{t.value===''?delete f.node.attrs[t.dataset.a]:f.node.attrs[t.dataset.a]=t.value});
 else if(t.dataset.c){const i=+t.closest('.card').dataset.i;mut(()=>S.css[i][t.dataset.c]=t.value)}
 else if(t.dataset.e){const i=+t.closest('.card').dataset.i;mut(()=>S.events[i][t.dataset.e]=t.value)}
 else if(t.id==='jsonta'){mut(()=>S.json=t.value);try{JSON.parse(t.value);$('#jmsg').innerHTML='<span class="ok">✓ Valid JSON</span>'}catch(er){$('#jmsg').innerHTML=`<span class="bad">✕ ${esc(er.message)}</span>`}}});
ep.addEventListener('click',e=>{const t=e.target;
 if(t.dataset.del!==undefined){const i=+t.dataset.del;mut(()=>(tab==='css'?S.css:S.events).splice(i,1));renderEdit()}
 else if(t.id==='addrule'){mut(()=>S.css.push({sel:'',media:'',body:''}));renderEdit()}
 else if(t.id==='addev'){mut(()=>S.events.push({target:'',event:'click',action:'text',value:'',to:''}));renderEdit()}
 else if(t.id==='jfmt'||t.id==='jmin'){try{const o=JSON.parse(S.json);mut(()=>S.json=t.id==='jfmt'?JSON.stringify(o,null,2):JSON.stringify(o));renderEdit()}catch(er){$('#jmsg').innerHTML=`<span class="bad">✕ ${esc(er.message)}</span>`}}
 else if(t.id==='cpall')navigator.clipboard?.writeText(genHTML()).catch(()=>{})});
$('#b-undo').onclick=undo;$('#b-redo').onclick=redo;
$('#b-save').onclick=()=>{try{storeSet('project',JSON.stringify(project()));flash('Saved in this browser')}catch{flash('Could not save: storage unavailable')}};
$('#b-open').onclick=()=>{try{const s=storeGet('project');s?load(JSON.parse(s)):flash('Nothing saved yet')}catch(e){flash(e.message)}};
$('#b-single').onclick=()=>{const doc=genHTML(false).replace('</head>',`<style>\n${genCSS()}</style>\n</head>`).replace('</body>',`<script>\n${genJS().replace(/<\/script/gi,'<\\/script')}</scr`+`ipt>\n</body>`);dl('athena-forge-page.html',doc,'text/html');flash('Exported one self-contained page')};
function currentTheme(){const d=document.documentElement.dataset.theme;if(d)return d;return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
$('#b-import').onclick=()=>$('#file').click();
$('#file').onchange=async e=>{try{load(JSON.parse(await e.target.files[0].text()))}catch(er){flash('Import failed: '+er.message)}e.target.value=''};
$('#b-export').onclick=()=>{dl('index.html',genHTML(),'text/html');dl('style.css',genCSS(),'text/css');dl('script.js',genJS(),'text/javascript');dl('data.json',genJSON(),'application/json');dl('project.athena-forge.json',JSON.stringify(project(),null,2),'application/json');flash('Exported. Put style.css in css/, script.js in js/')};
$('#b-theme').onclick=()=>{document.documentElement.dataset.theme=currentTheme()==='dark'?'light':'dark'};
$('#tpl').onchange=e=>{const k=e.target.value;if(k){snap();S=TEMPLATES[k]();sel=null;renderAll()}e.target.value=''};
$('#size').onchange=e=>{const c=e.target.value==='custom';$('#csize').hidden=!c;if(c)$('#csize').focus();else $('#pv').style.width=e.target.value};$('#csize').oninput=e=>{const v=+e.target.value;if(v)$('#pv').style.width=Math.min(2000,Math.max(200,v))+'px'};
$('#b-full').onclick=()=>$('#pv').requestFullscreen?.();
document.querySelector('.mnav').addEventListener('click',e=>{if(e.target.dataset.v)setView(e.target.dataset.v)});
function setView(v){$('main').dataset.v=v;document.querySelectorAll('.mnav button').forEach(b=>b.setAttribute('aria-selected',b.dataset.v===v))}
function flash(m){$('#issues').insertAdjacentHTML('afterbegin',`<div>${esc(m)}</div>`);setTimeout(renderIssues,2500)}
document.addEventListener('keydown',e=>{const m=e.ctrlKey||e.metaKey,k=e.key.toLowerCase();if(!m)return;
 if(k==='z'&&!/INPUT|TEXTAREA/.test(e.target.tagName)){e.preventDefault();e.shiftKey?redo():undo()}
 else if(k==='s'){e.preventDefault();$('#b-save').click()}else if(k==='o'){e.preventDefault();$('#b-open').click()}
 else if(k==='enter'){e.preventDefault();renderPreview()}});
