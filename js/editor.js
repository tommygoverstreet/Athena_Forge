'use strict';
/* code view: syntax highlighting, line numbers, copy, download */
let codeFiles={};
function hl(code,lang){
 const E=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 if(lang==='html')return E(code).replace(/([\w-]+)=("[^"]*")/g,'<span class="a">$1</span>=<span class="s">$2</span>').replace(/(&lt;\/?)([\w-]+)/g,'$1<span class="t">$2</span>');
 if(lang==='css')return E(code).replace(/^([^\s{}@][^{}\n]*)(\s\{)/gm,'<span class="t">$1</span>$2').replace(/^(\s+)([-\w]+)(:)/gm,'$1<span class="a">$2</span>$3');
 const re=/(\/\/.*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(const|let|var|function|return|if|else|for|while|switch|case|break|default|of|new|async|await|true|false|null|undefined)\b|(\b\d+(?:\.\d+)?\b)/g;
 let o='',i=0,m;
 while((m=re.exec(code))){o+=E(code.slice(i,m.index));const c=m[1]?'c':m[2]?'s':m[3]?'k':'nm';o+=`<span class="${c}">${E(m[0])}</span>`;i=re.lastIndex}
 return o+E(code.slice(i));
}
document.querySelector('#epane').addEventListener('click',e=>{const d=e.target.dataset;
 if(d.cc)navigator.clipboard?.writeText(codeFiles[d.cc]).then(()=>flash('Copied '+d.cc)).catch(()=>flash('Copy was blocked. Select the code and copy it by hand.'));
 else if(d.cd)dl(d.cd.split('/').pop(),codeFiles[d.cd])});
function markHtml(html,q){if(!q)return[html,0];let c=0;const re=new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');return[html.split(/(<[^>]+>|&\w+;)/).map(p=>/^(<|&\w+;$)/.test(p)?p:p.replace(re,m=>{c++;return`<mark>${m}</mark>`})).join(''),c]}
document.querySelector('#epane').addEventListener('input',e=>{if(e.target.id!=='cfind')return;const q=e.target.value;let t=0;document.querySelectorAll('.src[data-f]').forEach(p=>{const[h,c]=markHtml(hl(codeFiles[p.dataset.f],p.dataset.f.split('.').pop()),q);p.innerHTML=h;t+=c});document.querySelector('#cfcount').textContent=q?t+' matches':''});
