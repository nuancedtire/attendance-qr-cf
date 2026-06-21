const CACHE_NAME = "attendance-qr-v1";
const STATIC_ASSET_EXTS = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/i;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Cache-first for static assets
  if (STATIC_ASSET_EXTS.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchAndCache = fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
        return cached || fetchAndCache;
      })
    );
    return;
  }

  // Network-first for navigation and everything else
  event.respondWith(
    fetch(event.request).catch(() => {
      // For navigation requests, return offline fallback
      if (event.request.mode === "navigate") {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          return new Response(
            `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Attendance QR — Offline</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f3f4f6; color: #1f2937; }
    .card { background: white; border-radius: 0.75rem; padding: 2rem; text-align: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 24rem; margin: 1rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #6b7280; margin-bottom: 1.5rem; }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">📡</div>
    <h1>You're offline</h1>
    <p>Attendance QR needs a network connection to check in or out. Please reconnect and try again.</p>
  </div>
</body>
</html>`,
            { status: 503, headers: { "Content-Type": "text/html" } }
          );
        });
      }
      return new Response("Offline", { status: 503 });
    })
  );
});
