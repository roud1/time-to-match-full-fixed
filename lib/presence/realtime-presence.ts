/**
 * Client realtime presence bus (Phase 18).
 * Production: bridge WebSocket frames from `lib/server/realtime.ts` into these events.
 */

export const PRESENCE_REALTIME_EVENT = "ttm-presence-updated" as const

export type PresenceRealtimeDetail = {
  profileId?: number
  at: number
  source?: "social" | "connection" | "websocket" | "clock"
}

export function broadcastPresenceUpdate(detail?: Omit<PresenceRealtimeDetail, "at">) {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent<PresenceRealtimeDetail>(PRESENCE_REALTIME_EVENT, {
      detail: { at: Date.now(), ...detail },
    })
  )
}

/** Smooth CSS transition duration from proximity delta (ms). */
export function presenceTransitionMs(prevProximity: number, nextProximity: number): number {
  const delta = Math.abs(nextProximity - prevProximity)
  return Math.round(600 + Math.min(1, delta) * 900)
}
