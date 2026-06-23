/**
 * Unified realtime broadcast — Pusher (primary WS) or Ably REST publish.
 * No-op when no managed provider is configured (clients fall back to polling).
 */

import Pusher from "pusher"
import {
  REALTIME_EVENTS,
  matchChannelName,
  type RealtimeEventName,
} from "@/server/realtime/channels"
import { getRealtimeProvider } from "@/server/realtime/provider"

export type RealtimeBroadcastPayload = {
  userId: string
  at: number
  typing?: boolean
  online?: boolean
}

let pusherServer: Pusher | null = null

function getPusherServer(): Pusher | null {
  const appId = process.env.PUSHER_APP_ID
  const key = process.env.PUSHER_KEY
  const secret = process.env.PUSHER_SECRET
  const cluster = process.env.PUSHER_CLUSTER ?? "eu"
  if (!appId || !key || !secret) return null
  if (!pusherServer) {
    pusherServer = new Pusher({ appId, key, secret, cluster, useTLS: true })
  }
  return pusherServer
}

async function publishAbly(
  channel: string,
  event: RealtimeEventName,
  data: RealtimeBroadcastPayload
): Promise<void> {
  const key = process.env.ABLY_API_KEY?.trim()
  if (!key) return
  const body = JSON.stringify({ name: event, data })
  await fetch(`https://rest.ably.io/channels/${encodeURIComponent(channel)}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(key).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body,
  }).catch(() => undefined)
}

/** Best-effort fan-out — failures are ignored (polling remains authoritative). */
export async function broadcastToMatch(
  matchId: string,
  event: RealtimeEventName,
  data: Omit<RealtimeBroadcastPayload, "at"> & { at?: number }
): Promise<void> {
  const provider = getRealtimeProvider()
  const channel = matchChannelName(matchId, provider)
  if (!channel) return

  const payload: RealtimeBroadcastPayload = { ...data, at: data.at ?? Date.now() }

  if (provider === "pusher") {
    const pusher = getPusherServer()
    if (!pusher) return
    await pusher.trigger(channel, event, payload).catch(() => undefined)
    return
  }

  if (provider === "ably") {
    await publishAbly(channel, event, payload)
  }
}

export async function publishTypingEvent(event: {
  matchId: string
  userId: string
  typing: boolean
}): Promise<void> {
  await broadcastToMatch(event.matchId, REALTIME_EVENTS.typing, {
    userId: event.userId,
    typing: event.typing,
  })
}

export async function publishPresenceEvent(event: {
  matchId: string
  userId: string
  online: boolean
}): Promise<void> {
  await broadcastToMatch(event.matchId, REALTIME_EVENTS.presence, {
    userId: event.userId,
    online: event.online,
  })
}

export async function publishMessageEvent(event: {
  matchId: string
  userId: string
}): Promise<void> {
  await broadcastToMatch(event.matchId, REALTIME_EVENTS.message, {
    userId: event.userId,
  })
}
