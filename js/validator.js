'use strict';
/* validation + accessibility */
function validate(){const out=[],ns=all(),ids={};
 ns.forEach(x=>{const id=x.attrs.id;if(id)ids[id]=(ids[id]||0)+1;
  if(x.tag==='img'&&!x.attrs.alt)out.push(['warn',`<img> needs alt text`]);
  if(x.tag==='button'&&!x.text&&!x.children.length)out.push(['bad',`<button> has no accessible name`]);
  if(x.tag==='input'&&x.attrs.type!=='checkbox'&&!x.attrs.id&&!x.attrs.placeholder)out.push(['warn',`<input> has no id/label`]);
  if(x.tag==='input'&&x.attrs.id&&!ns.some(l=>l.tag==='label'&&l.attrs.for===x.attrs.id))out.push(['warn',`<input id="${x.attrs.id}"> has no matching <label for>`])});
 Object.entries(ids).forEach(([k,c])=>c>1&&out.push(['bad',`Duplicate id "${k}"`]));
 const hs=ns.filter(x=>/^h[1-6]$/.test(x.tag)).map(x=>+x.tag[1]);if(hs.length&&hs[0]!==1)out.push(['warn','First heading is not h1']);
 for(let i=1;i<hs.length;i++)if(hs[i]-hs[i-1]>1){out.push(['warn',`Heading level jumps from h${hs[i-1]} to h${hs[i]}`]);break}
 try{JSON.parse(S.json)}catch(e){out.push(['bad','JSON: '+e.message])}
 S.css.forEach(r=>{if(r.sel.trim()&&(r.body.split('{').length!==r.body.split('}').length))out.push(['bad',`CSS "${r.sel}": unbalanced braces`]);
  r.body.split('\n').map(l=>l.trim()).filter(l=>l&&!/[{}]/.test(l)&&!/^[-\w]+\s*:\s*.+$/.test(l)).forEach(l=>out.push(['warn',`CSS "${r.sel}": "${l}" is not a declaration`]))});
 try{new Function(genJS())}catch(e){out.push(['bad','JavaScript: '+e.message])}
 const ref=refIds();ref.forEach(id=>{if(!ns.some(x=>x.attrs.id===id))out.push(['warn',`Event refers to missing id "${id}"`])});
 extraChecks(out);return out}
