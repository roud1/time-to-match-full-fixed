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

export async function registerAppServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" })
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
