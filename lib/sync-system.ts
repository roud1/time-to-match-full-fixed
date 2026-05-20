import type { ConnectionView, ConnectionStage } from "@/lib/connection-system"

/** Visual tier for sync ring glow intensity. */
export type SyncTier = "cold" | "soft" | "active" | "vibrant" | "synced"

export type SyncMetrics = {
  syncPercent: number
  connectionPercent: number
  chemistryPercent: number
  energyPercent: number
  tier: SyncTier
  isActive: boolean
  isFading: boolean
  isSynced: boolean
  recentActivity: boolean
}

const STAGE_BASE: Record<ConnectionStage, number> = {
  spark: 12,
  active: 38,
  strong: 58,
  rare: 78,
  stable: 92,
}

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function tierFromPercent(p: number, fading: boolean): SyncTier {
  if (fading && p < 30) return "cold"
  if (p >= 100) return "synced"
  if (p >= 78) return "vibrant"
  if (p >= 45) return "active"
  if (p >= 22) return "soft"
  return "cold"
}

export function deriveSyncMetrics(
  view: ConnectionView | null,
  opts?: { recentActivity?: boolean; now?: number }
): SyncMetrics | null {
  if (!view) return null

  const recentActivity = opts?.recentActivity ?? false

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
    tier,
    isActive: recentActivity || view.urgency === "calm" || view.urgency === "aware",
    isFading: view.isFading,
    isSynced: syncPercent >= 98 && view.bothParticipated && !view.isFading,
    recentActivity,
  }
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
  if (view.isStable) return "syncStatusStable"
  if (metrics.recentActivity) return "syncStatusActive"
  return "syncStatusGrowing"
}
