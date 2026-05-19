const CACHE = 'ethiocode-v1';
const STATIC = [
  '/', '/index.html', '/manifest.json',
  '/src/index.css', '/src/main.jsx',
];

// Install: cache static shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for API, cache-first for assets
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // API: network-first, no cache
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/ws')) return;

  // Assets: cache-first
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(res => {
        if (res.ok && res.status === 200) {
          const resClone = res.clone();
          caches.open(CACHE).then(c => c.put(request, resClone));
        }
        return res;
      });
    })
  );
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data?.json() ?? { title: 'EthioCode', body: 'You have a new notification' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: data.url ?? '/',
      vibrate: [100, 50, 100],
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data));
});
