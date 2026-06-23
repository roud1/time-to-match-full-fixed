export type RealtimeClientKind = "pusher" | "ably" | "polling"

export type MatchRealtimePayload = {
  userId: string
  at: number
  typing?: boolean
  online?: boolean
}

export const REALTIME_EVENTS = {
  typing: "typing",
  presence: "presence",
  message: "message",
} as const

export type RealtimeEventName = (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS]

export const PUSHER_MATCH_PREFIX = "private-match-"

export function matchChannelForClient(matchId: string): string {
  return `${PUSHER_MATCH_PREFIX}${matchId}`
}
