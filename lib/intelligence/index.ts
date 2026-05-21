/**
 * Phase 14 — Emotional Intelligence Platform Layer.
 */
export {
  type CompatibilityIntelligence,
  computeCompatibilityIntelligence,
} from "@/lib/intelligence/compatibility-engine"

export {
  type RelationshipRhythmType,
  type RelationshipRhythm,
  resolveRelationshipRhythm,
} from "@/lib/intelligence/relationship-rhythm"

export {
  type DeepConnectionState,
  type DeepConnectionStateProfile,
  resolveDeepConnectionState,
} from "@/lib/intelligence/connection-states"

export {
  type ConnectionForecast,
  type ConnectionForecastTone,
  buildConnectionForecast,
} from "@/lib/intelligence/connection-forecast"

export { type MirrorLine, buildPersonalityMirror } from "@/lib/intelligence/personality-mirror"

export {
  type MemoryIntelligenceHighlight,
  type MemoryIntelligenceKind,
  buildMemoryIntelligence,
} from "@/lib/intelligence/memory-intelligence"

export {
  type EmotionalUiMood,
  type EmotionalUiTokens,
  deriveEmotionalUiTokens,
  uiIntelligenceStyle,
  uiIntelligenceAttrs,
} from "@/lib/intelligence/ui-intelligence"

export {
  type ConnectionIntelligence,
  analyzeConnectionIntelligence,
} from "@/lib/intelligence/analyze"
