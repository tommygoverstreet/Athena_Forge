'use strict';
/* rendering */
function renderTree(){const t=$('#tree');if(!S.tree.length){t.innerHTML='<div class="empty">No elements yet.<br>Choose one above and press Add to start building your page.</div>';return}
 const rows=[];(function w(l,d){l.forEach(x=>{rows.push(`<div class="node${x.uid===sel?' sel':''}" data-id="${x.uid}" style="padding-left:${6+d*14}px" tabindex="0" role="button"><b>${x.tag}</b>${x.attrs.id?'#'+esc(x.attrs.id):''}<em>${esc(x.text.slice(0,18))}</em></div>`);w(x.children,d+1)})})(S.tree,0);t.innerHTML=rows.join('')}
function renderPreview(){const css=genCSS(),js=genJS(),doc=genHTML(false).replace('</head>',`<style>\n${css}</style>\n</head>`).replace('</body>',`<script>\n${js.replace(/<\/script/gi,'<\\/script')}</scr`+`ipt>\n</body>`);$('#pv').srcdoc=doc}
function renderIssues(){const v=validate();$('#issues').innerHTML=v.length?v.map(([c,m])=>`<div class="${c}">${c==='bad'?'✕':'⚠'} ${esc(m)}</div>`).join(''):'<div class="ok">✓ No problems found</div>'}
const TABS=[['props','Properties'],['css','CSS'],['json','JSON'],['jsb','JavaScript'],['visual','Style helper'],['events','Events'],['comps','Components'],['docs','Docs'],['code','Code'],['canvas','Canvas'],['forge3d','3D']];
function renderTabs(){$('#etabs').innerHTML=TABS.filter(([k])=>TABVIS[mode].includes(k)).map(([k,l])=>`<button role="tab" data-t="${k}" aria-selected="${k===tab}">${l}</button>`).join('')}
function field(label,html){return`<label class="f">${label}${html}</label>`}
function renderEdit(){const p=$('#epane');
 if(tab==='props'){const f=sel&&find(sel);if(!f){p.innerHTML='<div class="empty">No element selected.<br>Pick one in the Structure panel to edit its text and attributes.</div>';return}
  const x=f.node,def=DEFS[x.tag]||{};let h=`<h2>&lt;${x.tag}&gt;</h2>`;
  if(!def.void)h+=field('Text',`<textarea data-p="text" style="min-height:60px;white-space:normal">${esc(x.text)}</textarea>`);
  if(mode>=1)h+=field('ID',`<input data-a="id" value="${esc(x.attrs.id||'')}">`)+field('Class',`<input data-a="class" value="${esc(x.attrs.class||'')}">`);
  (def.fields||[]).forEach(fl=>{const v=x.attrs[fl.k]??'';h+=field(fl.label,fl.opts?`<select data-a="${fl.k}">${fl.opts.map(o=>`<option ${o===v?'selected':''}>${o}</option>`).join('')}</select>`:`<input data-a="${fl.k}" value="${esc(v)}">`)});
  if(mode>=2)h+=field('Inline style (advanced)',`<input data-a="style" value="${esc(x.attrs.style||'')}">`);p.innerHTML=h}
 else if(tab==='css'){p.innerHTML=(S.css.length?S.css.map((r,i)=>`<div class="card" data-i="${i}">${field('Selector',`<input data-c="sel" value="${esc(r.sel)}" placeholder=".class, #id, h1, nav > a:hover">`)}${field('Only when (media query, optional)',`<input data-c="media" value="${esc(r.media)}" placeholder="(max-width: 768px)">`)}${field('Declarations',`<textarea data-c="body" placeholder="color: #333;">${esc(r.body)}</textarea>`)}<button data-del="${i}">Remove rule</button></div>`).join(''):'<div class="empty">No CSS rules yet. Add a rule to style your elements.</div>')+'<button id="addrule" class="primary">Add rule</button>'}
 else if(tab==='json'){p.innerHTML=jtree()+field('Project data as text (becomes data.json and DATA in script.js)',`<textarea id="jsonta" style="min-height:240px">${esc(S.json)}</textarea>`)+'<div class="row"><button id="jfmt">Format</button><button id="jmin">Minify</button></div><div id="jmsg"></div>'}
 else if(tab==='events'){const ids=all().map(x=>x.attrs.id).filter(Boolean),opt=(l,v)=>l.map(o=>`<option ${o===v?'selected':''}>${esc(o)}</option>`).join('');
  p.innerHTML=(ids.length?'':'<div class="empty">Give elements an ID (Properties tab) so events can find them.</div>')+S.events.map((e,i)=>`<div class="card" data-i="${i}"><b>WHEN</b>${field('Element',`<select data-e="target"><option></option>${opt(ids,e.target)}</select>`)}${field('Event',`<select data-e="event">${opt(EVENTS,e.event)}</select>`)}<b>THEN</b>${field('Action',`<select data-e="action">${ACTIONS.map(a=>`<option value="${a.k}" ${a.k===e.action?'selected':''}>${a.l}</option>`).join('')}</select>`)}${field('On element',`<select data-e="to"><option></option>${opt(ids,e.to)}</select>`)}${field('Value',`<input data-e="value" value="${esc(e.value||'')}">`)}<button data-del="${i}">Remove</button></div>`).join('')+'<button id="addev" class="primary">Add event</button>'}
 else if(tab==='visual')renderVisual();
 else if(tab==='jsb')renderJSB();
 else if(tab==='comps')renderComps();
 else if(tab==='docs')renderDocs();
 else if(tab==='canvas')renderCanvasStudio();
 else if(tab==='forge3d')renderForge3D();
 else{renderCode()}}
function renderCode(){const files={'index.html':genHTML(),'css/style.css':genCSS(),'js/script.js':genJS(),'data/data.json':genJSON()};codeFiles=files;
 $('#epane').innerHTML='<input id="cfind" type="search" placeholder="Find in code" aria-label="Find in code"><div id="cfcount" class="empty" style="padding:2px 0"></div>'+Object.keys(files).map(k=>{const v=files[k];return`<div class="cf"><div class="row" style="align-items:center;margin-bottom:2px"><b style="flex:1;font-size:12.5px">${k}</b><button data-cc="${k}">Copy</button><button data-cd="${k}">Download</button></div><div class="code"><pre class="ln" aria-hidden="true">${v.split('\n').map((_,j)=>j+1).join('\n')}</pre><pre class="src" tabindex="0" data-f="${k}">${hl(v,k.split('.').pop())}</pre></div></div>`}).join('')+(mode>=2?field('Advanced: paste HTML to replace the structure','<textarea id="h2t" placeholder="<main>...</main>"></textarea>')+'<button id="h2tgo">Replace structure</button>':'')}
function refresh(){renderTree();renderIssues();clearTimeout(timer);timer=setTimeout(renderPreview,150);if(tab==='code')renderCode()}
function renderAll(){renderTree();renderTabs();renderEdit();renderIssues();renderPreview()}
