import { buildConnectionView } from "@/lib/connection-system"
import { getActiveConnections } from "@/lib/connection-store"

export type ConnectionSummary = {
  activeCount: number
  nearestRemainingMs: number | null
  maxStreakDays: number
  urgentCount: number
}

export function getConnectionSummary(): ConnectionSummary {
  const records = getActiveConnections()
  let nearest: number | null = null
  let maxStreak = 0
  let urgentCount = 0

  for (const r of records) {
    const view = buildConnectionView(r)
    if (nearest == null || view.remainingMs < nearest) nearest = view.remainingMs
    if (view.streakDays > maxStreak) maxStreak = view.streakDays
    if (view.urgency === "critical" || view.urgency === "urgent" || view.isFading) urgentCount++
  }

  return {
    activeCount: records.length,
    nearestRemainingMs: nearest,
    maxStreakDays: maxStreak,
    urgentCount,
  }
}
