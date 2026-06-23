import type { ConnectionView } from "@/client/lib/connection-system"
import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { ConnectionRecord } from "@/client/lib/connection-system"
import type { ChatMessage } from "@/client/lib/social-store"
import { analyzeRelationshipEcology, type RelationshipEcology } from "@/client/lib/ecosystem"
import { getRelationshipIdentity } from "@/client/lib/relationship-identity"
import { analyzeRelationshipPatterns } from "@/client/lib/shared/relationship-insights"
import { computeCompatibilityIntelligence } from "@/client/lib/intelligence/compatibility-engine"
import { resolveRelationshipRhythm } from "@/client/lib/intelligence/relationship-rhythm"
import { resolveDeepConnectionState } from "@/client/lib/intelligence/connection-states"
import { buildConnectionForecast } from "@/client/lib/intelligence/connection-forecast"
import { buildPersonalityMirror, type MirrorLine } from "@/client/lib/intelligence/personality-mirror"
import { buildMemoryIntelligence, type MemoryIntelligenceHighlight } from "@/client/lib/intelligence/memory-intelligence"
import {
  deriveEmotionalUiTokens,
  uiIntelligenceStyle,
  uiIntelligenceAttrs,
  type EmotionalUiTokens,
} from "@/client/lib/intelligence/ui-intelligence"

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
