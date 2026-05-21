import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ConnectionRecord } from "@/lib/connection-system"
import type { ChatMessage } from "@/lib/social-store"
import type { EmotionalReality } from "@/lib/reality"
import { getTimeFlowTokens, timeFlowCss, timeFlowAttrs } from "@/lib/time/time-flow"
import {
  resolveRelationshipTimeState,
  timeStateAttrs,
  type RelationshipTimeState,
} from "@/lib/time/relationship-time-state"
import { deriveTimeEvolution, evolutionCss, evolutionAttrs } from "@/lib/time/time-evolution"
import {
  analyzeConnectionTimeRhythm,
  rhythmCss,
  type ConnectionTimeRhythm,
} from "@/lib/time/connection-rhythm-engine"
import { buildTimeMemories, type TimeMemoryFragment } from "@/lib/time/time-memories"
import { buildEmotionalTimeline, type EmotionalTimelineEntry } from "@/lib/time/emotional-timeline"
import { deriveOfflinePresence, offlineCss } from "@/lib/time/offline-presence"
import { mergeTemporalAtmosphere } from "@/lib/time/temporal-atmosphere"

export type EmotionalTime = {
  flow: ReturnType<typeof getTimeFlowTokens>
  timeState: RelationshipTimeState
  evolution: ReturnType<typeof deriveTimeEvolution>
  rhythm: ConnectionTimeRhythm
  memories: TimeMemoryFragment[]
  timeline: EmotionalTimelineEntry[]
  offline: ReturnType<typeof deriveOfflinePresence>
  style: Record<string, string>
  attrs: Record<string, string>
}

export function analyzeEmotionalTime(
  profileId: number,
  record: ConnectionRecord,
  messages: ChatMessage[],
  analysis: ConnectionAnalysis,
  syncPercent: number,
  options?: {
    hour?: number
    recentActivity?: boolean
    realityStyle?: Record<string, string>
    realityAttrs?: Record<string, string>
  }
): EmotionalTime {
  const flow = getTimeFlowTokens(options?.hour)
  const timeState = resolveRelationshipTimeState(record, analysis, messages)
  const evolution = deriveTimeEvolution(record, analysis, messages, timeState)
  const rhythm = analyzeConnectionTimeRhythm(messages, record)
  const memories = buildTimeMemories(profileId, messages, record, analysis)
  const timeline = buildEmotionalTimeline(messages, record, syncPercent, timeState)
  const offline = deriveOfflinePresence(record, evolution, options?.recentActivity ?? false)
  const merged = mergeTemporalAtmosphere(flow, evolution, rhythm, timeState)

  return {
    flow,
    timeState,
    evolution,
    rhythm,
    memories,
    timeline,
    offline,
    style: {
      ...(options?.realityStyle ?? {}),
      ...timeFlowCss(flow),
      ...evolutionCss(evolution),
      ...rhythmCss(rhythm),
      ...offlineCss(offline),
      ...merged,
    },
    attrs: {
      ...(options?.realityAttrs ?? {}),
      ...timeFlowAttrs(flow),
      ...timeStateAttrs(timeState),
      ...evolutionAttrs(evolution),
      "data-time-active": "true",
      ...(offline.active ? { "data-time-offline": "true" } : {}),
    },
  }
}

/** Re-export for hooks that also hold reality bundle. */
export type { EmotionalReality }
