import type { ConnectionHubSnapshot } from "@/lib/emotional-os/connection-hub"
import type { GlobalAtmosphereTokens } from "@/lib/world/global-atmosphere"
import type { TranslationKey } from "@/lib/i18n"

export type PlatformMood = "dormant" | "rising" | "steady" | "intimate" | "softening"

/** Global emotional atmosphere network — living platform mood. */
export type AtmosphereNetworkState = {
  mood: PlatformMood
  wavePhase: number
  waveAmplitude: number
  cinematicNight: boolean
  syncAmbience: number
  labelKey: TranslationKey
}

export function deriveAtmosphereNetwork(
  hub: ConnectionHubSnapshot,
  atmosphere: GlobalAtmosphereTokens,
  hour = new Date().getHours()
): AtmosphereNetworkState {
  const cinematicNight = atmosphere.period === "night" || hour >= 22 || hour < 5
  const sync = hub.platformSync

  let mood: PlatformMood = "steady"
  let labelKey: TranslationKey = "eoNetworkMoodSteady"

  if (hub.activeCount === 0) {
    mood = "dormant"
    labelKey = "eoNetworkMoodDormant"
  } else if (hub.hasFading && sync < 40) {
    mood = "softening"
    labelKey = "eoNetworkMoodSoft"
  } else if (sync >= 70 && hub.chemistryIndex >= 55) {
    mood = "intimate"
    labelKey = "eoNetworkMoodIntimate"
  } else if (hub.rhythmIndex >= 55 && hub.dominantEmotionalState === "electric") {
    mood = "rising"
    labelKey = "eoNetworkMoodRising"
  }

  const waveAmplitude =
    mood === "dormant"
      ? 0.12
      : mood === "intimate"
        ? 0.55 + sync / 250
        : mood === "rising"
          ? 0.45
          : 0.28

  const wavePhase = (hour * 0.04 + sync / 100) % 1

  return {
    mood,
    wavePhase,
    waveAmplitude,
    cinematicNight,
    syncAmbience: Math.min(1, 0.2 + sync / 120 + atmosphere.glowWarmth * 0.3),
    labelKey,
  }
}

export function networkCss(n: AtmosphereNetworkState): Record<string, string> {
  return {
    "--eo-network-mood": n.mood,
    "--eo-wave-phase": String(n.wavePhase),
    "--eo-wave-amp": String(n.waveAmplitude),
    "--eo-sync-ambience": String(n.syncAmbience),
  }
}

export function networkAttrs(n: AtmosphereNetworkState): Record<string, string> {
  return {
    "data-eo-network": n.mood,
    ...(n.cinematicNight ? { "data-eo-cinematic-night": "true" } : {}),
  }
}
