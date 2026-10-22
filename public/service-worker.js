/* Time to Match — service worker (Web Push + offline shell) */

/** Bump when SW logic changes so clients drop stale workers/cache. */
const CACHE = "ttm-shell-v5"
/** Static assets only. Pages are never precached (stale HTML broke Next.js hydration). */
const SHELL = ["/offline.html", "/icons/icon-192.png", "/icon.svg"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL).catch(() => undefined))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("push", (event) => {
  let data = {
    title: "Time to Match",
    body: "У вас новый сигнал о сроке связи.",
    url: "/app",
    tag: "ttm-expiry",
  }
  try {
    if (event.data) {
      const parsed = event.data.json()
      data = { ...data, ...parsed }
    }
  } catch {
    /* ignore */
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-96.png",
      tag: data.tag || "ttm-expiry",
      data: { url: data.url || "/app" },
      vibrate: [80, 40, 80],
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/app"
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client && "navigate" in client) {
          return client.navigate(url).then(() => client.focus())
        }
        if ("focus" in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})

/* Navigation fallback only: the request always goes to the network first and is never cached.
   If (and only if) the network call throws, show the static offline page. No other request
   types are intercepted, so Next.js hydration/RSC/API traffic is untouched. */
self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.mode !== "navigate" || req.method !== "GET") return
  event.respondWith(
    fetch(req).catch(async () => {
      const cached = await caches.match("/offline.html")
      return (
        cached ||
        new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } })
      )
    })
  )
})
