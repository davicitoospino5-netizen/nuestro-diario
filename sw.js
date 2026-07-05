const CACHE_NAME = 'diario-cache-auto-v4';
const assets = ['/', '/index.html', '/manifest.json', '/poemas.txt'];

// Instalar el Service Worker y guardar los archivos básicos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(assets);
        }).then(() => self.skipWaiting()) // Fuerza a que se active de inmediato sin esperar
    );
});

// Activar y borrar CUALQUIER caché viejo automáticamente de la memoria
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Toma el control de la página inmediatamente
    );
});

// ESTRATEGIA: NETWORK FIRST (Ir a internet primero, si falla, usar caché)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // Si la petición a internet funciona, guardamos una copia fresca en el caché
                if (networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // Si no hay internet (offline), se activa el escudo del caché automáticamente
                return caches.match(event.request);
            })
    );
});