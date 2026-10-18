/* ASG-SARL – service worker
   - Pages : réseau d'abord (le contenu est rendu par le serveur), copie de secours hors ligne
   - /api/ et /admin : jamais mis en cache (données et accès protégés)
   - Fichiers statiques (css, js, images) : cache avec rafraîchissement en arrière-plan
   Changer VERSION à chaque évolution de ce fichier. */
const VERSION = 'asg-v5';
const STATIC = VERSION + '-static';
const PAGES = VERSION + '-pages';
const OFFLINE = '/hors-ligne.htm';
const PRECACHE = [OFFLINE, '/style.css', '/images/icon-192.png', '/images/logo-blanc.png', '/images/emblem-or.png', '/images/emblem-blanc.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const p = url.pathname;
  if (p.startsWith('/api/') || p === '/api' || p === '/sw.js') return;

  const isAdmin = /^\/admin(\/|\.|$)/.test(p);

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && !isAdmin) { const copy = res.clone(); caches.open(PAGES).then((c) => c.put(req, copy)); }
          return res;
        })
        .catch(() => (isAdmin ? Promise.resolve(null) : caches.match(req)).then((r) => r || caches.match(OFFLINE)))
    );
    return;
  }

  if (isAdmin) return; // admin.js, admin.html : toujours depuis le réseau

  e.respondWith(
    caches.open(STATIC).then((cache) =>
      cache.match(req).then((hit) => {
        const net = fetch(req)
          .then((res) => { if (res.ok) cache.put(req, res.clone()); return res; })
          .catch(() => hit);
        return hit || net;
      })
    )
  );
});

/* Notifications push */
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'ASG-SARL', {
    body: d.body || '', icon: '/images/icon-192.png', badge: '/images/icon-192.png',
    tag: d.tag || 'asg', lang: 'fr', data: { url: d.url || '/' }
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || '/', self.location.origin).href;
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const c = list.find((w) => !/^\/admin/.test(new URL(w.url).pathname) && 'focus' in w);
      if (c) return ('navigate' in c ? c.navigate(target) : Promise.resolve(c)).then((w) => (w || c).focus());
      return self.clients.openWindow(target);
    })
  );
});
