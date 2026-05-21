/**
 * Realtime layer for Time to Match is **not** embedded in this Next.js process.
 *
 * Recommended production patterns:
 * - **Managed:** Supabase Realtime, Ably, Pusher, or Liveblocks for presence/typing.
 * - **Self-hosted:** a small Node **Socket.IO** or **ws** service behind Redis adapter for horizontal scale.
 * - **Web + scale:** separate **API Gateway** (e.g. Kong) terminating WS and routing to message workers.
 *
 * Store authoritative message state in PostgreSQL (`messages` table); use Redis/pub-sub only for ephemeral
 * typing indicators and connection fan-out. Always reconcile delivery with DB writes + idempotent message IDs.
 */

/** Phase 18 — presence channel (client: `lib/presence/realtime-presence.ts`). */
export type PresenceRealtimeFrame = {
  type: "presence_update"
  profileId: number
  kind: string
  proximity?: number
  shared?: boolean
  at: number
}

export type ConnectionRealtimeFrame =
  | PresenceRealtimeFrame
  | { type: "message"; connectionId: string; at: number }
  | { type: "sync_surge"; profileId: number; at: number }

export const REALTIME_ARCHITECTURE_NOTES = true as const
