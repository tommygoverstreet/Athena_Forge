/* Athena Forge service worker: cache the app shell so the tool opens offline
   when served over http(s) (GitHub Pages, for example). It never runs from
   file:// — the app still works there, just without install/offline. */
const CACHE = 'athena-forge-v1';
const SHELL = [
  './', './index.html', './manifest.json', './icon.svg', './icon-192.png', './icon-512.png',
  './css/athena.css',
  './js/definitions.js', './js/state.js', './js/generator.js', './js/validator.js',
  './js/renderer.js', './js/builder.js', './js/events.js', './js/css-builder.js',
  './js/component-builder.js', './js/docs.js', './js/ui.js', './js/json-builder.js',
  './js/js-builder.js', './js/templates.js', './js/importer.js', './js/editor.js',
  './js/a11y.js', './js/dnd.js', './js/definitions-io.js', './js/canvas-studio.js',
  './js/forge3d.js', './js/app.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return res;
  }).catch(() => caches.match('./index.html'))));
});
