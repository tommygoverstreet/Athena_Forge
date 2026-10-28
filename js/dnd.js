'use strict';
/* pointer drag in the structure tree: mouse drags at once, touch drags after a
   long-press (so a tap still selects and a swipe still scrolls). Buttons
   remain the precise route. */
let dragId = null, dragActive = false, dragMoved = false, justDragged = false;
let startX = 0, startY = 0, ghost = null, holdTimer = null;
const treeEl = document.querySelector('#tree');
const clearDrop = () => treeEl.querySelectorAll('.drop-before,.drop-after,.drop-in').forEach(x => x.classList.remove('drop-before', 'drop-after', 'drop-in'));
const dropPos = (y, d) => { const r = d.getBoundingClientRect(), f = (y - r.top) / r.height; return f < .28 ? 'before' : f > .72 ? 'after' : 'in'; };
function cleanup() {
  clearDrop(); if (ghost) { ghost.remove(); ghost = null; }
  treeEl.querySelectorAll('.drag-src').forEach(x => x.classList.remove('drag-src'));
  dragId = null; dragActive = false; dragMoved = false;
  if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
}
function activate(node, x, y) {
  dragActive = true;
  node.classList.add('drag-src');
  ghost = document.createElement('div');
  ghost.className = 'drag-ghost';
  ghost.textContent = node.querySelector('b') ? node.querySelector('b').textContent : 'element';
  ghost.style.left = (x + 12) + 'px'; ghost.style.top = (y + 12) + 'px';
  document.body.appendChild(ghost);
  try { navigator.vibrate && navigator.vibrate(10); } catch {}
}
treeEl.addEventListener('pointerdown', e => {
  const d = e.target.closest('.node'); if (!d) return;
  if (e.button !== undefined && e.button !== 0) return;
  dragId = +d.dataset.id; startX = e.clientX; startY = e.clientY; dragMoved = false;
  if (e.pointerType === 'touch') {
    holdTimer = setTimeout(() => { const n = treeEl.querySelector(`[data-id="${dragId}"]`); if (n) activate(n, startX, startY); }, 400);
  }
});
treeEl.addEventListener('pointermove', e => {
  if (dragId == null) return;
  const dx = e.clientX - startX, dy = e.clientY - startY;
  if (!dragActive) {
    if (e.pointerType === 'mouse' && Math.hypot(dx, dy) > 8) {
      const n = treeEl.querySelector(`[data-id="${dragId}"]`); if (n) activate(n, e.clientX, e.clientY);
    } else return;
  }
  dragMoved = true;
  if (ghost) { ghost.style.left = (e.clientX + 12) + 'px'; ghost.style.top = (e.clientY + 12) + 'px'; }
  const under = document.elementFromPoint(e.clientX, e.clientY);
  const d = under && under.closest ? under.closest('.node') : null;
  clearDrop();
  if (d && +d.dataset.id !== dragId) d.classList.add('drop-' + dropPos(e.clientY, d));
});
function finish(e) {
  if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
  if (!dragActive) { dragId = null; return; }
  const under = document.elementFromPoint(e.clientX, e.clientY);
  const d = under && under.closest ? under.closest('.node') : null;
  const id = dragId;
  cleanup();
  if (!d || +d.dataset.id === id) return;
  const pos = dropPos(e.clientY, d), tid = +d.dataset.id;
  const src = find(id);
  if (!src || !find(tid) || find(tid, src.node.children)) return;
  mut(() => {
    src.list.splice(src.i, 1);
    const t = find(tid);
    if (pos === 'in' && !DEFS[t.node.tag].void) t.node.children.push(src.node);
    else t.list.splice(t.i + (pos === 'after' ? 1 : 0), 0, src.node);
    sel = src.node.uid;
  }, true);
  justDragged = true;
}
treeEl.addEventListener('pointerup', finish);
treeEl.addEventListener('pointercancel', cleanup);
treeEl.addEventListener('click', e => {
  if (justDragged) { justDragged = false; e.stopPropagation(); e.preventDefault(); }
}, true);
