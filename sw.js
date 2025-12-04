// sw.js
const CACHE_NAME = 'praisefm-au-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/image/praisefm-192.png',
  '/image/praisefm-512.png',
  '/image/praisefmaustralialogo.webp',
  '/image/logopraisefmnonstop.png',
  '/image/praisefmcarpoollogo.webp',
  '/image/midnightgracelogo.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('Cache failed for some assets:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Não interferir em streaming ou metadados
  if (
    event.request.destination === 'audio' ||
    event.request.url.includes('zeno.fm') ||
    event.request.url.includes('/mounts/metadata/') ||
    event.request.url.includes('ipapi.co')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Fallback para index.html (útil se usar SPA)
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      });
    })
  );
});
