import type { ConnectionHubSnapshot } from "@/lib/emotional-os/connection-hub"
import type { EmotionalLifeRhythm } from "@/lib/reality-expansion/life-rhythm"
import type { TranslationKey } from "@/lib/i18n"

export type WeatherKind =
  | "calm"
  | "storm"
  | "quiet_night"
  | "warm_glow"
  | "fading_light"

export type RelationshipWeather = {
  kind: WeatherKind
  intensity: number
  motionScale: number
  glowMul: number
  labelKey: TranslationKey
  descKey: TranslationKey
}

export function deriveRelationshipWeather(
  hub: ConnectionHubSnapshot,
  rhythm: EmotionalLifeRhythm,
  hour = new Date().getHours()
): RelationshipWeather {
  const isNight = hour >= 22 || hour < 5
  const sync = hub.platformSync

  if (hub.hasFading && sync < 40) {
    return weather("fading_light", 0.55, 0.78, 0.65, "erWeatherFading", "erWeatherFadingDesc")
  }

  if (rhythm.phase === "night_intimacy" || isNight) {
    return weather("quiet_night", 0.7, 0.72, 0.85, "erWeatherQuietNight", "erWeatherQuietNightDesc")
  }

  if (sync >= 72 && hub.chemistryIndex >= 60) {
    return weather("warm_glow", 0.8, 1.02, 1.1, "erWeatherWarm", "erWeatherWarmDesc")
  }

  if (hub.dominantEmotionalState === "electric" || hub.rhythmIndex >= 65) {
    return weather("storm", 0.75, 1.15, 1.05, "erWeatherStorm", "erWeatherStormDesc")
  }

  return weather("calm", 0.45, 0.92, 0.9, "erWeatherCalm", "erWeatherCalmDesc")
}

function weather(
  kind: WeatherKind,
  intensity: number,
  motionScale: number,
  glowMul: number,
  labelKey: TranslationKey,
  descKey: TranslationKey
): RelationshipWeather {
  return { kind, intensity, motionScale, glowMul, labelKey, descKey }
}

export function weatherCss(w: RelationshipWeather): Record<string, string> {
  return {
    "--er-weather-intensity": String(w.intensity),
    "--er-weather-motion": String(w.motionScale),
    "--er-weather-glow": String(w.glowMul),
  }
}

export function weatherAttrs(w: RelationshipWeather): Record<string, string> {
  return { "data-er-weather": w.kind }
}
