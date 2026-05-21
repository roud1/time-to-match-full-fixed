import type { ChatThread } from "@/lib/social-store"
import type { ConnectionView } from "@/lib/connection-system"
import type { SyncMetrics } from "@/lib/sync-system"
import {
  resolveEmotionalPresence,
  isEmotionallyReachable,
  type EmotionalPresence,
} from "@/lib/world"

export { resolveEmotionalPresence, isEmotionallyReachable, type EmotionalPresence }

/** Legacy helper — true when peer feels emotionally reachable (not binary online). */
export function isChatPeerOnline(
  profileId: number,
  thread: ChatThread,
  view?: ConnectionView | null,
  syncMetrics?: SyncMetrics | null
): boolean {
  return isEmotionallyReachable(
    resolveEmotionalPresence(profileId, { thread, view, syncMetrics })
  )
}

export function getChatEmotionalPresence(
  profileId: number,
  thread: ChatThread,
  view?: ConnectionView | null,
  syncMetrics?: SyncMetrics | null
): EmotionalPresence {
  return resolveEmotionalPresence(profileId, { thread, view, syncMetrics })
}
