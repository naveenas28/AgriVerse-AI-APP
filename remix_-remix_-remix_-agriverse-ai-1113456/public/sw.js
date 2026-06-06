const CACHE_NAME = 'agriverse-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;505;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
  'https://img.icons8.com/color/192/000000/agriculture.png',
  'https://img.icons8.com/color/512/000000/agriculture.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Do not intercept Firestore realtime syncs or backend api routes with sw caching directly
  if (event.request.url.includes('/api/') || event.request.url.includes('firestore.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached, and asynchronously update the cache in the background
        fetch(event.request).then((onlineResponse) => {
          if (onlineResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, onlineResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {
        // If everything fails and it's navigation, return root index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

// Real-time Push Notification handler inside Service Worker
self.addEventListener('push', (event) => {
  let data = { title: 'AgriVerse Alert', body: 'New agro-ecological event detected!' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data = { title: 'AgriVerse AI Update', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: 'https://img.icons8.com/color/192/000000/agriculture.png',
    badge: 'https://img.icons8.com/color/192/000000/agriculture.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || '/');
      }
    })
  );
});
