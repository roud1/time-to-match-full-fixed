/* Time to Match — service worker (Web Push + offline shell) */

/** Bump when SW logic changes so clients drop stale workers/cache. */
const CACHE = "ttm-shell-v4"
const SHELL = ["/", "/app", "/icon.svg"]

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
      icon: "/icon.svg",
      badge: "/icon.svg",
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

/* No global fetch handler — intercepting navigations broke Next.js hydration (white screen).
   Push + install-time shell cache only. */
