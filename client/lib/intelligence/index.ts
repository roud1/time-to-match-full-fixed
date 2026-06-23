/**
 * Phase 14 — Emotional Intelligence Platform Layer.
 */
export {
  type CompatibilityIntelligence,
  computeCompatibilityIntelligence,
} from "@/client/lib/intelligence/compatibility-engine"

export {
  type RelationshipRhythmType,
  type RelationshipRhythm,
  resolveRelationshipRhythm,
} from "@/client/lib/intelligence/relationship-rhythm"

export {
  type DeepConnectionState,
  type DeepConnectionStateProfile,
  resolveDeepConnectionState,
} from "@/client/lib/intelligence/connection-states"

export {
  type ConnectionForecast,
  type ConnectionForecastTone,
  buildConnectionForecast,
} from "@/client/lib/intelligence/connection-forecast"

export { type MirrorLine, buildPersonalityMirror } from "@/client/lib/intelligence/personality-mirror"

export {
  type MemoryIntelligenceHighlight,
  type MemoryIntelligenceKind,
  buildMemoryIntelligence,
} from "@/client/lib/intelligence/memory-intelligence"

export {
  type EmotionalUiMood,
  type EmotionalUiTokens,
  deriveEmotionalUiTokens,
  uiIntelligenceStyle,
  uiIntelligenceAttrs,
} from "@/client/lib/intelligence/ui-intelligence"

export {
  type ConnectionIntelligence,
  analyzeConnectionIntelligence,
} from "@/client/lib/intelligence/analyze"
