import type { AIConnectionAnalysis, AIConnectionSignals } from "@/lib/ai-connection-engine/types"
import { resolveAIConnectionState } from "@/lib/ai-connection-engine"
import {
  buildConnectionAura,
  normalizePersonality,
  resolveRelationshipPersonality,
  resolveEvolutionStage,
} from "@/lib/relationship-identity"
import type { ConnectionAnalysis } from "@/lib/connection-engine"
import { tierFromPercent } from "@/lib/connection-engine"
import type { ConnectionView } from "@/lib/connection-system"
import type { SyncMetrics, SyncTier } from "@/lib/sync-system"

const ENERGY_PERCENT: Record<AIConnectionAnalysis["energy"], number> = {
  growing: 78,
  steady: 52,
  cooling: 28,
  fading: 14,
}

const CHEMISTRY_PERCENT: Record<string, number> = {
  low: 22,
  medium: 48,
  high: 72,
  peak: 92,
  intense: 94,
}

const BOND_PERCENT: Record<AIConnectionAnalysis["bond"], number> = {
  forming: 18,
  growing: 42,
  stable: 68,
  deep: 88,
}

function clamp(n: number) {
  return Math.min(100, Math.max(0, Math.round(n)))
}

function blend(local: number, ai: number, weight = 0.5) {
  return clamp(local * (1 - weight) + ai * weight)
}

function normalizeChemistry(c: AIConnectionAnalysis["chemistry"]) {
  return c === "intense" ? "peak" : c
}

function isRemoteAI(source: AIConnectionAnalysis["source"]) {
  return source === "openrouter"
}

export type MergedConnectionBundle = {
  analysis: ConnectionAnalysis
  metrics: SyncMetrics
  ai: AIConnectionAnalysis
}

/** Merge local engine + invisible AI into display metrics & atmosphere inputs. */
export function mergeAnalysisWithAI(
  local: ConnectionAnalysis,
  ai: AIConnectionAnalysis,
  view: ConnectionView,
  signals?: AIConnectionSignals | null
): MergedConnectionBundle {
  const viewFading = view.isFading
  const chemKey = normalizeChemistry(ai.chemistry)
  const weight = isRemoteAI(ai.source) ? 0.62 : 0.38

  const syncPercent = blend(local.syncPercent, ai.sync, weight)
  const chemistryPercent = blend(
    local.chemistryPercent,
    CHEMISTRY_PERCENT[chemKey] ?? 50,
    0.52
  )
  const bondPercent = blend(local.bondPercent, BOND_PERCENT[ai.bond], 0.52)
  const energyPercent = blend(local.energyPercent, ENERGY_PERCENT[ai.energy], 0.48)

  const tier: SyncTier = tierFromPercent(syncPercent, viewFading || ai.energy === "fading")

  const connectionState = resolveAIConnectionState(ai, local, view)
  const personality = normalizePersonality(
    resolveRelationshipPersonality(ai, local, signals ?? null, view)
  )
  const evolutionStage = resolveEvolutionStage(
    syncPercent,
    viewFading,
    view.bothParticipated
  )
  const relAura = buildConnectionAura(personality, evolutionStage, syncPercent, ai.atmosphereLevel / 100)

  const analysis: ConnectionAnalysis = {
    ...local,
    syncPercent,
    chemistryPercent,
    bondPercent,
    energyPercent,
    connectionPercent: blend(local.connectionPercent, syncPercent, 0.42),
    chemistryLevel: chemKey as ConnectionAnalysis["chemistryLevel"],
    bondLevel: ai.bond,
    tier,
    momentum: clamp(
      local.momentum +
        (ai.energy === "growing" ? 14 : ai.energy === "cooling" ? -10 : 0) +
        (isRemoteAI(ai.source) ? 4 : 0)
    ),
    isDecaying: local.isDecaying || ai.energy === "fading" || ai.energy === "cooling",
  }

  const metrics: SyncMetrics = {
    syncPercent,
    connectionPercent: analysis.connectionPercent,
    chemistryPercent,
    energyPercent,
    bondPercent,
    tier,
    isActive: !analysis.isDecaying && (ai.energy === "growing" || local.momentum > 28),
    isFading: analysis.isDecaying,
    isSynced: syncPercent >= 96 && ai.bond !== "forming" && !analysis.isDecaying,
    recentActivity: local.momentum > 22 || ai.energy === "growing",
    emotionalState: local.emotionalState,
    chemistryLevel: analysis.chemistryLevel,
    bondLevel: ai.bond,
    aiEnhanced: isRemoteAI(ai.source),
    insight: ai.insight,
    aiEmotionalState: ai.emotionalState,
    aiConnectionState: connectionState,
    connectionPersonality: personality,
    atmosphereLevel: relAura.intensity * 100,
    atmosphereGlow: relAura.intensity,
    atmosphereMotion: relAura.intensity,
    atmosphereParticles: relAura.particles === "none" ? 0 : relAura.particles === "cinematic" ? 0.85 : 0.45,
  }

  return { analysis, metrics, ai }
}
