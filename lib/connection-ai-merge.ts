import type { ConnectionAIAnalysisResponse } from "@/lib/connection-ai-types"
import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { SyncMetrics, SyncTier } from "@/lib/sync-system"
import { tierFromPercent } from "@/lib/connection-engine"

const ENERGY_PERCENT: Record<ConnectionAIAnalysisResponse["energy"], number> = {
  growing: 78,
  steady: 52,
  cooling: 28,
  fading: 14,
}

const CHEMISTRY_PERCENT: Record<ConnectionAIAnalysisResponse["chemistry"], number> = {
  low: 22,
  medium: 48,
  high: 72,
  peak: 92,
}

const BOND_PERCENT: Record<ConnectionAIAnalysisResponse["bond"], number> = {
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

function isRemoteAI(source: ConnectionAIAnalysisResponse["source"]) {
  return source === "openrouter"
}

/** Merge local engine + OpenRouter AI into display metrics (invisible AI layer). */
export function mergeAnalysisWithAI(
  local: ConnectionAnalysis,
  ai: ConnectionAIAnalysisResponse,
  viewFading: boolean
): {
  analysis: ConnectionAnalysis
  metrics: SyncMetrics
} {
  const syncPercent = blend(local.syncPercent, ai.sync, isRemoteAI(ai.source) ? 0.58 : 0.35)
  const chemistryPercent = blend(
    local.chemistryPercent,
    CHEMISTRY_PERCENT[ai.chemistry],
    0.5
  )
  const bondPercent = blend(local.bondPercent, BOND_PERCENT[ai.bond], 0.5)
  const energyPercent = blend(local.energyPercent, ENERGY_PERCENT[ai.energy], 0.45)

  const tier: SyncTier = tierFromPercent(syncPercent, viewFading || ai.energy === "fading")

  const analysis: ConnectionAnalysis = {
    ...local,
    syncPercent,
    chemistryPercent,
    bondPercent,
    energyPercent,
    connectionPercent: blend(local.connectionPercent, syncPercent, 0.4),
    chemistryLevel: ai.chemistry,
    bondLevel: ai.bond,
    tier,
    momentum: clamp(local.momentum + (ai.energy === "growing" ? 12 : ai.energy === "cooling" ? -8 : 0)),
    isDecaying: local.isDecaying || ai.energy === "fading" || ai.energy === "cooling",
  }

  const metrics: SyncMetrics = {
    syncPercent,
    connectionPercent: analysis.connectionPercent,
    chemistryPercent,
    energyPercent,
    bondPercent,
    tier,
    isActive: !analysis.isDecaying && (ai.energy === "growing" || local.momentum > 30),
    isFading: analysis.isDecaying,
    isSynced: syncPercent >= 96 && ai.bond !== "forming" && !analysis.isDecaying,
    recentActivity: local.momentum > 25,
    emotionalState: local.emotionalState,
    chemistryLevel: ai.chemistry,
    bondLevel: ai.bond,
    aiEnhanced: isRemoteAI(ai.source),
    insight: ai.insight,
  }

  return { analysis, metrics }
}
