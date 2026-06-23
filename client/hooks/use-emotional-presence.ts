"use client"

import { useMemo } from "react"
import type { ConnectionView } from "@/client/lib/connection-system"
import type { SyncMetrics } from "@/client/lib/sync-system"
import type { ChatThread } from "@/client/lib/social-store"
import { resolveEmotionalPresence, type EmotionalPresence } from "@/client/lib/world"

export function useEmotionalPresence(
  profileId: number,
  options?: {
    thread?: ChatThread | null
    view?: ConnectionView | null
    syncMetrics?: SyncMetrics | null
  }
): EmotionalPresence {
  return useMemo(
    () =>
      resolveEmotionalPresence(profileId, {
        thread: options?.thread,
        view: options?.view,
        syncMetrics: options?.syncMetrics,
      }),
    [profileId, options?.thread, options?.view, options?.syncMetrics]
  )
}
