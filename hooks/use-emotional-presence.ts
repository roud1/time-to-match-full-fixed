"use client"

import { useMemo } from "react"
import type { ConnectionView } from "@/lib/connection-system"
import type { SyncMetrics } from "@/lib/sync-system"
import type { ChatThread } from "@/lib/social-store"
import { resolveEmotionalPresence, type EmotionalPresence } from "@/lib/world"

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
