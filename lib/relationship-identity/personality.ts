import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { AIConnectionAnalysis } from "@/lib/ai-connection-engine/types"
import type { AIConnectionSignals } from "@/lib/ai-connection-engine/types"
import type { ConnectionView } from "@/lib/connection-system"
import type {
  AnyConnectionPersonality,
  ConnectionEvolutionStage,
  RelationshipPersonality,
} from "@/lib/relationship-identity/types"
import type { TranslationKey } from "@/lib/i18n"

const PERSONALITY_I18N: Record<RelationshipPersonality, TranslationKey> = {
  slow_burn: "relPersonalitySlowBurn",
  deep_sync: "relPersonalityDeepSync",
  emotional_chaos: "relPersonalityEmotionalChaos",
  calm_connection: "relPersonalityCalmConnection",
  magnetic_chemistry: "relPersonalityMagneticChemistry",
  night_energy: "relPersonalityNightEnergy",
  stable_bond: "relPersonalityStableBond",
  intense_attraction: "relPersonalityIntenseAttraction",
}

export function normalizePersonality(p: AnyConnectionPersonality): RelationshipPersonality {
  switch (p) {
    case "intense_chemistry":
      return "magnetic_chemistry"
    case "deep_compatibility":
      return "deep_sync"
    default:
      return p
  }
}

export function getRelationshipPersonalityLabel(
  p: RelationshipPersonality,
  t: (key: TranslationKey) => string
): string {
  return t(PERSONALITY_I18N[p])
}

export function resolveRelationshipPersonality(
  ai: AIConnectionAnalysis | null,
  local: ConnectionAnalysis | null,
  signals: AIConnectionSignals | null,
  view: ConnectionView | null
): RelationshipPersonality {
  if (ai?.personality) return normalizePersonality(ai.personality as AnyConnectionPersonality)

  if (!local || !signals) return "slow_burn"

  if (signals.lateNightRatio >= 0.28 && signals.messageCount >= 6) {
    return "night_energy"
  }

  if (local.chemistryLevel === "peak" && signals.emotionalIntensity >= 65) {
    return local.syncPercent >= 75 ? "intense_attraction" : "magnetic_chemistry"
  }

  if (local.syncPercent >= 82 && local.bondPercent >= 72) {
    return "deep_sync"
  }

  if (view?.isStable || local.bondLevel === "deep") {
    return "stable_bond"
  }

  if (local.bondLevel === "stable") {
    return "calm_connection"
  }

  if (signals.oneSidedRatio > 0.58 || (local.momentum < 18 && signals.messageCount >= 8)) {
    return "emotional_chaos"
  }

  if (
    signals.avgReplyMs != null &&
    signals.avgReplyMs > 2 * 60 * 60 * 1000 &&
    local.syncPercent < 52
  ) {
    return "slow_burn"
  }

  if (local.syncPercent >= 55 && signals.mutualEngagement >= 0.5) {
    return "deep_sync"
  }

  return "slow_burn"
}

export function resolveEvolutionStage(
  syncPercent: number,
  isFading: boolean,
  bothParticipated: boolean
): ConnectionEvolutionStage {
  if (isFading) return "fading"
  if (!bothParticipated) return "forming"
  if (syncPercent >= 88) return "peak"
  if (syncPercent >= 62) return "deepening"
  if (syncPercent >= 35) return "growing"
  return "forming"
}

export function evolutionProgress(stage: ConnectionEvolutionStage, syncPercent: number): number {
  switch (stage) {
    case "peak":
      return Math.min(1, 0.88 + syncPercent / 800)
    case "deepening":
      return 0.55 + syncPercent / 200
    case "growing":
      return 0.28 + syncPercent / 150
    case "fading":
      return Math.max(0.12, syncPercent / 300)
    default:
      return syncPercent / 120
  }
}

/** Personality can shift slowly as bond deepens (no gamification — subtle drift). */
export function evolvePersonality(
  current: RelationshipPersonality,
  local: ConnectionAnalysis,
  signals: AIConnectionSignals,
  view: ConnectionView
): RelationshipPersonality {
  const next = resolveRelationshipPersonality(null, local, signals, view)
  if (current === next) return current
  if (local.bondPercent < 40 && next !== "slow_burn") return current
  return next
}
