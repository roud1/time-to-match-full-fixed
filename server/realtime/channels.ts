import type { RealtimeProviderKind } from "@/server/realtime/provider"

const PUSHER_MATCH_PREFIX = "private-match-"
const ABLY_MATCH_PREFIX = "match:"

/** Server-side channel name for a match (provider-specific). */
export function matchChannelName(matchId: string, provider: RealtimeProviderKind): string | null {
  if (provider === "pusher") return `${PUSHER_MATCH_PREFIX}${matchId}`
  if (provider === "ably") return `${ABLY_MATCH_PREFIX}${matchId}`
  return null
}

/** Parse match id from a subscribed channel name. */
export function parseMatchIdFromChannel(channelName: string): string | null {
  if (channelName.startsWith(PUSHER_MATCH_PREFIX)) {
    const id = channelName.slice(PUSHER_MATCH_PREFIX.length)
    return id || null
  }
  if (channelName.startsWith(ABLY_MATCH_PREFIX)) {
    const id = channelName.slice(ABLY_MATCH_PREFIX.length)
    return id || null
  }
  return null
}

export const REALTIME_EVENTS = {
  typing: "typing",
  presence: "presence",
  message: "message",
} as const

export type RealtimeEventName = (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS]
