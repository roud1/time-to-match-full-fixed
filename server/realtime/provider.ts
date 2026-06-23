/**
 * Optional managed realtime (Ably / Pusher). No-op when env is unset.
 * Polling via /api/realtime/* remains the default fallback.
 */

export type RealtimeProviderKind = "polling" | "ably" | "pusher"

export function getRealtimeProvider(): RealtimeProviderKind {
  if (
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_KEY &&
    process.env.PUSHER_SECRET
  ) {
    return "pusher"
  }
  if (process.env.ABLY_API_KEY?.trim()) return "ably"
  return "polling"
}

export function isManagedRealtimeConfigured(): boolean {
  return getRealtimeProvider() !== "polling"
}

export {
  broadcastToMatch,
  publishTypingEvent,
  publishPresenceEvent,
  publishMessageEvent,
} from "@/server/realtime/broadcast"
