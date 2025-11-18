const APP_CACHE = 'app-shell-v1.1';
const DATA_CACHE = 'data-cache-v1';
const APP_SHELL = ['index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (![APP_CACHE, DATA_CACHE].includes(key)) {
            return caches.delete(key);
          }
          return undefined;
        })
      )
    )
  );
  self.clients.claim();
});

// Cache strategy:
// - For API data: stale-while-revalidate
// - For others: network-first fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  const isApiData = url.origin === 'https://story-api.dicoding.dev' && url.pathname.startsWith('/v1');

  if (isApiData) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(DATA_CACHE);
          cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        const cached = await caches.match(request);
        if (cached) {
          return cached;
        }
        throw error;
      }
    })());
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Web Push handler
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = {};
  }

  // Default payload (per schema in docs)
  const title = data.title || 'Story berhasil dibuat';
  const body = data.options?.body || 'Anda telah membuat story baru.';
  const icon = data.icon || '/public/images/logo.png';
  // If storyId provided, navigate to detail
  const detailUrl = data.storyId ? `/#/detail/${data.storyId}` : null;
  const urlToOpen = data.url || detailUrl || '/#/'; // can be replaced with detail page if provided

  const options = {
    body,
    icon,
    badge: icon,
    data: {
      url: urlToOpen,
      storyId: data.storyId
    },
    actions: [
      { action: 'open', title: 'Buka' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/#/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});


