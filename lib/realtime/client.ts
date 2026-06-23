"use client"

/**
 * Browser realtime client — Pusher when `NEXT_PUBLIC_PUSHER_KEY` is set, else polling only.
 */

import Pusher, { type Channel } from "pusher-js"
import type { RealtimeClientKind } from "@/lib/realtime/types"

let pusherClient: Pusher | null = null

export function getClientRealtimeKind(): RealtimeClientKind {
  if (process.env.NEXT_PUBLIC_PUSHER_KEY?.trim()) return "pusher"
  if (process.env.NEXT_PUBLIC_ABLY_KEY?.trim()) return "ably"
  return "polling"
}

export function isRealtimeWebSocketConfigured(): boolean {
  return getClientRealtimeKind() !== "polling"
}

export function getPusherClient(): Pusher | null {
  if (getClientRealtimeKind() !== "pusher") return null
  if (pusherClient) return pusherClient

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY!.trim()
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER?.trim() || "eu"

  pusherClient = new Pusher(key, {
    cluster,
    channelAuthorization: {
      endpoint: "/api/realtime/auth",
      transport: "ajax",
    },
  })

  return pusherClient
}

export function subscribeMatchChannel(matchId: string): Channel | null {
  const pusher = getPusherClient()
  if (!pusher || !matchId || matchId.startsWith("local:")) return null
  return pusher.subscribe(`private-match-${matchId}`)
}

export function unsubscribeMatchChannel(matchId: string): void {
  const pusher = getPusherClient()
  if (!pusher || !matchId) return
  pusher.unsubscribe(`private-match-${matchId}`)
}

export function getPusherConnectionState(): "connected" | "connecting" | "disconnected" {
  const pusher = getPusherClient()
  if (!pusher) return "disconnected"
  const state = pusher.connection.state
  if (state === "connected") return "connected"
  if (state === "connecting" || state === "unavailable") return "connecting"
  return "disconnected"
}
