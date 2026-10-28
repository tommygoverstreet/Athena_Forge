'use strict';
/* init */
setView('prev');renderAll();
try{if(!storeGet('seen')){storeSet('seen','1');showWelcome()}}catch{}
/* PWA: register only when served over http(s); file:// has no service worker */
if('serviceWorker' in navigator && /^https?:/.test(location.protocol)){navigator.serviceWorker.register('sw.js').catch(()=>{})}
