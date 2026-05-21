import type { ConnectionHubSnapshot } from "@/lib/emotional-os/connection-hub"
import type { ConsciousnessReading } from "@/lib/emotional-consciousness/consciousness-engine"
import type { SilenceUnderstanding } from "@/lib/emotional-consciousness/silence-understanding"
import type { RelationshipTension } from "@/lib/emotional-consciousness/relationship-tension"
import type { EmotionalLifeRhythm } from "@/lib/reality-expansion/life-rhythm"
import type { TranslationKey } from "@/lib/i18n"

const PREFIX = "ttm-ec-reflection-v2"
const COOLDOWN_MS = 5 * 60 * 60 * 1000

export type EmotionalReflectionV2 = {
  id: string
  textKey: TranslationKey
  scope: "platform" | "connection"
}

export function canShowReflectionV2(scope: string, profileId?: number): boolean {
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

export function markReflectionV2Shown(scope: string, profileId?: number) {
  if (typeof window === "undefined") return
  const key = profileId != null ? `${PREFIX}-${scope}-${profileId}` : `${PREFIX}-${scope}`
  localStorage.setItem(key, String(Date.now()))
}

export function buildEmotionalReflectionV2(
  hub: ConnectionHubSnapshot,
  reading: ConsciousnessReading,
  silence: SilenceUnderstanding,
  tension: RelationshipTension,
  rhythm: EmotionalLifeRhythm,
  options?: { profileId?: number; hour?: number; force?: boolean }
): EmotionalReflectionV2 | null {
  const scope = options?.profileId != null ? "connection" : "platform"
  if (!options?.force && !canShowReflectionV2(scope, options?.profileId)) return null

  const hour = options?.hour ?? new Date().getHours()
  const isNight = hour >= 22 || hour < 5

  if (options?.profileId != null) {
    if (silence.kind === "fading_silence") {
      return { id: "quieter", textKey: "ecReflectQuieter", scope: "connection" }
    }
    if (tension.kind === "deep_orbit" || tension.kind === "calm_resonance") {
      return { id: "stability", textKey: "ecReflectStability", scope: "connection" }
    }
    if (isNight && tension.kind === "strong_attraction") {
      return { id: "closer-tonight", textKey: "ecReflectCloserTonight", scope: "connection" }
    }
    if (rhythm.phase === "calm_flow" || reading.pacing === "slow") {
      return { id: "softer-rhythm", textKey: "ecReflectSofterRhythm", scope: "connection" }
    }
    return null
  }

  if (silence.kind === "calm_silence") {
    return { id: "platform-calm", textKey: "ecReflectPlatformCalm", scope: "platform" }
  }
  if (tension.kind === "emotional_drift") {
    return { id: "drift", textKey: "ecReflectDrift", scope: "platform" }
  }

  return { id: "aware", textKey: "ecReflectAware", scope: "platform" }
}
