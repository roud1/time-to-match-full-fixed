/**
 * Realtime layer — Phase 3
 *
 * **Default:** HTTP polling via `/api/realtime/state` and `/api/realtime/pulse`.
 * Ephemeral state in Upstash Redis when `UPSTASH_REDIS_REST_*` is set, else in-memory per instance.
 *
 * **Optional managed providers** (publish only; clients still poll unless you add WS client):
 * - `ABLY_API_KEY` — Ably REST publish to `match:{matchId}`
 * - `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER` — Pusher trigger
 *
 * Authoritative chat remains PostgreSQL (`match_messages`). Reconcile delivery with DB + idempotent IDs.
 */

export type { ConnectionRealtimeFrame, PresenceRealtimeFrame } from "@/lib/server/realtime/types"

export {
  isRealtimeRedisConfigured,
  setUserTyping,
  clearUserTyping,
  isUserTyping,
  heartbeatPresence,
  isUserOnline,
  getOnlineMap,
} from "@/lib/server/realtime/ephemeral"

export {
  getRealtimeProvider,
  isManagedRealtimeConfigured,
  publishTypingEvent,
} from "@/lib/server/realtime/provider"

export const REALTIME_ARCHITECTURE_NOTES = true as const
