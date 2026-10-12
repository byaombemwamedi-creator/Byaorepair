/* BYAO PWA service worker. Bump VERSION on every release so phones fetch the new files. */
const VERSION='byao-v3';
const FILES=["./", "admin.html", "admin.js", "assistant.html", "auth.js", "byao-access.js", "byao-debug.js", "fundi.html", "fundi2.html", "index.html", "language.js", "languages.js", "login.html", "manifest.json", "mfanyabiashara.html", "mteja.html", "mteja2.html", "notification.js", "notifications.js", "profile.js", "register.html", "register.js", "repair.js", "reset-password.html", "supabase.js"];
const CDN=['cdn.tailwindcss.com','cdn.jsdelivr.net','unpkg.com','cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>Promise.allSettled(FILES.map(f=>c.add(f)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  if(u.hostname.endsWith('supabase.co'))return;                 // data & login: always live, never cached
  if(u.origin===location.origin){                               // app files: network first, cache when offline
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):undefined))));
    return;}
  if(CDN.includes(u.hostname)){                                 // libraries: cache first, refresh in background
    e.respondWith(caches.match(r).then(m=>{const net=fetch(r).then(res=>{const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp));return res}).catch(()=>m);return m||net}));}
});

