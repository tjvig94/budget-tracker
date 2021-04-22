const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/assets/css/styles.css',
    '/assets/js/index.js',
    '/manifest.webmanifest',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png'
]

const STATIC_CACHE = "static-cache-v2";
const DATA_CACHE = "data-cache-v1";

// Install
self.addEventListener('install', evt => {
    evt.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then(cache => {
                return cache.addAll(FILES_TO_CACHE)
            }),
            caches.open(DATA_CACHE).then(cache => {
                cache.add('/api/transaction')
            })
        ])
    );
    self.skipWaiting();
});

self.addEventListener('activate', evt => {
    const allowedCaches = [STATIC_CACHE, DATA_CACHE];
    evt.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!allowedCaches.includes(cacheName)) {
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    );
});

self.addEventListener('fetch', evt => {
    if (
        evt.request.method === "GET" &&
        evt.request.url.includes("/api/transaction")
      ) {
        evt.respondWith(
          caches.open(DATA_CACHE).then(cache => {
            return fetch(evt.request)
              .then(response => {
                if (response.status === 200) {
                  cache.put(evt.request, response.clone());
                  return response;
                }
              })
              .catch(err => {
                return cache.match(evt.request).then(response => {
                  return response;
                });
              });
          })
        );   
        return;
      }   
      evt.respondWith(
        caches.open(STATIC_CACHE).then(cache => {
          return cache.match(evt.request).then(response => {
            return response || fetch(evt.request);
          });
        })
      );
});
