const CACHE_NAME = "auralearn-pwa-v1";
const OFFLINE_URLS = [
  "/",
  "/index.html",
  "/favicon.svg",
  "/manifest.json",
];

// Service Worker Install: Pre-cache static shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[AuraLearn SW] Pre-caching offline shell assets");
      return cache.addAll(OFFLINE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// Service Worker Activate: Clean up previous cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("[AuraLearn SW] Deleting obsolete cache:", name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Service Worker Fetch: Network-first for dynamic API routes, Cache-first / Stale-While-Revalidate for static assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Exclude non-GET and API calls from cache interception to ensure fresh AI inference
  if (event.request.method !== "GET" || url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and requesting navigation, serve offline fallback shell
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
