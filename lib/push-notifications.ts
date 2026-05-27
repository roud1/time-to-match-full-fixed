import type { TranslationKey } from "@/lib/i18n"

const PREFS_KEY = "ttm-push-enabled"

export type PushPayload = {
  title: string
  body: string
  url?: string
  tag?: string
}

export function isPushSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator
}

export function getPushEnabled(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(PREFS_KEY) === "1"
}

export function setPushEnabled(on: boolean) {
  if (typeof window === "undefined") return
  localStorage.setItem(PREFS_KEY, on ? "1" : "0")
}

export async function unregisterAppServiceWorkers(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
  try {
    const regs = await navigator.serviceWorker.getRegistrations()
    await Promise.all(regs.map((r) => r.unregister()))
    if ("caches" in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    }
  } catch {
    /* ignore */
  }
}

export async function registerAppServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null
  if (process.env.NODE_ENV !== "production") return null
  try {
    return await navigator.serviceWorker.register("/service-worker.js", { scope: "/" })
  } catch {
    return null
  }
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return "denied"
  const reg = await registerAppServiceWorker()
  if (!reg) return "denied"
  return Notification.requestPermission()
}

export async function showEmotionalPush(payload: PushPayload): Promise<boolean> {
  if (!getPushEnabled()) return false
  if (typeof window === "undefined" || Notification.permission !== "granted") return false

  try {
    const reg = await navigator.serviceWorker.ready
    await reg.showNotification(payload.title, {
      body: payload.body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      tag: payload.tag ?? "ttm-emotional",
      data: { url: payload.url ?? "/app" },
      vibrate: [80, 40, 80],
    })
    return true
  } catch {
    try {
      new Notification(payload.title, { body: payload.body, icon: "/icon.svg", tag: payload.tag })
      return true
    } catch {
      return false
    }
  }
}

export function showEmotionalPushFromKeys(
  titleKey: TranslationKey,
  bodyKey: TranslationKey,
  t: (k: TranslationKey) => string,
  opts?: { url?: string; tag?: string }
) {
  return showEmotionalPush({
    title: t(titleKey),
    body: t(bodyKey),
    url: opts?.url,
    tag: opts?.tag,
  })
}
