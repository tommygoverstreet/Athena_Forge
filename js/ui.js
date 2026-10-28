'use strict';
/* search, onboarding, help */
const CSSP=['color','background','font-size','padding','margin','border','border-radius','display','flex-direction','justify-content','align-items','gap','box-shadow','grid-template-columns','transition','transform','opacity','position'];
function search(q){q=q.trim().toLowerCase();const R=$('#sres');if(!q){R.hidden=true;return}const out=[];
 Object.entries(DEFS).forEach(([t,d])=>{if(t.includes(q)||d.cat.toLowerCase().includes(q))out.push([`HTML <${t}>`,()=>{$('#addtag').value=t;$('#addtag').focus()}])});
 Object.keys(CMPS).forEach(k=>{if(k.toLowerCase().includes(q))out.push([`Component: ${k}`,()=>insertC(CMPS[k]())])});
 Object.keys(TEMPLATES).forEach(k=>{if(k.includes(q))out.push([`Template: ${k}`,()=>{snap();S=TEMPLATES[k]();sel=null;renderAll()}])});
 EVENTS.forEach(e=>{if(e.includes(q))out.push([`Event: ${e}`,()=>{tab='events';renderTabs();renderEdit()}])});
 [...new Set([...CSSP,...VF.map(v=>v[0])])].forEach(c=>{if(c.includes(q))out.push([`CSS: ${c}`,()=>{tab='visual';renderTabs();renderEdit()}])});
 R.innerHTML=out.length?out.slice(0,20).map((o,i)=>`<button data-r="${i}">${esc(o[0])}</button>`).join(''):'<div class="empty">Nothing matches. Try “button”, “click”, or “flex”.</div>';R.hidden=false;R._o=out}
$('#q').addEventListener('input',e=>search(e.target.value));
$('#sres').addEventListener('click',e=>{const i=e.target.dataset.r;if(i!==undefined){const o=$('#sres')._o[i];o[1]();$('#sres').hidden=true;setView('edit')}});
$('#q').addEventListener('keydown',e=>{if(e.key==='Escape'){$('#sres').hidden=true;e.target.blur()}});
ep.addEventListener('click',e=>{const t=e.target,d=t.dataset;
 if(t.id==='vapply')applyVisual();
 else if(d.cin)insertC(CMPS[d.cin]());
 else if(d.cu!==undefined){const c=customC()[+d.cu];snap();putNodes([reuid(c.node)]);renderAll()}
 else if(d.cx!==undefined){const a=customC();a.splice(+d.cx,1);storeSet('components',JSON.stringify(a));renderComps()}
 else if(t.id==='csave'){const f=sel&&find(sel),nm=$('#cname2').value.trim();if(!f||!nm){flash('Select an element and name the component');return}const a=customC();a.push({name:nm,node:clone(f.node)});storeSet('components',JSON.stringify(a));renderComps()}});
ep.addEventListener('input',e=>{const d=e.target.dataset;if(d.vc)document.querySelector(`[data-v="${d.vc}"]`).value=e.target.value});
const DLG=$('#dlg');
function showWelcome(){DLG.innerHTML='<h2>Welcome to Athena Forge</h2><p style="color:var(--mute)">Forged with Athena\u2019s wisdom: build anywhere, on any device.</p><ol><li>Build structure with HTML</li><li>Style it with CSS</li><li>Add data with JSON</li><li>Add behaviour with JavaScript</li><li>Draw with Canvas, sculpt with 3D</li><li>Preview everything instantly</li></ol><div class="row"><button data-act="blank" class="primary">Start blank</button><button data-act="tpl">Choose template</button><button data-act="learn">Learn</button></div>';DLG.showModal()}
function showHelp(){DLG.innerHTML='<h2>Keyboard shortcuts</h2><p><code>Ctrl/Cmd+S</code> Save<br><code>Ctrl/Cmd+O</code> Open<br><code>Ctrl/Cmd+Z</code> Undo<br><code>Ctrl/Cmd+Shift+Z</code> Redo<br><code>Ctrl/Cmd+F</code> Search<br><code>Ctrl/Cmd+Enter</code> Refresh preview</p><button data-act="close" class="primary">Close</button>';DLG.showModal()}
DLG.addEventListener('click',e=>{const a=e.target.dataset.act;if(!a)return;DLG.close();if(a==='blank'){snap();S=TEMPLATES.blank();sel=null;renderAll()}else if(a==='tpl')$('#tpl').focus();else if(a==='learn'){snap();S=TEMPLATES.hello();sel=null;tab='docs';renderAll();setView('edit')}});
$('#b-help').onclick=showHelp;
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='f'){e.preventDefault();$('#q').focus()}});
