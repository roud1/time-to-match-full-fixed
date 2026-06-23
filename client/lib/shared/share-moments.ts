import type { ConnectionView } from "@/client/lib/connection-system"
import type { SyncMetrics } from "@/client/lib/sync-system"
import type { RelationshipLiveState } from "@/client/lib/shared/relationship-live-state"

export type ShareMomentKind = "sync_card" | "aura" | "milestone" | "memory"

export type ShareMoment = {
  kind: ShareMomentKind
  title: string
  subtitle: string
  syncPercent: number
  state: RelationshipLiveState
  partnerName: string
  hashtag: string
}

export function buildSyncShareMoment(
  partnerName: string,
  view: ConnectionView,
  metrics: SyncMetrics,
  state: RelationshipLiveState,
  labels: { title: string; subtitle: string }
): ShareMoment {
  return {
    kind: "sync_card",
    title: labels.title,
    subtitle: labels.subtitle,
    syncPercent: metrics.syncPercent,
    state,
    partnerName,
    hashtag: "TimeToMatch",
  }
}

export function shareMomentToText(moment: ShareMoment): string {
  return `${moment.title}\n${moment.subtitle}\nSync ${moment.syncPercent}% · ${moment.partnerName}\n#${moment.hashtag}`
}

export async function shareMomentNative(moment: ShareMoment): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) return false
  try {
    await navigator.share({
      title: moment.title,
      text: shareMomentToText(moment),
    })
    return true
  } catch {
    return false
  }
}

export function copyShareMoment(moment: ShareMoment): boolean {
  if (typeof navigator === "undefined" || !navigator.clipboard) return false
  try {
    void navigator.clipboard.writeText(shareMomentToText(moment))
    return true
  } catch {
    return false
  }
}
