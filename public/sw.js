const STATIC_CACHE_NAME = "marchelibre-static-v0.5.0";
const STATIC_REQUEST_DESTINATIONS = new Set(["style", "script", "font", "image"]);
const OFFLINE_HTML = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hors ligne</title>
    <style>
      body {
        margin: 0;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        background: #0f172a;
        color: #e2e8f0;
        min-height: 100vh;
        display: grid;
        place-items: center;
      }
      main {
        max-width: 42rem;
        text-align: center;
        padding: 2rem 1.5rem;
      }
      h1 {
        margin: 0 0 0.75rem;
        font-size: 1.25rem;
      }
      p {
        margin: 0;
        line-height: 1.55;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Connexion Internet requise</h1>
      <p>Vous êtes hors ligne. Merci de vous connecter à Internet pour utiliser le chat.</p>
    </main>
  </body>
</html>`;

function shouldHandleStaticRequest(request, url) {
  if (request.method !== "GET") return false;
  if (url.origin !== self.location.origin) return false;
  if (request.mode === "navigate") return false;
  if (!STATIC_REQUEST_DESTINATIONS.has(request.destination)) return false;
  if (url.pathname.startsWith("/api/")) return false;
  return true;
}

function canCacheResponse(response) {
  return response && response.ok && response.type !== "opaque";
}

async function handleNavigationRequest(request) {
  try {
    return await fetch(request);
  } catch {
    return new Response(OFFLINE_HTML, {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    void fetch(request).then((freshResponse) => {
      if (!canCacheResponse(freshResponse)) return;
      void cache.put(request, freshResponse.clone());
    }).catch(() => undefined);
    return cachedResponse;
  }

  const networkResponse = await fetch(request);
  if (canCacheResponse(networkResponse)) {
    void cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

self.addEventListener("install", (event) => {
  event.waitUntil(Promise.resolve());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    const deletions = cacheNames
      .filter((cacheName) => cacheName !== STATIC_CACHE_NAME)
      .map((cacheName) => caches.delete(cacheName));
    await Promise.all(deletions);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.cache === "only-if-cached" && request.mode !== "same-origin") return;
  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  if (!shouldHandleStaticRequest(request, url)) return;
  event.respondWith(handleStaticRequest(request));
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "SKIP_WAITING") return;
  event.waitUntil(self.skipWaiting());
});
