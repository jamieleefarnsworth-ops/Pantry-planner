const CACHE_NAME = 'pantry-planner-shell-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    try {
      const fresh = await fetch(event.request, { cache: 'no-store' });
      const cache = await caches.open(CACHE_NAME);
      if (fresh && fresh.ok) cache.put(event.request, fresh.clone());
      return fresh;
    } catch (err) {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      throw err;
    }
  })());
});
