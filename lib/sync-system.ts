import type { ConnectionRecord, ConnectionView } from "@/lib/connection-system"
import type { ChatMessage } from "@/lib/social-store"
import {
  analyzeConnection,
  analysisToSyncMetrics,
  tierFromPercent,
  type ConnectionAnalysis,
  type EmotionalState,
  type ChemistryLevel,
  type BondLevel,
} from "@/lib/connection-engine"

export type { ConnectionAnalysis, EmotionalState, ChemistryLevel, BondLevel }

/** Visual tier for sync ring glow intensity (maps to % bands). */
export type SyncTier = "cold" | "soft" | "active" | "vibrant" | "synced"

export type SyncMetrics = {
  syncPercent: number
  connectionPercent: number
  chemistryPercent: number
  energyPercent: number
  bondPercent: number
  tier: SyncTier
  isActive: boolean
  isFading: boolean
  isSynced: boolean
  recentActivity: boolean
  emotionalState?: EmotionalState
  chemistryLevel?: ChemistryLevel
  bondLevel?: BondLevel
  /** OpenRouter-refined layer active */
  aiEnhanced?: boolean
  /** Short atmospheric insight from AI engine */
  insight?: string
  /** Invisible AI layer */
  aiEmotionalState?: import("@/lib/ai-connection-engine/types").AIEmotionalState
  aiConnectionState?: import("@/lib/ai-connection-engine/types").AIConnectionState
  connectionPersonality?: import("@/lib/relationship-identity/types").RelationshipPersonality
  atmosphereLevel?: number
  atmosphereGlow?: number
  atmosphereMotion?: number
  atmosphereParticles?: number
}

const STAGE_BASE: Record<ConnectionView["stage"], number> = {
  spark: 12,
  active: 38,
  strong: 58,
  rare: 78,
  stable: 92,
}

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(n)))
}

/** Legacy fallback when messages/record unavailable. */
function deriveLegacyMetrics(
  view: ConnectionView,
  recentActivity: boolean
): SyncMetrics {
  const stageBase = STAGE_BASE[view.stage]
  const scoreBoost = clamp(view.streakScore * 0.35, 0, 28)
  const streakBoost = clamp(view.streakDays * 4, 0, 16)
  const participateBoost = view.bothParticipated ? 8 : 0

  let syncPercent = clamp(stageBase + scoreBoost + streakBoost + participateBoost)
  if (view.isStable) syncPercent = Math.max(syncPercent, 94)
  if (view.isFading) syncPercent = clamp(syncPercent * (1 - view.fadeIntensity * 0.55))
  if (!view.bothParticipated) syncPercent = clamp(syncPercent * 0.65, 8, 35)

  const connectionPercent = clamp(
    syncPercent * 0.92 + (view.bothParticipated ? 6 : 0) - (view.isFading ? 18 : 0)
  )
  const chemistryPercent = clamp(
    (view.bothParticipated ? 42 : 14) + view.streakDays * 6 + view.streakScore * 0.25
  )
  const urgencyEnergy =
    view.urgency === "critical" ? 8 : view.urgency === "urgent" ? 18 : view.urgency === "aware" ? 28 : 38
  let energyPercent = clamp(
    chemistryPercent * 0.4 + syncPercent * 0.35 + urgencyEnergy + (recentActivity ? 22 : 0)
  )
  if (view.isFading) energyPercent = clamp(energyPercent * (1 - view.fadeIntensity))

  const tier = tierFromPercent(syncPercent, view.isFading)

  return {
    syncPercent,
    connectionPercent,
    chemistryPercent,
    energyPercent,
    bondPercent: clamp(syncPercent * 0.85 + view.streakDays * 3),
    tier,
    isActive: recentActivity || view.urgency === "calm" || view.urgency === "aware",
    isFading: view.isFading,
    isSynced: syncPercent >= 98 && view.bothParticipated && !view.isFading,
    recentActivity,
  }
}

/**
 * Derive sync metrics — uses connection engine when messages + record provided.
 */
export function deriveSyncMetrics(
  view: ConnectionView | null,
  opts?: {
    recentActivity?: boolean
    messages?: ChatMessage[]
    record?: ConnectionRecord
    now?: number
  }
): SyncMetrics | null {
  if (!view) return null

  const recentActivity = opts?.recentActivity ?? false

  if (opts?.messages && opts?.record) {
    const analysis = analyzeConnection(view, opts.messages, opts.record, {
      recentActivity,
      now: opts?.now,
    })
    const metrics = analysisToSyncMetrics(analysis, view, recentActivity)
    return {
      ...metrics,
      bondPercent: analysis.bondPercent,
      emotionalState: analysis.emotionalState,
      chemistryLevel: analysis.chemistryLevel,
      bondLevel: analysis.bondLevel,
    }
  }

  return deriveLegacyMetrics(view, recentActivity)
}

export type SyncStatusKey =
  | "syncStatusGrowing"
  | "syncStatusStable"
  | "syncStatusWaiting"
  | "syncStatusFading"
  | "syncStatusActive"
  | "syncStatusSynced"

export function syncStatusKey(metrics: SyncMetrics, view: ConnectionView): SyncStatusKey {
  if (metrics.isSynced) return "syncStatusSynced"
  if (view.isFading) return "syncStatusFading"
  if (!view.bothParticipated) return "syncStatusWaiting"
  if (view.isStable || metrics.bondLevel === "deep") return "syncStatusStable"
  if (metrics.recentActivity) return "syncStatusActive"
  return "syncStatusGrowing"
}
