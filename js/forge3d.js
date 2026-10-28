'use strict';
/* Forge3D: a tiny zero-dependency 3D engine (projection + painter sort +
   shading) and a scene editor. Engine functions are self-contained so the
   standalone export can stringify them into its own page. */
function f3dRot(p, rx, ry) {
  const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
  const y1 = p[1] * cx - p[2] * sx, z1 = p[1] * sx + p[2] * cx;
  return [p[0] * cy + z1 * sy, y1, -p[0] * sy + z1 * cy];
}
function f3dCyl(segs, r, h) {
  const verts = [], faces = [];
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    verts.push([r * Math.cos(a), -h / 2, r * Math.sin(a)]);
    verts.push([r * Math.cos(a), h / 2, r * Math.sin(a)]);
  }
  const cb = verts.length; verts.push([0, -h / 2, 0]);
  const ct = verts.length; verts.push([0, h / 2, 0]);
  for (let i = 0; i < segs; i++) {
    const j = (i + 1) % segs, b0 = i * 2, b1 = j * 2, t0 = i * 2 + 1, t1 = j * 2 + 1;
    faces.push([b0, t1, b1], [b0, t0, t1]);
    faces.push([ct, t1, t0], [cb, b0, b1]);
  }
  return { verts, faces };
}
function f3dGeom(type) {
  if (type === 'box') {
    const v = [[-.5, -.5, -.5], [.5, -.5, -.5], [.5, .5, -.5], [-.5, .5, -.5], [-.5, -.5, .5], [.5, -.5, .5], [.5, .5, .5], [-.5, .5, .5]];
    const f = [[4, 5, 6], [4, 6, 7], [0, 2, 1], [0, 3, 2], [1, 2, 6], [1, 6, 5], [0, 4, 7], [0, 7, 3], [3, 7, 6], [3, 6, 2], [0, 1, 5], [0, 5, 4]];
    return { verts: v, faces: f };
  }
  if (type === 'pyramid') {
    const v = [[-.5, -.5, -.5], [.5, -.5, -.5], [.5, -.5, .5], [-.5, -.5, .5], [0, .75, 0]];
    const f = [[0, 1, 2], [0, 2, 3], [3, 2, 4], [2, 1, 4], [1, 0, 4], [0, 3, 4]];
    return { verts: v, faces: f };
  }
  if (type === 'cylinder') return f3dCyl(12, .5, 1);
  if (type === 'sphere') {
    const longN = 12, latN = 8, verts = [[0, 1, 0]], faces = [];
    for (let j = 1; j < latN; j++) {
      const phi = (j / latN) * Math.PI, y = Math.cos(phi), r = Math.sin(phi);
      for (let i = 0; i < longN; i++) {
        const th = (i / longN) * Math.PI * 2;
        verts.push([r * Math.cos(th), y, r * Math.sin(th)]);
      }
    }
    const bot = verts.length; verts.push([0, -1, 0]);
    const ring = (j, i) => 1 + (j - 1) * longN + ((i % longN + longN) % longN);
    for (let i = 0; i < longN; i++) faces.push([0, ring(1, i + 1), ring(1, i)]);
    for (let j = 1; j < latN - 1; j++) for (let i = 0; i < longN; i++)
      faces.push([ring(j, i), ring(j, i + 1), ring(j + 1, i + 1)], [ring(j, i), ring(j + 1, i + 1), ring(j + 1, i)]);
    for (let i = 0; i < longN; i++) faces.push([bot, ring(latN - 1, i), ring(latN - 1, i + 1)]);
    return { verts, faces };
  }
  if (type === 'column') {
    const shaft = f3dCyl(10, .3, 1.4);
    const base = f3dGeom('box'), cap = f3dGeom('box');
    const merged = { verts: shaft.verts.slice(), faces: shaft.faces.slice() };
    function addPart(g, sx, sy, sz, dy) {
      const off = merged.verts.length;
      g.verts.forEach(v => merged.verts.push([v[0] * sx, v[1] * sy + dy, v[2] * sz]));
      g.faces.forEach(f => merged.faces.push([f[0] + off, f[1] + off, f[2] + off]));
    }
    addPart(base, .95, .18, .95, -.79);
    addPart(cap, .95, .18, .95, .79);
    return merged;
  }
  return f3dGeom('box');
}
function f3dShade(hex, f) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = Math.min(255, Math.round(parseInt(h.slice(0, 2), 16) * f));
  const g = Math.min(255, Math.round(parseInt(h.slice(2, 4), 16) * f));
  const b = Math.min(255, Math.round(parseInt(h.slice(4, 6), 16) * f));
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}
function f3dDrawScene(ctx, W, H, objects, view) {
  const L = [0.4, 0.8, -0.5], ll = Math.hypot(L[0], L[1], L[2]);
  const lx = L[0] / ll, ly = L[1] / ll, lz = L[2] / ll;
  const draw = [];
  objects.forEach(o => {
    const g = f3dGeom(o.type);
    const world = g.verts.map(v => {
      const s = [v[0] * o.s, v[1] * o.s, v[2] * o.s];
      const r = f3dRot(s, 0, (o.ry || 0) * Math.PI / 180);
      return [r[0] + o.x, r[1] + o.y, r[2] + o.z];
    });
    const vr = world.map(v => f3dRot(v, view.rx, view.ry));
    g.faces.forEach(fc => {
      const a = vr[fc[0]], b = vr[fc[1]], c = vr[fc[2]];
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
      const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
      if (nz >= 0) return;
      const depth = (a[2] + b[2] + c[2]) / 3;
      const shade = 0.35 + 0.65 * Math.max(0, nx * lx + ny * ly + nz * lz);
      const pts = [a, b, c].map(p => {
        const z = p[2] + 6, s = 380 / z * view.zoom;
        return [W / 2 + p[0] * s, H / 2 - p[1] * s];
      });
      draw.push({ depth, pts, color: f3dShade(o.color, shade) });
    });
  });
  draw.sort((p, q) => q.depth - p.depth);
  draw.forEach(d => {
    ctx.beginPath();
    ctx.moveTo(d.pts[0][0], d.pts[0][1]);
    ctx.lineTo(d.pts[1][0], d.pts[1][1]);
    ctx.lineTo(d.pts[2][0], d.pts[2][1]);
    ctx.closePath();
    ctx.fillStyle = d.color; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.stroke();
  });
  return draw.length;
}

/* ---- editor ---- */
let f3dObjects = [
  { type: 'column', x: -1.3, y: 0, z: 0, s: 1, ry: 0, color: '#C6A15B' },
  { type: 'box', x: 1.1, y: -0.2, z: 0, s: 0.9, ry: 30, color: '#1F3A5F' },
  { type: 'pyramid', x: 0.1, y: -0.5, z: 0.6, s: 0.8, ry: 0, color: '#B76E79' }
];
let f3dSel = 0, f3dView = { rx: -0.4, ry: 0.6, zoom: 1, spin: false }, f3dRAF = null;
try {
  const saved = storeGet('forge3d');
  if (saved) { const o = JSON.parse(saved); if (Array.isArray(o.objects)) f3dObjects = o.objects; if (o.view) f3dView = o.view; }
} catch {}
function f3dSave() { try { storeSet('forge3d', JSON.stringify({ objects: f3dObjects, view: f3dView })); } catch {} }
function f3dPaint() {
  const cv = document.getElementById('f3d-canvas'); if (!cv) return;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 960, 600);
  f3dDrawScene(ctx, 960, 600, f3dObjects, f3dView);
}
function f3dLoop() {
  if (!document.getElementById('f3d-canvas')) { f3dRAF = null; return; }
  if (f3dView.spin) { f3dView.ry += 0.01; f3dPaint(); }
  f3dRAF = requestAnimationFrame(f3dLoop);
}
function renderForge3D() {
  if (f3dRAF) cancelAnimationFrame(f3dRAF);
  const names = { box: 'Box', pyramid: 'Pyramid', cylinder: 'Cylinder', column: 'Greek column', sphere: 'Sphere' };
  $('#epane').innerHTML = `<div class="studio">
    <p class="empty" style="padding:0">Drag the scene to orbit it. Add shapes, pick one, and tune it below. Export gives you a standalone page that runs anywhere.</p>
    <div class="tools" role="group" aria-label="Add shape">
      ${Object.keys(names).map(t => `<button type="button" data-f3dadd="${t}">+ ${names[t]}</button>`).join('')}
    </div>
    <canvas id="f3d-canvas" width="960" height="600" aria-label="3D scene"></canvas>
    <div class="row"><label class="f" style="flex:1">Zoom <input id="f3d-zoom" type="range" min="0.5" max="2" step="0.1" value="${f3dView.zoom}"></label>
    <label class="f" style="flex:1">Spin <input id="f3d-spin" type="checkbox" ${f3dView.spin ? 'checked' : ''} style="width:auto"></label>
    <button type="button" id="f3d-reset" style="flex:1">Reset view</button></div>
    <h2>Objects</h2>
    <div id="f3d-list">${f3dObjects.map((o, i) => `<div class="card obj${i === f3dSel ? ' sel' : ''}" data-f3dobj="${i}"><b>${names[o.type] || o.type}</b> · ${o.color} <button type="button" data-f3ddel="${i}" style="float:right">Delete</button></div>`).join('') || '<div class="empty">No shapes yet — add one above.</div>'}</div>
    ${f3dSel !== null && f3dObjects[f3dSel] ? `<div class="card">
      <h2>Edit: ${names[f3dObjects[f3dSel].type]}</h2>
      <div class="row"><label class="f" style="flex:1">Colour <input id="f3d-color" type="color" value="${f3dObjects[f3dSel].color}"></label>
      <label class="f" style="flex:1">Size <input id="f3d-size" type="range" min="0.3" max="2" step="0.1" value="${f3dObjects[f3dSel].s}"></label></div>
      <div class="row"><label class="f" style="flex:1">X <input id="f3d-x" type="range" min="-3" max="3" step="0.1" value="${f3dObjects[f3dSel].x}"></label>
      <label class="f" style="flex:1">Y <input id="f3d-y" type="range" min="-3" max="3" step="0.1" value="${f3dObjects[f3dSel].y}"></label>
      <label class="f" style="flex:1">Z <input id="f3d-z" type="range" min="-3" max="3" step="0.1" value="${f3dObjects[f3dSel].z}"></label></div>
      <div class="row"><label class="f" style="flex:1">Turn <input id="f3d-ry" type="range" min="0" max="360" step="5" value="${f3dObjects[f3dSel].ry}"></label></div>
    </div>` : ''}
    <div class="row"><button type="button" id="f3d-export" class="primary">Export standalone page</button><button type="button" id="f3d-snap">Insert snapshot image</button></div>
    <div class="row"><button type="button" id="f3d-json">Copy scene JSON</button><button type="button" id="f3d-clear">Clear scene</button></div>
  </div>`;
  f3dPaint();
  f3dRAF = requestAnimationFrame(f3dLoop);
  const cv = document.getElementById('f3d-canvas');
  let ox = 0, oy = 0, dragging = false;
  cv.addEventListener('pointerdown', e => { dragging = true; ox = e.clientX; oy = e.clientY; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    if (!dragging) return;
    f3dView.ry += (e.clientX - ox) * 0.01; f3dView.rx = Math.max(-1.4, Math.min(1.4, f3dView.rx + (e.clientY - oy) * 0.01));
    ox = e.clientX; oy = e.clientY; f3dPaint();
  });
  cv.addEventListener('pointerup', () => { dragging = false; f3dSave(); });
  cv.addEventListener('pointercancel', () => { dragging = false; });
  document.querySelectorAll('[data-f3dadd]').forEach(b => b.addEventListener('click', () => {
    f3dObjects.push({ type: b.dataset.f3dadd, x: 0, y: 0, z: 0, s: 1, ry: 0, color: '#C6A15B' });
    f3dSel = f3dObjects.length - 1; f3dSave(); renderForge3D();
  }));
  document.querySelectorAll('[data-f3dobj]').forEach(d => d.addEventListener('click', e => {
    if (e.target.dataset.f3ddel !== undefined) return;
    f3dSel = +d.dataset.f3dobj; renderForge3D();
  }));
  document.querySelectorAll('[data-f3ddel]').forEach(b => b.addEventListener('click', () => {
    f3dObjects.splice(+b.dataset.f3ddel, 1);
    if (f3dSel >= f3dObjects.length) f3dSel = f3dObjects.length - 1;
    f3dSave(); renderForge3D();
  }));
  const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('input', e => { fn(e.target.value); f3dPaint(); f3dSave(); }); };
  bind('f3d-color', v => f3dObjects[f3dSel].color = v);
  bind('f3d-size', v => f3dObjects[f3dSel].s = +v);
  bind('f3d-x', v => f3dObjects[f3dSel].x = +v);
  bind('f3d-y', v => f3dObjects[f3dSel].y = +v);
  bind('f3d-z', v => f3dObjects[f3dSel].z = +v);
  bind('f3d-ry', v => f3dObjects[f3dSel].ry = +v);
  const zoom = document.getElementById('f3d-zoom');
  zoom.addEventListener('input', e => { f3dView.zoom = +e.target.value; f3dPaint(); f3dSave(); });
  document.getElementById('f3d-spin').addEventListener('change', e => { f3dView.spin = e.target.checked; f3dSave(); });
  document.getElementById('f3d-reset').addEventListener('click', () => { f3dView.rx = -0.4; f3dView.ry = 0.6; f3dView.zoom = 1; f3dPaint(); f3dSave(); });
  document.getElementById('f3d-export').addEventListener('click', () => {
    const engine = [f3dCyl, f3dGeom, f3dRot, f3dShade, f3dDrawScene].map(f => f.toString()).join('\n');
    const doc = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Athena Forge 3D scene</title>\n<style>body{margin:0;background:#fff;display:flex;justify-content:center}canvas{width:100%;height:auto;touch-action:none}</style>\n</head>\n<body>\n<canvas id="scene" width="960" height="600"></canvas>\n<script>\n' + engine + '\nconst SCENE = ' + JSON.stringify(f3dObjects) + ';\nconst view = { rx: ' + f3dView.rx + ', ry: ' + f3dView.ry + ', zoom: ' + f3dView.zoom + ', spin: true };\nconst cv = document.getElementById("scene"), ctx = cv.getContext("2d");\nfunction frame(){ ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 960, 600); if (view.spin) view.ry += 0.01; f3dDrawScene(ctx, 960, 600, SCENE, view); requestAnimationFrame(frame); }\nlet ox = 0, oy = 0, drag = false;\ncv.addEventListener("pointerdown", e => { drag = true; ox = e.clientX; oy = e.clientY; view.spin = false; });\ncv.addEventListener("pointermove", e => { if (!drag) return; view.ry += (e.clientX - ox) * 0.01; view.rx = Math.max(-1.4, Math.min(1.4, view.rx + (e.clientY - oy) * 0.01)); ox = e.clientX; oy = e.clientY; });\ncv.addEventListener("pointerup", () => drag = false);\nframe();\n<\/script>\n</body>\n</html>\n';
    dl('athena-3d-scene.html', doc, 'text/html');
    flash('Exported a standalone 3D page.');
  });
  document.getElementById('f3d-snap').addEventListener('click', () => {
    const url = document.getElementById('f3d-canvas').toDataURL('image/png');
    if (url.length > 900000) { flash('Snapshot is large — export the page instead.'); return; }
    snap(); putNodes([n('img', { attrs: { src: url, alt: '3D scene snapshot' } })]); renderAll();
    flash('Inserted a snapshot image in your page.');
  });
  document.getElementById('f3d-json').addEventListener('click', () => {
    navigator.clipboard?.writeText(JSON.stringify(f3dObjects, null, 2)).then(() => flash('Scene JSON copied')).catch(() => flash('Copy was blocked.'));
  });
  document.getElementById('f3d-clear').addEventListener('click', () => {
    if (!f3dObjects.length) return;
    if (!confirm('Clear the whole scene?')) return;
    f3dObjects = []; f3dSel = null; f3dSave(); renderForge3D();
  });
}
