const CACHE_NAME = 'paac-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  // Add other static assets you want to cache
];

// the purpose of the install event listener. Is to provide the initial setup 
// for the service worker. In this case, we are opening a cache and waiting for
// the cache to be opened before adding the urls defined above to the cache 
// using cache.addAll.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// the purpose of the fetch event listener. Is to intercept all fetch requests
// made by the browser and respond with the cached version of the request if
// it exists in the cache. If the request is not in the cache, it will be
// fetched from the network.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

