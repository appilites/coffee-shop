const CACHE_NAME = "druids-nutrition-v2"
const CORE_ASSETS = ["/manifest.webmanifest", "/logo.png"]
const STATIC_DESTINATIONS = new Set(["style", "script", "image", "font"])

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  // Network-first for navigation requests.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request))
    return
  }

  const url = new URL(request.url)
  const isSameOrigin = url.origin === self.location.origin
  const isStaticAsset = STATIC_DESTINATIONS.has(request.destination) || url.pathname.startsWith("/_next/static/")
  if (!isSameOrigin || !isStaticAsset) {
    return
  }

  // Cache-first for static assets.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        const cloned = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned))
        return response
      })
    }),
  )
})

