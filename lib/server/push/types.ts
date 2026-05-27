/** Web Push subscription JSON (Push API / stored in users.push_subscription). */
export type PushSubscriptionKeys = {
  p256dh: string
  auth: string
}

export type PushSubscriptionJson = {
  endpoint: string
  expirationTime?: number | null
  keys: PushSubscriptionKeys
}

export type WebPushPayload = {
  title: string
  body: string
  url: string
  tag?: string
}
