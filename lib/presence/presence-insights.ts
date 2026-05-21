import type { EmotionalDistance } from "@/lib/presence/emotional-distance"
import type { SharedPresence } from "@/lib/presence/shared-presence"
import type { EmotionalPresence } from "@/lib/world"
import type { TranslationKey } from "@/lib/i18n"

const PREFIX = "ttm-presence-insight"
const COOLDOWN_MS = 3 * 60 * 60 * 1000

export type PresenceInsight = {
  id: string
  textKey: TranslationKey
}

export function canShowPresenceInsight(profileId: number): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = localStorage.getItem(`${PREFIX}-${profileId}`)
    if (!raw) return true
    return Date.now() - Number(raw) >= COOLDOWN_MS
  } catch {
    return true
  }
}

export function markPresenceInsightShown(profileId: number) {
  if (typeof window === "undefined") return
  localStorage.setItem(`${PREFIX}-${profileId}`, String(Date.now()))
}

export function buildPresenceInsight(
  profileId: number,
  presence: EmotionalPresence,
  distance: EmotionalDistance,
  shared: SharedPresence,
  hour: number,
  options?: { force?: boolean }
): PresenceInsight | null {
  if (!options?.force && !canShowPresenceInsight(profileId)) return null

  const isNight = hour >= 22 || hour < 5

  if (shared.active && isNight) {
    return { id: "closer-tonight", textKey: "presInsightCloserTonight" }
  }
  if (distance.id === "aligned") {
    return { id: "aligned", textKey: "presInsightAligned" }
  }
  if (distance.id === "steady" && presence.kind === "quiet_presence") {
    return { id: "calmer", textKey: "presInsightCalmer" }
  }
  if (shared.active) {
    return { id: "together", textKey: "presInsightTogether" }
  }

  return null
}
