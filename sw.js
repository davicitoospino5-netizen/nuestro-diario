const CACHE_NAME = 'diario-cache-v1';
const assets = ['./', './index.html', './manifest.json'];

// Instalar el Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(assets);
        })
    );
});

// Activar el Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

// Responder con caché si no hay internet
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});