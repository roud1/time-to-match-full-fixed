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
  | { type: "typing"; matchId: string; userId: string; typing: boolean; at: number }
