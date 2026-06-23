import type { ConnectionHubSnapshot } from "@/client/lib/emotional-os/connection-hub"
import type { EmotionalLifeRhythm } from "@/client/lib/reality-expansion/life-rhythm"
import type { RelationshipWeather } from "@/client/lib/reality-expansion/relationship-weather"
import type { TranslationKey } from "@/client/lib/i18n"

const PREFIX = "ttm-er-narrative"
const COOLDOWN_MS = 4 * 60 * 60 * 1000

export type RelationshipNarrative = {
  id: string
  textKey: TranslationKey
  scope: "platform" | "connection"
}

export function canShowRealityNarrative(scope: string, profileId?: number): boolean {
  if (typeof window === "undefined") return false
  const key = profileId != null ? `${PREFIX}-${scope}-${profileId}` : `${PREFIX}-${scope}`
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return true
    return Date.now() - Number(raw) >= COOLDOWN_MS
  } catch {
    return true
  }
}

export function markRealityNarrativeShown(scope: string, profileId?: number) {
  if (typeof window === "undefined") return
  const key = profileId != null ? `${PREFIX}-${scope}-${profileId}` : `${PREFIX}-${scope}`
  localStorage.setItem(key, String(Date.now()))
}

export function buildRelationshipNarrative(
  hub: ConnectionHubSnapshot,
  rhythm: EmotionalLifeRhythm,
  weather: RelationshipWeather,
  options?: { profileId?: number; force?: boolean }
): RelationshipNarrative | null {
  const scope = options?.profileId != null ? "connection" : "platform"
  if (!options?.force && !canShowRealityNarrative(scope, options?.profileId)) return null

  if (options?.profileId != null) {
    if (weather.kind === "warm_glow" && rhythm.phase === "night_intimacy") {
      return { id: "tonight-energy", textKey: "erNarrativeTonightEnergy", scope: "connection" }
    }
    if (hub.hasFading) {
      return { id: "calmer-rhythm", textKey: "erNarrativeCalmerRhythm", scope: "connection" }
    }
    if (hub.evolutionMaturity === "developing" || hub.evolutionMaturity === "established") {
      return { id: "quiet-evolution", textKey: "erNarrativeQuietEvolution", scope: "connection" }
    }
    return null
  }

  if (rhythm.phase === "emotional_silence") {
    return { id: "life-silence", textKey: "erNarrativeLifeSilence", scope: "platform" }
  }
  if (weather.kind === "storm") {
    return { id: "storm-week", textKey: "erNarrativeStormWeek", scope: "platform" }
  }
  if (hub.activeCount >= 2 && hub.platformSync >= 55) {
    return { id: "aligned-field", textKey: "erNarrativeAlignedField", scope: "platform" }
  }

  return { id: "calm-platform", textKey: "erNarrativeCalmPlatform", scope: "platform" }
}
