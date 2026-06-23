import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { EmotionalPresence } from "@/client/lib/world"
import type { SharedPresence } from "@/client/lib/presence/shared-presence"
import type { EmotionalDistance } from "@/client/lib/presence/emotional-distance"

export type ConnectionResonance = {
  level: number
  pulseAlign: number
  auraMerge: number
  waveIntensity: number
}

export function deriveConnectionResonance(
  presence: EmotionalPresence,
  distance: EmotionalDistance,
  shared: SharedPresence,
  analysis: ConnectionAnalysis
): ConnectionResonance {
  const base = presence.pulseLevel * distance.proximity
  const sharedBoost = shared.active ? shared.togetherGlow * 0.35 : 0
  const syncFactor = analysis.syncPercent / 100

  const level = Math.min(1, base * 0.5 + syncFactor * 0.45 + sharedBoost)

  return {
    level,
    pulseAlign: shared.active ? Math.min(1, 0.7 + syncFactor * 0.25) : syncFactor * 0.5,
    auraMerge: shared.active ? 0.55 + level * 0.35 : level * 0.2,
    waveIntensity: 0.15 + level * 0.5,
  }
}

export function resonanceCss(resonance: ConnectionResonance): Record<string, string> {
  return {
    "--pres-resonance": String(resonance.level),
    "--pres-pulse-align": String(resonance.pulseAlign),
    "--pres-aura-merge": String(resonance.auraMerge),
    "--pres-wave-intensity": String(resonance.waveIntensity),
  }
}
