import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { SyncMetrics } from "@/client/lib/sync-system"
import type { AtmosphereEvolution } from "@/client/lib/reality/atmosphere-evolution"
import type { RelationshipEnvironment } from "@/client/lib/reality/relationship-environment"

export type ConnectionEnergyProfile = {
  waveAmplitude: number
  waveSpeed: number
  trailOpacity: number
  particleRate: number
  resonanceMotion: number
  syncPercent: number
}

export function buildConnectionEnergy(
  environment: RelationshipEnvironment,
  evolution: AtmosphereEvolution,
  analysis: ConnectionAnalysis,
  syncMetrics: SyncMetrics | null
): ConnectionEnergyProfile {
  const syncPercent = syncMetrics?.syncPercent ?? analysis.syncPercent

  return {
    syncPercent,
    waveAmplitude: 0.15 + environment.depth * 0.35 + evolution.intensity * 0.25,
    waveSpeed: 0.6 + environment.motionPace * 0.5,
    trailOpacity: 0.12 + evolution.warmth * 0.35,
    particleRate: environment.particleDensity * (0.5 + syncPercent / 200),
    resonanceMotion: 0.4 + evolution.intensity * 0.45,
  }
}

export function energyCss(energy: ConnectionEnergyProfile): Record<string, string> {
  return {
    "--real-wave-amp": String(energy.waveAmplitude),
    "--real-wave-speed": String(energy.waveSpeed),
    "--real-trail": String(energy.trailOpacity),
    "--real-particle-rate": String(energy.particleRate),
    "--real-resonance": String(energy.resonanceMotion),
    "--real-sync": String(energy.syncPercent),
  }
}
