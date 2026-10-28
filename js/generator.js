'use strict';
/* generators */
function refIds(){return new Set(S.events.flatMap(e=>[e.target,e.to]).filter(Boolean))}
function genNode(x,d,refs){const def=DEFS[x.tag]||{},pad='  '.repeat(d),a=Object.entries(x.attrs).filter(([k,v])=>v!==''&&v!=null).map(([k,v])=>` ${k}="${esc(v)}"`).join('');
 if(def.void)return`${pad}<${x.tag}${a}>`;
 if(!x.children.length)return`${pad}<${x.tag}${a}>${esc(x.text)}</${x.tag}>`;
 return`${pad}<${x.tag}${a}>${x.text?'\n'+pad+'  '+esc(x.text):''}\n${x.children.map(c=>genNode(c,d+1,refs)).join('\n')}\n${pad}</${x.tag}>`}
function genHTML(link=true){const body=S.tree.map(x=>genNode(x,2)).join('\n');
 return`<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>My Page</title>\n${link?'  <link rel="stylesheet" href="css/style.css">\n':''}</head>\n<body>\n${body}\n${link?'  <script src="js/script.js"></scr'+'ipt>\n':''}</body>\n</html>\n`}
function genCSS(){return S.css.filter(r=>r.sel.trim()).map(r=>{const b=r.body.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>l.endsWith(';')||l.endsWith('{')||l.endsWith('}')?l:l+';');
 return r.media.trim()?`@media ${r.media.trim()} {\n  ${r.sel.trim()} {\n${b.map(l=>'    '+l).join('\n')}\n  }\n}`:`${r.sel.trim()} {\n${b.map(l=>'  '+l).join('\n')}\n}`}).join('\n\n')+'\n'}
function genJSON(){try{return JSON.stringify(JSON.parse(S.json),null,2)+'\n'}catch{return S.json}}
function genJS(){const L=['const DATA = '+(()=>{try{return JSON.stringify(JSON.parse(S.json),null,2)}catch{return'null'}})()+';',''];
 const q=id=>`document.getElementById(${JSON.stringify(id)})`;
 S.events.filter(e=>e.target).forEach(e=>{const t=e.to||e.target,v=JSON.stringify(e.value||'');let b;
  if(e.action==='text')b=`${q(t)}.textContent = ${v};`;else if(e.action==='class')b=`${q(t)}.classList.toggle(${v});`;
  else if(e.action==='hide')b=`${q(t)}.hidden = !${q(t)}.hidden;`;else b=`const el = ${q(t)};\n    el.textContent = Number(el.textContent) + Number(${v} || 0);`;
  L.push(`${q(e.target)}?.addEventListener(${JSON.stringify(e.event)}, (event) => {${e.event==='submit'?'\n    event.preventDefault();':''}\n    ${b}\n  });`.replace(/\n    /g,'\n    '),'')});
 return L.join('\n')+(S.js?'\n'+S.js+'\n':'')}
