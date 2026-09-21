// Compass service worker: offline shell for the practice loop.
//
// Strategy:
// - Navigations: network-first, cached shell fallback, so a fresh deploy wins.
// - Next.js build output (/_next/): network-first with a cache fallback. These
//   filenames are not versioned in dev, so cache-first would pin users to a
//   stale bundle and they would never receive updates.
// - Other static assets (icons, manifest): cache-first for fast repeat loads.

const CACHE = "compass-v2";
const CORE = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch from the network and refresh the cache, falling back to the cache when
// offline. Used for anything that can change without a version in its URL.
function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      if (response.ok && response.type === "basic") {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(() =>
      caches.match(request).then((cached) => cached || caches.match("/"))
    );
}

// Serve from the cache when present, refreshing it in the background.
function cacheFirst(request) {
  return caches.match(request).then((cached) => {
    const network = fetch(request)
      .then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => cached);
    return cached || network;
  });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Build output must never be served stale while online.
  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
