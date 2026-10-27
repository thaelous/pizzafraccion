const CACHE_NAME = 'pizzeria-altair-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './altairojo.png',
  './altairsonrisa.png',
  './altaircerrada.png',
  './pepperoni.png',
  './hawaiana.png',
  './queso.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => caches.match('./index.html'))
      );
    })
  );
});
