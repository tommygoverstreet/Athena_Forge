'use strict';
/* Canvas Studio: draw 2D art, undo/redo, download PNG, insert into the page.
   Drawing is stored as operations so undo redraws cleanly. */
const CV_W = 960, CV_H = 600;
let cvOps = [], cvHist = [], cvFut = [], cvTool = 'pen', cvColor = '#1F3A5F', cvWidth = 4, cvBg = '#ffffff', cvText = '', cvTextSize = 28;
try { const saved = storeGet('canvas'); if (saved) { const o = JSON.parse(saved); cvOps = o.ops || []; cvBg = o.bg || '#ffffff'; } } catch {}
function cvSave() { try { storeSet('canvas', JSON.stringify({ ops: cvOps, bg: cvBg })); } catch {} }
function cvPushHist() { cvHist.push(JSON.stringify(cvOps)); if (cvHist.length > 50) cvHist.shift(); cvFut = []; }
function cvDrawOp(ctx, op) {
  ctx.strokeStyle = op.color; ctx.fillStyle = op.color; ctx.lineWidth = op.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (op.t === 'pen' && op.pts.length > 1) {
    ctx.beginPath(); ctx.moveTo(op.pts[0][0], op.pts[0][1]);
    for (let i = 1; i < op.pts.length; i++) ctx.lineTo(op.pts[i][0], op.pts[i][1]);
    ctx.stroke();
  } else if (op.t === 'line') { ctx.beginPath(); ctx.moveTo(op.x0, op.y0); ctx.lineTo(op.x1, op.y1); ctx.stroke(); }
  else if (op.t === 'rect') { ctx.strokeRect(op.x0, op.y0, op.x1 - op.x0, op.y1 - op.y0); }
  else if (op.t === 'circle') {
    const r = Math.hypot(op.x1 - op.x0, op.y1 - op.y0);
    ctx.beginPath(); ctx.arc(op.x0, op.y0, r, 0, Math.PI * 2); ctx.stroke();
  } else if (op.t === 'text') { ctx.font = op.size + 'px Georgia, serif'; ctx.fillText(op.text, op.x, op.y); }
}
function cvRedraw() {
  const cv = document.getElementById('cv-canvas'); if (!cv) return;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = cvBg; ctx.fillRect(0, 0, CV_W, CV_H);
  cvOps.forEach(op => cvDrawOp(ctx, op));
}
function cvPos(e) {
  const cv = document.getElementById('cv-canvas'), r = cv.getBoundingClientRect();
  return [(e.clientX - r.left) * CV_W / r.width, (e.clientY - r.top) * CV_H / r.height];
}
function renderCanvasStudio() {
  const colors = ['#1A1712', '#C6A15B', '#1F3A5F', '#B76E79', '#2F5D50', '#A67C37', '#ffffff'];
  $('#epane').innerHTML = `<div class="studio">
    <p class="empty" style="padding:0">Draw with a finger, stylus, or mouse. Undo redraws from your strokes. Insert puts the art into your page as an image.</p>
    <div class="tools" role="group" aria-label="Drawing tools">
      ${['pen', 'line', 'rect', 'circle', 'text', 'eraser'].map(t => `<button type="button" data-cvtool="${t}" aria-pressed="${t === cvTool}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}
    </div>
    <div class="row"><label class="f" style="flex:1">Colour <input id="cv-color" type="color" value="${cvColor}"></label>
    <label class="f" style="flex:1">Brush <input id="cv-width" type="range" min="1" max="24" value="${cvWidth}"></label>
    <label class="f" style="flex:1">Background <input id="cv-bg" type="color" value="${cvBg}"></label></div>
    <div class="row"><label class="f" style="flex:2">Text (Text tool) <input id="cv-text" type="text" placeholder="Words for the Text tool" value="${esc(cvText)}"></label>
    <label class="f" style="flex:1">Text size <input id="cv-tsize" type="number" min="12" max="120" value="${cvTextSize}"></label></div>
    <div class="row"><button type="button" id="cv-undo">Undo</button><button type="button" id="cv-redo">Redo</button><button type="button" id="cv-clear">Clear</button></div>
    <canvas id="cv-canvas" width="${CV_W}" height="${CV_H}" aria-label="Drawing canvas"></canvas>
    <p class="empty" style="padding:6px 0">Canvas is ${CV_W} × ${CV_H}. Work is saved in this browser as you draw.</p>
    <div class="row"><button type="button" id="cv-png" class="primary">Download PNG</button><button type="button" id="cv-insert">Insert into page</button></div>
  </div>`;
  cvRedraw();
  document.querySelectorAll('[data-cvtool]').forEach(b => b.addEventListener('click', () => {
    cvTool = b.dataset.cvtool;
    document.querySelectorAll('[data-cvtool]').forEach(x => x.setAttribute('aria-pressed', x === b));
  }));
  document.getElementById('cv-color').addEventListener('input', e => cvColor = e.target.value);
  document.getElementById('cv-width').addEventListener('input', e => cvWidth = +e.target.value);
  document.getElementById('cv-bg').addEventListener('input', e => { cvBg = e.target.value; cvRedraw(); cvSave(); });
  document.getElementById('cv-text').addEventListener('input', e => cvText = e.target.value);
  document.getElementById('cv-tsize').addEventListener('input', e => cvTextSize = +e.target.value || 28);
  document.getElementById('cv-undo').addEventListener('click', () => {
    if (!cvHist.length) return; cvFut.push(JSON.stringify(cvOps)); cvOps = JSON.parse(cvHist.pop()); cvRedraw(); cvSave();
  });
  document.getElementById('cv-redo').addEventListener('click', () => {
    if (!cvFut.length) return; cvHist.push(JSON.stringify(cvOps)); cvOps = JSON.parse(cvFut.pop()); cvRedraw(); cvSave();
  });
  document.getElementById('cv-clear').addEventListener('click', () => {
    if (!cvOps.length) return;
    if (!confirm('Clear the whole canvas? Undo brings it back.')) return;
    cvPushHist(); cvOps = []; cvRedraw(); cvSave();
  });
  document.getElementById('cv-png').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = document.getElementById('cv-canvas').toDataURL('image/png');
    a.download = 'athena-artwork.png'; a.click();
  });
  document.getElementById('cv-insert').addEventListener('click', () => {
    const url = document.getElementById('cv-canvas').toDataURL('image/png');
    if (url.length > 900000) { flash('Artwork is large — download the PNG instead of inserting it.'); return; }
    snap(); putNodes([n('img', { attrs: { src: url, alt: 'Canvas artwork' } })]); renderAll();
    flash('Inserted as an image in your page.');
  });
  const cv = document.getElementById('cv-canvas');
  let cur = null;
  cv.addEventListener('pointerdown', e => {
    cv.setPointerCapture(e.pointerId);
    const [x, y] = cvPos(e);
    if (cvTool === 'text') {
      if (!cvText.trim()) { flash('Type words in the Text field first.'); return; }
      cvPushHist();
      cvOps.push({ t: 'text', x, y, text: cvText, color: cvColor, size: cvTextSize });
      cvRedraw(); cvSave(); return;
    }
    const color = cvTool === 'eraser' ? cvBg : cvColor;
    cur = cvTool === 'pen'
      ? { t: 'pen', pts: [[x, y]], color, w: cvTool === 'eraser' ? Math.max(cvWidth, 12) : cvWidth }
      : { t: cvTool, x0: x, y0: y, x1: x, y1: y, color, w: cvWidth };
  });
  cv.addEventListener('pointermove', e => {
    if (!cur) return;
    const [x, y] = cvPos(e);
    if (cur.t === 'pen') cur.pts.push([x, y]); else { cur.x1 = x; cur.y1 = y; }
    cvRedraw();
    const ctx = cv.getContext('2d');
    cvDrawOp(ctx, cur);
  });
  cv.addEventListener('pointerup', () => {
    if (!cur) return;
    cvPushHist(); cvOps.push(cur); cur = null; cvRedraw(); cvSave();
  });
  cv.addEventListener('pointercancel', () => { cur = null; cvRedraw(); });
}
