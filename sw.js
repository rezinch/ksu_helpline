// sw.js

const CACHE_NAME = 'ksu-cucek-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/helpdesk.js',
  '/manifest.json',
  '/icon/icon-192x192.png',
  '/icon/icon-512x512.png'
];

// Install the service worker and cache the app's shell files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching files');
        return cache.addAll(urlsToCache);
      })
  );
});

// Serve cached content when offline, and fetch from network otherwise
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If the file is in the cache, return it
        if (response) {
          return response;
        }
        // Otherwise, fetch it from the network
        return fetch(event.request);
      })
  );
});