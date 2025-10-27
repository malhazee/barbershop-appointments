const CACHE_NAME = 'barbershop-v1';
const urlsToCache = [
  '/',
  '/client.html',
  '/admin.html',
  '/style.css',
  '/script-client.js',
  '/script-admin.js',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192-admin.png',
  '/icon-512-admin.png'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// تنشيط Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// استرجاع الملفات من الكاش
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إرجاع من الكاش أو جلب من الشبكة
        return response || fetch(event.request);
      })
  );
});
