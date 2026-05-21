/**
 * Phase 17 — Emotional Time System (time as part of the bond).
 */
export {
  type TimeFlowPeriod,
  type TimeFlowTokens,
  getTimeFlowTokens,
  timeFlowCss,
  timeFlowAttrs,
} from "@/lib/time/time-flow"

export {
  type RelationshipTimeStateId,
  type RelationshipTimeState,
  resolveRelationshipTimeState,
  timeStateAttrs,
} from "@/lib/time/relationship-time-state"

export {
  type TimeEvolutionTrend,
  type TimeEvolution,
  deriveTimeEvolution,
  evolutionCss,
  evolutionAttrs,
} from "@/lib/time/time-evolution"

export {
  type ConnectionTimeRhythm,
  analyzeConnectionTimeRhythm,
  rhythmCss,
} from "@/lib/time/connection-rhythm-engine"

export {
  type TimeMemoryFragment,
  buildTimeMemories,
} from "@/lib/time/time-memories"

export {
  type EmotionalTimelineKind,
  type EmotionalTimelineEntry,
  buildEmotionalTimeline,
} from "@/lib/time/emotional-timeline"

export { type OfflinePresence, deriveOfflinePresence, offlineCss } from "@/lib/time/offline-presence"

export { mergeTemporalAtmosphere } from "@/lib/time/temporal-atmosphere"

export { type EmotionalTime, analyzeEmotionalTime } from "@/lib/time/analyze"
