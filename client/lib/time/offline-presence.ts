import type { ConnectionRecord } from "@/client/lib/connection-system"
import type { TimeEvolution } from "@/client/lib/time/time-evolution"

export type OfflinePresence = {
  active: boolean
  glow: number
  drift: number
}

export function deriveOfflinePresence(
  record: ConnectionRecord,
  evolution: TimeEvolution,
  recentActivity: boolean,
  now = Date.now()
): OfflinePresence {
  const idleMs = now - record.lastInteractionAt
  const active = !recentActivity && idleMs > 20 * 60 * 1000

  return {
    active,
    glow: active ? Math.max(0.12, evolution.auraDepth * 0.35) : 0,
    drift: active ? Math.min(0.4, evolution.idleHours / 24) : 0,
  }
}

export function offlineCss(presence: OfflinePresence): Record<string, string> {
  if (!presence.active) return {}
  return {
    "--time-offline-glow": String(presence.glow),
    "--time-offline-drift": String(presence.drift),
  }
}
