/**
 * Optional managed realtime (Ably / Pusher). No-op when env is unset.
 * Polling via /api/realtime/* remains the default fallback.
 */

export type RealtimeProviderKind = "polling" | "ably" | "pusher"

export function getRealtimeProvider(): RealtimeProviderKind {
  if (process.env.ABLY_API_KEY?.trim()) return "ably"
  if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET) return "pusher"
  return "polling"
}

export function isManagedRealtimeConfigured(): boolean {
  return getRealtimeProvider() !== "polling"
}

type TypingEvent = {
  matchId: string
  userId: string
  typing: boolean
}

/** Best-effort publish — failures are ignored (polling still works). */
export async function publishTypingEvent(event: TypingEvent): Promise<void> {
  const provider = getRealtimeProvider()

  if (provider === "ably") {
    const key = process.env.ABLY_API_KEY?.trim()
    if (!key) return
    const channel = `match:${event.matchId}`
    const body = JSON.stringify({
      name: "typing",
      data: { userId: event.userId, typing: event.typing },
    })
    await fetch(`https://rest.ably.io/channels/${encodeURIComponent(channel)}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(key).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body,
    }).catch(() => undefined)
    return
  }

  if (provider === "pusher") {
    const appId = process.env.PUSHER_APP_ID
    const key = process.env.PUSHER_KEY
    const secret = process.env.PUSHER_SECRET
    const cluster = process.env.PUSHER_CLUSTER ?? "eu"
    if (!appId || !key || !secret) return

    const channel = `private-match-${event.matchId}`
    const eventName = "client-typing"
    const body = JSON.stringify({
      name: eventName,
      channel,
      data: JSON.stringify({ userId: event.userId, typing: event.typing }),
    })

    const crypto = await import("crypto")
    const path = `/apps/${appId}/events`
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const query = `auth_key=${key}&auth_timestamp=${timestamp}&auth_version=1.0`
    const signature = crypto
      .createHmac("sha256", secret)
      .update(`POST:${path}?${query}:${body}`)
      .digest("hex")
    const qs = `${query}&body_md5=${crypto.createHash("md5").update(body).digest("hex")}&auth_signature=${signature}`

    await fetch(`https://api-${cluster}.pusher.com${path}?${qs}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }).catch(() => undefined)
  }
}
