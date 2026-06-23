/** Match lifetime after mutual like (server default). */
export const MATCH_TTL_MS = 24 * 60 * 60 * 1000

/** Freeze extends match by this amount. */
export const MATCH_FREEZE_EXTENSION_MS = 24 * 60 * 60 * 1000

/** Free freeze cooldown per user. */
export const MATCH_FREEZE_COOLDOWN_MS = 24 * 60 * 60 * 1000

export type TimerUrgency = "normal" | "warning" | "critical"

export function getTimerUrgency(remainingMs: number): TimerUrgency {
  if (remainingMs <= 60 * 60 * 1000) return "critical"
  if (remainingMs <= 6 * 60 * 60 * 1000) return "warning"
  return "normal"
}

export function formatExpiryCountdown(remainingMs: number): string {
  const total = Math.max(0, Math.floor(remainingMs / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${m}:${String(s).padStart(2, "0")}`
}

/** Human-readable fragment for aria-label substitution ({time}). */
export function formatExpiryAriaTime(remainingMs: number): string {
  const total = Math.max(0, Math.floor(remainingMs / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  if (h > 0 && m > 0) return `${h} ч ${m} мин`
  if (h > 0) return `${h} ч`
  if (m > 0) return `${m} мин`
  return "меньше минуты"
}
