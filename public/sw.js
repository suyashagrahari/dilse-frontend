const CACHE_NAME = "gifts-v7";
const PRECACHE = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (!request.url.startsWith("http")) return;

  // Only cache same-origin requests.
  // Cross-origin requests (Google OAuth, CDNs, ngrok API) must NOT be intercepted —
  // they either require credentials/CORS handling we can't replicate, or must reach
  // the network directly every time.
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Always use network for document navigations to avoid stale HTML/hydration drift.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/").then((cached) => cached || new Response("Offline", { status: 503 })))
    );
    return;
  }

  // Pass API calls through to the network — never cache dynamic data.
  if (request.url.includes("/api/")) return;

  // Cache only static assets; dynamic route/data requests should stay network-first.
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    /\.[a-z0-9]+$/i.test(url.pathname);
  if (!isStaticAsset) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || new Response("Offline", { status: 503 })))
  );
});
