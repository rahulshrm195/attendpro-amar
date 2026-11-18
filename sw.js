// ══════════════════════════════════════════
// AttendPro Service Worker
// Version: 1.2.3
// ══════════════════════════════════════════

const CACHE_NAME = 'attendpro-v1.2.5';   // bump on each release (with APP_VERSION in index.html)
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-maskable-192x192.png',
  '/icon-maskable-512x512.png',
  '/apple-touch-icon.png'
];

// Install — cache core assets. 'reload' skips the browser's HTTP cache, so a new version never
// stores a stale copy of itself.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(PRECACHE_ASSETS.map(u =>
        cache.add(new Request(u, { cache: 'reload' })).catch(err => console.log('SW: could not cache', u, err)))))
      .then(() => self.skipWaiting())
  );
});

// Activate — clear old caches and take over open pages
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch — network first, cache fallback (offline)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  // Firebase / Google APIs: always straight to the network
  const url = event.request.url;
  if (url.includes('firebase') || url.includes('googleapis') || url.includes('gstatic') || url.includes('firestore')) return;

  // Our own files: always ask the server (GitHub Pages lets browsers reuse a copy for 10 minutes,
  // which is why updates looked stuck)
  const own = new URL(url).origin === self.location.origin;
  event.respondWith(
    fetch(event.request, own ? { cache: 'no-store' } : undefined)
      .then(response => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => {
        if (cached) return cached;
        if (event.request.destination === 'document') return caches.match(OFFLINE_URL);
      }))
  );
});

// Push Notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'AttendPro', {
      body: data.body || '',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' }
    })
  );
});

// Notification click — focus the open app (or open it) on the right page
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(self.location.origin)) { client.focus(); return client.navigate(target); }
      }
      return clients.openWindow(target);
    })
  );
});
