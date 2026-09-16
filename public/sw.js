// ─── The service worker ──────────────────────────────────────────────────────
//
// ── WHY THIS NO LONGER CACHES HTML ──────────────────────────────────────────
//
// It used to precache "/" and fall back to it whenever a navigation's `fetch`
// rejected. That is a trap, and it took the site down for individual people
// while it answered 200 for everybody else:
//
//   1. `install` — the only thing that fills PRECACHE — runs when THIS FILE's
//      bytes change, and nothing else. `CACHE_NAME` was a hand-typed literal
//      that went months between bumps, so a returning visitor's cached "/" was
//      the HTML of whatever build was live when they first visited.
//
//   2. `output: "standalone"` means every deploy ships a fresh container. The
//      previous build's `/_next/static/chunks/<hash>.js` files are simply gone,
//      and asking for one returns 404 — verified against production.
//
//   3. So one flaky moment on a navigation — a tunnel, a captive portal, a VPN
//      reconnect — served that ancient HTML, whose <script> tags pointed at
//      chunks that no longer existed. Blank page. No error, nothing in the
//      console worth reading, and a hard refresh does not clear a service
//      worker cache, so it stayed broken.
//
// HTML and the hashed assets it names are one unit. Caching either without the
// other guarantees they drift apart, and the drift is unrecoverable. So: HTML
// is never cached, and the offline fallback below references no external file.
//
// Only `/_next/static/` is cached, and only because those URLs are
// content-hashed — the same URL can never mean different bytes, so a stale hit
// is not stale, it is correct.
//
// ── BUMPING THIS IS THE KILL SWITCH ─────────────────────────────────────────
//
// Changing CACHE_NAME changes this file, which makes every browser holding a
// poisoned cache re-install, and `activate` deletes every cache that is not the
// current one. That is how somebody already stuck gets unstuck without being
// told to open DevTools.
const CACHE_NAME = "gifts-v11";

/** No HTML here. See above — this is the entire point. */
const PRECACHE = ["/manifest.json"];

/** Self-contained: it must not reference a stylesheet, script or image. */
const OFFLINE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fff7f9;
color:#4a3547;font:16px/1.5 ui-rounded,system-ui,-apple-system,sans-serif;text-align:center;padding:24px}
h1{font-size:19px;margin:0 0 8px}p{margin:0;opacity:.7;font-size:14px}</style></head>
<body><div><h1>You're offline</h1><p>Check your connection and try again.</p></div></body></html>`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).catch(() => {})
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
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (!request.url.startsWith("http")) return;

  // Only same-origin. Cross-origin requests (Google OAuth, the CDN, the API)
  // either need credential handling we cannot replicate or must reach the
  // network every time.
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // ── Navigations: network, always ─────────────────────────────────────────
  //
  // The fallback is the inline document above, NOT a cached page. A stale shell
  // looks like the site and is dead; an offline card is honest and recovers on
  // the next reload.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(OFFLINE_HTML, {
            status: 503,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          })
      )
    );
    return;
  }

  // Dynamic data goes straight to the network.
  if (url.pathname.includes("/api/")) return;

  // ── WHY ONLY `/_next/static/` ────────────────────────────────────────────
  //
  // This used to cache anything with a file extension, which swept in route
  // data and any hashless asset — files whose contents change while their URL
  // does not, so a cache hit could be genuinely wrong. Everything under
  // `/_next/static/` carries a content hash in its name, so a hit is always the
  // bytes that URL has always meant.
  if (!url.pathname.startsWith("/_next/static/")) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
          }
          return response;
        })
        .catch(() => new Response("", { status: 503 }));
    })
  );
});
