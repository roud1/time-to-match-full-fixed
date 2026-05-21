import type { ConnectionHubSnapshot } from "@/lib/emotional-os/connection-hub"
import type { RelationshipWeather } from "@/lib/reality-expansion/relationship-weather"
import type { EmotionalLifeRhythm } from "@/lib/reality-expansion/life-rhythm"

export type PresenceImmersion = {
  proximity: number
  auraRadius: number
  resonancePulse: number
  syncMovement: number
  fieldOpacity: number
}

export function derivePresenceImmersion(
  hub: ConnectionHubSnapshot,
  rhythm: EmotionalLifeRhythm,
  weather: RelationshipWeather,
  profileProximity?: number
): PresenceImmersion {
  const base = profileProximity ?? hub.attachmentDepth / 100
  const proximity = Math.min(1, base * 0.6 + (hub.platformSync / 100) * 0.35)

  return {
    proximity,
    auraRadius: 0.35 + proximity * 0.45 + weather.glowMul * 0.1,
    resonancePulse: Math.min(1, rhythm.energyCycle * 0.5 + weather.intensity * 0.4),
    syncMovement: weather.motionScale * rhythm.energyCycle * 0.85,
    fieldOpacity: 0.12 + proximity * 0.28,
  }
}

export function presenceImmersionCss(p: PresenceImmersion): Record<string, string> {
  return {
    "--er-proximity": String(p.proximity),
    "--er-aura-radius": String(p.auraRadius),
    "--er-res-pulse": String(p.resonancePulse),
    "--er-sync-move": String(p.syncMovement),
    "--er-field-opacity": String(p.fieldOpacity),
  }
}

export function presenceImmersionAttrs(p: PresenceImmersion): Record<string, string> {
  return {
    "data-er-presence-immersion": p.proximity >= 0.55 ? "near" : "distant",
  }
}
