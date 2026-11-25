import type { PushSubscriptionJson } from "@/server/push/types"

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export function subscriptionToJson(sub: PushSubscription): PushSubscriptionJson {
  const json = sub.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("Invalid push subscription")
  }
  return {
    endpoint: json.endpoint,
    expirationTime: json.expirationTime ?? null,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  }
}

export async function postPushSubscription(subscription: PushSubscriptionJson): Promise<boolean> {
  try {
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...subscription, locale: currentUiLocale() }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function sendTestPush(): Promise<boolean> {
  try {
    const res = await fetch("/api/push/test", { method: "POST", credentials: "include" })
    return res.ok
  } catch {
    return false
  }
}

/** The app language (saved by the i18n provider), so push texts match the UI. */
export function currentUiLocale(): string | undefined {
  try {
    return localStorage.getItem("locale") ?? document.documentElement.lang ?? undefined
  } catch {
    return undefined
  }
}

let vapidKeyPromise: Promise<string | null> | null = null

/** Public VAPID key: build-time variable if present, otherwise from the server at runtime. */
export function getVapidPublicKeyClient(): Promise<string | null> {
  const built = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (built) return Promise.resolve(built)
  if (!vapidKeyPromise) {
    vapidKeyPromise = fetch("/api/push/config", { credentials: "include" })
      .then((r) => (r.ok ? (r.json() as Promise<{ vapidPublicKey: string | null }>) : null))
      .then((d) => d?.vapidPublicKey || null)
      .catch(() => null)
    void vapidKeyPromise.then((k) => {
      if (!k) vapidKeyPromise = null // retry later (e.g. after sign-in)
    })
  }
  return vapidKeyPromise
}
