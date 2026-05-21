import type { AIConnectionAnalysis, ConnectionPersonality } from "@/lib/ai-connection-engine/types"
import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { AIConnectionSignals } from "@/lib/ai-connection-engine/types"
import type { TranslationKey } from "@/lib/i18n"

const PERSONALITY_I18N: Record<ConnectionPersonality, TranslationKey> = {
  calm_connection: "aiPersonalityCalm",
  intense_chemistry: "aiPersonalityIntense",
  slow_burn: "aiPersonalitySlowBurn",
  emotional_chaos: "aiPersonalityChaos",
  deep_compatibility: "aiPersonalityDeepCompat",
}

export function getConnectionPersonalityLabel(
  p: ConnectionPersonality,
  t: (key: TranslationKey) => string
): string {
  return t(PERSONALITY_I18N[p])
}

export function resolveConnectionPersonality(
  ai: AIConnectionAnalysis | null,
  local: ConnectionAnalysis | null,
  signals: AIConnectionSignals | null
): ConnectionPersonality {
  if (ai?.personality) return ai.personality
  if (!local || !signals) return "slow_burn"

  if (local.chemistryLevel === "peak" && signals.emotionalIntensity >= 60) {
    return "intense_chemistry"
  }
  if (local.syncPercent >= 80 && local.bondPercent >= 70 && signals.replyConsistency >= 0.65) {
    return "deep_compatibility"
  }
  if (signals.oneSidedRatio > 0.6 || (local.momentum < 20 && signals.messageCount >= 6)) {
    return "emotional_chaos"
  }
  if (signals.avgReplyMs != null && signals.avgReplyMs > 2 * 60 * 60 * 1000 && local.syncPercent < 50) {
    return "slow_burn"
  }
  if (local.bondLevel === "stable" || local.bondLevel === "deep") {
    return "calm_connection"
  }
  return "slow_burn"
}
