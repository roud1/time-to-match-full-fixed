import type {
  AIConnectionState,
  AIEmotionalState,
  AIConnectionAnalysis,
} from "@/client/lib/ai-connection-engine/types"
import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { ConnectionView } from "@/client/lib/connection-system"
import type { TranslationKey } from "@/client/lib/i18n"

const STATE_I18N: Record<AIConnectionState, TranslationKey> = {
  growing_connection: "aiStateGrowingConnection",
  stable_bond: "aiStateStableBond",
  deep_chemistry: "aiStateDeepChemistry",
  emotional_tension: "aiStateEmotionalTension",
  fading_energy: "aiStateFadingEnergy",
  high_compatibility: "aiStateHighCompatibility",
}

export function getAIConnectionStateLabel(
  state: AIConnectionState,
  t: (key: TranslationKey) => string
): string {
  return t(STATE_I18N[state])
}

/** Derive smart connection state from AI + local analysis. */
export function resolveAIConnectionState(
  ai: AIConnectionAnalysis | null,
  local: ConnectionAnalysis | null,
  view: ConnectionView | null
): AIConnectionState {
  if (ai?.connectionState) return ai.connectionState

  if (!local || !view) return "growing_connection"
  if (view.isFading || local.isDecaying || ai?.energy === "fading") return "fading_energy"
  if (!view.bothParticipated) return "emotional_tension"
  if (local.chemistryLevel === "peak" || local.chemistryPercent >= 78) return "deep_chemistry"
  if (local.bondLevel === "stable" || local.bondLevel === "deep" || view.isStable)
    return "stable_bond"
  if (local.syncPercent >= 82 && local.bondPercent >= 65) return "high_compatibility"
  return "growing_connection"
}

export function mapAIEmotionalState(
  ai: AIConnectionAnalysis | null,
  local: ConnectionAnalysis | null
): AIEmotionalState {
  if (ai?.emotionalState) return ai.emotionalState
  if (!local) return "curious"
  switch (local.emotionalState) {
    case "electric":
      return "deepening"
    case "aligned":
      return "aligned"
    case "warm":
      return "warming"
    case "distant":
      return "distant"
    case "fading":
      return "fading"
    default:
      return "curious"
  }
}
