import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ConnectionView } from "@/lib/connection-system"
import type { SyncMetrics, SyncTier } from "@/lib/sync-system"
import type { AIConnectionState } from "@/lib/ai-connection-engine/types"
import type { TranslationKey } from "@/lib/i18n"

/** High-level emotional states that drive chat atmosphere. */
export type ChatExperienceState =
  | "sync_intensifying"
  | "deep_chemistry"
  | "stable_bond"
  | "connection_growing"
  | "aligned_intimacy"
  | "energy_fading"
  | "distant_signal"

export type ChatExperience = {
  state: ChatExperienceState
  intensity: number
  tier: SyncTier
  motionScale: number
  particleDensity: number
}

const STATE_KEY: Record<ChatExperienceState, TranslationKey> = {
  sync_intensifying: "chatExpSyncIntensifying",
  deep_chemistry: "chatExpDeepChemistry",
  stable_bond: "chatExpStableBond",
  connection_growing: "chatExpConnectionGrowing",
  aligned_intimacy: "chatExpAlignedIntimacy",
  energy_fading: "chatExpEnergyFading",
  distant_signal: "chatExpDistantSignal",
}

const AI_STATE_MAP: Partial<Record<AIConnectionState, ChatExperienceState>> = {
  growing_connection: "connection_growing",
  stable_bond: "stable_bond",
  deep_chemistry: "deep_chemistry",
  emotional_tension: "distant_signal",
  fading_energy: "energy_fading",
  high_compatibility: "aligned_intimacy",
}

export function getChatExperienceLabel(
  state: ChatExperienceState,
  t: (key: TranslationKey) => string
): string {
  return t(STATE_KEY[state])
}

export function deriveChatExperience(
  analysis: ConnectionAnalysis | null,
  view: ConnectionView | null,
  recentActivity: boolean,
  metrics?: SyncMetrics | null
): ChatExperience {
  const tier = metrics?.tier ?? analysis?.tier ?? "cold"
  const sync = metrics?.syncPercent ?? analysis?.syncPercent ?? 12
  const glow = metrics?.atmosphereGlow
  const motion = metrics?.atmosphereMotion
  const particles = metrics?.atmosphereParticles

  if (metrics?.aiConnectionState && AI_STATE_MAP[metrics.aiConnectionState]) {
    const state = AI_STATE_MAP[metrics.aiConnectionState]!
    return {
      state,
      intensity: glow ?? metrics.atmosphereLevel ? metrics.atmosphereLevel / 100 : 0.6,
      tier,
      motionScale: motion ?? 0.7,
      particleDensity: particles ?? 0.4,
    }
  }

  if (!analysis || !view) {
    return {
      state: "distant_signal",
      intensity: glow ?? 0.18,
      tier: "cold",
      motionScale: motion ?? 0.35,
      particleDensity: particles ?? 0,
    }
  }

  if (view.isFading || analysis.isDecaying) {
    return {
      state: "energy_fading",
      intensity: glow ?? 0.22 + view.fadeIntensity * 0.35,
      tier: "cold",
      motionScale: motion ?? 0.4,
      particleDensity: 0,
    }
  }

  if (!view.bothParticipated) {
    return {
      state: "distant_signal",
      intensity: glow ?? 0.25,
      tier: "cold",
      motionScale: motion ?? 0.3,
      particleDensity: 0,
    }
  }

  if (analysis.emotionalState === "aligned" || (sync >= 85 && analysis.bondLevel === "deep")) {
    return {
      state: "aligned_intimacy",
      intensity: glow ?? 0.92,
      tier,
      motionScale: motion ?? 1,
      particleDensity: particles ?? (sync >= 70 ? 0.85 : 0.5),
    }
  }

  if (analysis.chemistryLevel === "peak" || analysis.chemistryPercent >= 78) {
    return {
      state: "deep_chemistry",
      intensity: glow ?? 0.88,
      tier,
      motionScale: motion ?? 0.95,
      particleDensity: particles ?? 0.7,
    }
  }

  if (analysis.bondLevel === "stable" || analysis.bondLevel === "deep" || view.isStable) {
    return {
      state: "stable_bond",
      intensity: glow ?? 0.78,
      tier,
      motionScale: motion ?? 0.82,
      particleDensity: particles ?? 0.45,
    }
  }

  if (recentActivity && analysis.momentum >= 35 && sync < 72) {
    return {
      state: "sync_intensifying",
      intensity: glow ?? 0.75,
      tier,
      motionScale: motion ?? 0.9,
      particleDensity: particles ?? 0.55,
    }
  }

  if (sync >= 40 || analysis.bondLevel === "growing") {
    return {
      state: "connection_growing",
      intensity: glow ?? 0.55 + sync / 200,
      tier,
      motionScale: motion ?? 0.65,
      particleDensity: particles ?? (sync >= 55 ? 0.35 : 0.15),
    }
  }

  return {
    state: "connection_growing",
    intensity: glow ?? 0.4,
    tier,
    motionScale: motion ?? 0.5,
    particleDensity: particles ?? 0.1,
  }
}
