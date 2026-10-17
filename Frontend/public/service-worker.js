// Service Worker for KaamSetu PWA

const CACHE_NAME = 'kaamsetu-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  
  // Vite generated assets (using glob patterns to match hashed filenames)
  '/assets/index-*.js',
  '/assets/index-*.css',
  '/assets/logo-*.png',
  
  // Icons
  '/icons/icon-72x72.webp',
  '/icons/icon-96x96.webp',
  '/icons/icon-128x128.webp',
  '/icons/icon-144x144.webp',
  '/icons/icon-152x152.webp',
  '/icons/icon-192x192.webp',
  '/icons/icon-384x384.webp',
  '/icons/icon-512x512.webp',
  '/icons/logo.webp',
  
  // Screenshots for PWA installation
  '/screenshots/screenshot1.webp',
  '/screenshots/screenshot2.webp',
  
  // Fonts (if any)
  // '/fonts/*.woff2',
  
  // Other static assets
  // '/favicon.ico',
  // '/offline.html' // Uncomment when you create this file
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  // Activate the new service worker immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheAllowlist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  event.waitUntil(clients.claim());
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests, like those to API endpoints
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For navigation requests, try the network first, fall back to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If we got a valid response, cache it
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match('/offline.html')
            .then((response) => {
              return response || caches.match('/');
            });
        })
    );
    return;
  }

  // For static assets, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Push notification event (placeholder for future implementation)
self.addEventListener('push', (event) => {
  // TODO: Implement push notification handling
  console.log('Push notification received:', event);
  
  // Example of showing a basic notification
  const title = 'KaamSetu';
  const options = {
    body: 'You have new updates!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Handle notification click
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Handle background sync (for future use)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    // TODO: Implement background sync
    console.log('Background sync triggered');
  }
});