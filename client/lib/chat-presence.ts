import type { ChatThread } from "@/client/lib/social-store"
import type { ConnectionView } from "@/client/lib/connection-system"
import type { SyncMetrics } from "@/client/lib/sync-system"
import {
  resolveEmotionalPresence,
  isEmotionallyReachable,
  type EmotionalPresence,
} from "@/client/lib/world"

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
