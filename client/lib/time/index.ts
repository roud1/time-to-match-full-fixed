/**
 * Phase 17 — Emotional Time System (time as part of the bond).
 */
export {
  type TimeFlowPeriod,
  type TimeFlowTokens,
  getTimeFlowTokens,
  timeFlowCss,
  timeFlowAttrs,
} from "@/client/lib/time/time-flow"

export {
  type RelationshipTimeStateId,
  type RelationshipTimeState,
  resolveRelationshipTimeState,
  timeStateAttrs,
} from "@/client/lib/time/relationship-time-state"

export {
  type TimeEvolutionTrend,
  type TimeEvolution,
  deriveTimeEvolution,
  evolutionCss,
  evolutionAttrs,
} from "@/client/lib/time/time-evolution"

export {
  type ConnectionTimeRhythm,
  analyzeConnectionTimeRhythm,
  rhythmCss,
} from "@/client/lib/time/connection-rhythm-engine"

export {
  type TimeMemoryFragment,
  buildTimeMemories,
} from "@/client/lib/time/time-memories"

export {
  type EmotionalTimelineKind,
  type EmotionalTimelineEntry,
  buildEmotionalTimeline,
} from "@/client/lib/time/emotional-timeline"

export { type OfflinePresence, deriveOfflinePresence, offlineCss } from "@/client/lib/time/offline-presence"

export { mergeTemporalAtmosphere } from "@/client/lib/time/temporal-atmosphere"

export { type EmotionalTime, analyzeEmotionalTime } from "@/client/lib/time/analyze"
