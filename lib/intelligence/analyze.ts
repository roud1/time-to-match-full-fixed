import type { ConnectionView } from "@/lib/connection-system"
import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ConnectionRecord } from "@/lib/connection-system"
import type { ChatMessage } from "@/lib/social-store"
import { analyzeRelationshipEcology, type RelationshipEcology } from "@/lib/ecosystem"
import { getRelationshipIdentity } from "@/lib/relationship-identity"
import { analyzeRelationshipPatterns } from "@/lib/shared/relationship-insights"
import { computeCompatibilityIntelligence } from "@/lib/intelligence/compatibility-engine"
import { resolveRelationshipRhythm } from "@/lib/intelligence/relationship-rhythm"
import { resolveDeepConnectionState } from "@/lib/intelligence/connection-states"
import { buildConnectionForecast } from "@/lib/intelligence/connection-forecast"
import { buildPersonalityMirror, type MirrorLine } from "@/lib/intelligence/personality-mirror"
import { buildMemoryIntelligence, type MemoryIntelligenceHighlight } from "@/lib/intelligence/memory-intelligence"
import {
  deriveEmotionalUiTokens,
  uiIntelligenceStyle,
  uiIntelligenceAttrs,
  type EmotionalUiTokens,
} from "@/lib/intelligence/ui-intelligence"

export type ConnectionIntelligence = {
  ecology: RelationshipEcology
  compatibility: ReturnType<typeof computeCompatibilityIntelligence>
  rhythm: ReturnType<typeof resolveRelationshipRhythm>
  deepState: ReturnType<typeof resolveDeepConnectionState>
  forecast: ReturnType<typeof buildConnectionForecast>
  mirror: MirrorLine[]
  memories: MemoryIntelligenceHighlight[]
  ui: EmotionalUiTokens
  uiStyle: Record<string, string>
  uiAttrs: Record<string, string>
}

export function analyzeConnectionIntelligence(
  view: ConnectionView,
  analysis: ConnectionAnalysis,
  messages: ChatMessage[],
  record: ConnectionRecord,
  prevSyncPercent?: number
): ConnectionIntelligence {
  const identity = getRelationshipIdentity(view.profileId)
  const ecology = analyzeRelationshipEcology(
    view,
    analysis,
    messages,
    record,
    identity?.evolutionStage ?? "forming"
  )
  const pattern = analyzeRelationshipPatterns(messages, record, analysis)
  const compatibility = computeCompatibilityIntelligence(analysis, analysis.signals)
  const rhythm = resolveRelationshipRhythm(analysis, record, pattern.patternId)
  const deepState = resolveDeepConnectionState(analysis, ecology, rhythm.type)
  const forecast = buildConnectionForecast(analysis, compatibility, rhythm.type)
  const mirror = buildPersonalityMirror(analysis, rhythm.type, deepState.state, prevSyncPercent)
  const memories = buildMemoryIntelligence(view.profileId, messages, record, analysis)
  const ui = deriveEmotionalUiTokens(compatibility, rhythm.type, deepState.state, forecast.tone)

  return {
    ecology,
    compatibility,
    rhythm,
    deepState,
    forecast,
    mirror,
    memories,
    ui,
    uiStyle: uiIntelligenceStyle(ui),
    uiAttrs: {
      ...uiIntelligenceAttrs(ui, deepState.state),
      "data-intel-rhythm": rhythm.type,
    },
  }
}
