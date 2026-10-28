'use strict';
/* extra accessibility and nesting checks, called from validate() */
const NEST_NEED={li:['ul','ol'],tr:['table','thead','tbody'],td:['tr'],th:['tr'],thead:['table'],tbody:['table'],summary:['details'],option:['select','datalist','optgroup'],dt:['dl'],dd:['dl'],source:['video','audio'],caption:['table'],tfoot:['table'],colgroup:['table'],col:['colgroup']};
const BLOCKS=['div','p','ul','ol','section','article','header','footer','nav','main','form','table','h1','h2','h3'];
const NEST_BAD={p:BLOCKS,a:['a','button'],button:['button','a','input'],form:['form']};
const hexRGB=h=>{h=h.replace('#','');if(h.length===3)h=[...h].map(c=>c+c).join('');return/^[0-9a-f]{6}$/i.test(h)?[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)):null};
const lum=([r,g,b])=>{const f=v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
function hexDecl(body,names){for(const l of body.split('\n')){const m=l.trim().match(/^([-\w]+)\s*:\s*(#[0-9a-f]{3,6})\b/i);if(m&&names.includes(m[1].toLowerCase()))return hexRGB(m[2])}return null}
function extraChecks(out){
 (function walk(list,parent){list.forEach(x=>{const need=NEST_NEED[x.tag];
  if(need&&(!parent||!need.includes(parent.tag)))out.push(['bad',`<${x.tag}> must be inside <${need.join('> or <')}>`]);
  if(parent&&(NEST_BAD[parent.tag]||[]).includes(x.tag))out.push(['bad',`<${parent.tag}> cannot contain <${x.tag}>`]);
  if(x.tag==='a'&&!x.text&&!x.children.length)out.push(['bad','<a> link has no text']);
  if(+x.attrs.tabindex>0)out.push(['warn','A positive tabindex changes the natural tab order']);
  if(x.tag==='table'&&!all(x.children).some(c=>c.tag==='th'))out.push(['warn','<table> has no header cells (th)']);
  walk(x.children,x)})})(S.tree,null);
 S.css.forEach(r=>{const fg=hexDecl(r.body,['color']),bg=hexDecl(r.body,['background','background-color']);if(fg&&bg){const c=ratio(fg,bg);if(c<4.5)out.push(['warn',`Low contrast in "${r.sel}": ${c.toFixed(1)}:1 (aim for 4.5:1)`])}});
 const ns=all();
 S.events.filter(e=>/click/.test(e.event)).forEach(e=>{const t=ns.find(x=>x.attrs.id===e.target);if(t&&!['button','a','input','select','textarea','summary'].includes(t.tag)&&!(t.attrs.tabindex!==undefined&&t.attrs.role))out.push(['warn',`#${e.target} (<${t.tag}>) reacts to clicks but cannot be used with a keyboard. Use a button.`])});
}
