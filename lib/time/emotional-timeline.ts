import type { ConnectionRecord } from "@/lib/connection-system"
import type { ChatMessage } from "@/lib/social-store"
import type { TranslationKey } from "@/lib/i18n"
import { buildConnectionMilestones } from "@/lib/connection-timeline"
import type { RelationshipTimeState } from "@/lib/time/relationship-time-state"

export type EmotionalTimelineKind = "milestone" | "time_state" | "memory"

export type EmotionalTimelineEntry = {
  id: string
  kind: EmotionalTimelineKind
  at: number
  titleKey: TranslationKey
  bodyKey: TranslationKey
  pulse: number
}

const MILESTONE_KEYS: Record<string, { titleKey: TranslationKey; bodyKey: TranslationKey }> = {
  first_message: { titleKey: "timeLineFirst", bodyKey: "timeLineFirstBody" },
  first_night_talk: { titleKey: "timeLineNight", bodyKey: "timeLineNightBody" },
  connection_24h: { titleKey: "timeLine24h", bodyKey: "timeLine24hBody" },
  deep_conversation: { titleKey: "timeLineDeep", bodyKey: "timeLineDeepBody" },
  consistent_replies: { titleKey: "timeLineConsistent", bodyKey: "timeLineConsistentBody" },
  sync_increased: { titleKey: "timeLineSync", bodyKey: "timeLineSyncBody" },
  strong_sync: { titleKey: "timeLineStrong", bodyKey: "timeLineStrongBody" },
}

export function buildEmotionalTimeline(
  messages: ChatMessage[],
  record: ConnectionRecord,
  syncPercent: number,
  timeState: RelationshipTimeState
): EmotionalTimelineEntry[] {
  const milestones = buildConnectionMilestones(messages, record, syncPercent)
  const entries: EmotionalTimelineEntry[] = []

  for (const m of milestones) {
    if (!m.reached || !m.at) continue
    const keys = MILESTONE_KEYS[m.id]
    if (!keys) continue
    entries.push({
      id: m.id,
      kind: "milestone",
      at: m.at,
      titleKey: keys.titleKey,
      bodyKey: keys.bodyKey,
      pulse: m.id === "strong_sync" ? 0.95 : 0.65,
    })
  }

  entries.push({
    id: `state-${timeState.id}`,
    kind: "time_state",
    at: Date.now(),
    titleKey: timeState.labelKey,
    bodyKey: timeState.descriptionKey,
    pulse: timeState.weight,
  })

  return entries.sort((a, b) => a.at - b.at)
}
