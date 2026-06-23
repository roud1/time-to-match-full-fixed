/**
 * Realtime layer — Phase 3
 *
 * **Default:** HTTP polling via `/api/realtime/state` and `/api/realtime/pulse`.
 * Ephemeral state in Upstash Redis when `UPSTASH_REDIS_REST_*` is set, else in-memory per instance.
 *
 * **Optional WebSocket** (Pusher primary; Ably REST publish fallback):
 * - Server: `PUSHER_*` or `ABLY_API_KEY`
 * - Client: `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`
 * - Private channel auth: `POST /api/realtime/auth`
 *
 * Authoritative chat remains PostgreSQL (`match_messages`). Reconcile delivery with DB + idempotent IDs.
 */

export type { ConnectionRealtimeFrame, PresenceRealtimeFrame } from "@/server/realtime/types"

export {
  isRealtimeRedisConfigured,
  setUserTyping,
  clearUserTyping,
  isUserTyping,
  heartbeatPresence,
  isUserOnline,
  getOnlineMap,
} from "@/server/realtime/ephemeral"

export {
  getRealtimeProvider,
  isManagedRealtimeConfigured,
  publishTypingEvent,
  publishPresenceEvent,
  publishMessageEvent,
  broadcastToMatch,
} from "@/server/realtime/provider"

export const REALTIME_ARCHITECTURE_NOTES = true as const
