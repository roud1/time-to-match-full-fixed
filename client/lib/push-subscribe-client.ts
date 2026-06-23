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
      body: JSON.stringify(subscription),
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
