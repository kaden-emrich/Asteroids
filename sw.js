const cacheName = 'asteroids-by-kaden';
const assets = [
    '/', 
    '/index.html', 
    '/style.css', 
    '/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(assets))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return the cached version if we have it
      if (cachedResponse) return cachedResponse;

      // Otherwise, fetch from network AND save to cache for next time
      return fetch(event.request).then((networkResponse) => {
        return caches.open('dynamic-cache').then((cache) => {
          cache.put(event.request, networkResponse.clone()); // Automatic save
          return networkResponse;
        });
      });
    })
  );
});