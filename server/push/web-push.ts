import webpush from "web-push"
import type { PushSubscriptionJson, WebPushPayload } from "@/server/push/types"
import { log } from "@/server/log"

let configured = false

function ensureVapid(): boolean {
  if (configured) return true
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT ?? "mailto:support@timetomatch.app"
  if (!publicKey || !privateKey) return false
  webpush.setVapidDetails(subject, publicKey, privateKey)
  configured = true
  return true
}

export function isWebPushConfigured(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null
}

export async function sendWebPush(
  subscription: PushSubscriptionJson,
  payload: WebPushPayload
): Promise<boolean> {
  if (!ensureVapid()) {
    log.warn("web_push_skip_no_vapid")
    return false
  }

  try {
    await webpush.sendNotification(
      subscription as Parameters<typeof webpush.sendNotification>[0],
      JSON.stringify(payload)
    )
    return true
  } catch (e) {
    log.warn("web_push_send_err", {
      err: e instanceof Error ? e.message : String(e),
      endpoint: subscription.endpoint.slice(0, 48),
    })
    return false
  }
}
