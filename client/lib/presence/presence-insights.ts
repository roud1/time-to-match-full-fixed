import type { EmotionalDistance } from "@/client/lib/presence/emotional-distance"
import type { SharedPresence } from "@/client/lib/presence/shared-presence"
import type { EmotionalPresence } from "@/client/lib/world"
import type { TranslationKey } from "@/client/lib/i18n"

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
