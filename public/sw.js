/* Time to Match — PWA service worker (emotional push + offline shell) */

const CACHE = "ttm-shell-v1"
const SHELL = ["/", "/app", "/icon.svg"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL).catch(() => undefined)).then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("push", (event) => {
  let data = { title: "Time to Match", body: "Your connection shifted.", url: "/app" }
  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch {
    /* ignore */
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: { url: data.url },
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/app"
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith("/api/")) return

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok && url.pathname === "/") {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(event.request, copy))
        }
        return res
      })
      .catch(() => caches.match(event.request).then((r) => r || caches.match("/")))
  )
})
