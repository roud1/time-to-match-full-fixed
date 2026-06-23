import type {
  AIAtmosphereProfile,
  AIConnectionAnalysis,
  AIConnectionState,
  ConnectionPersonality,
} from "@/client/lib/ai-connection-engine/types"
import { tierFromPercent } from "@/client/lib/connection-engine"
import type { SyncTier } from "@/client/lib/sync-system"

const STATE_GLOW: Record<AIConnectionState, number> = {
  growing_connection: 0.45,
  stable_bond: 0.62,
  deep_chemistry: 0.88,
  emotional_tension: 0.32,
  fading_energy: 0.18,
  high_compatibility: 0.95,
}

const PERSONALITY_WARMTH: Record<ConnectionPersonality, number> = {
  calm_connection: 0.55,
  intense_chemistry: 0.92,
  slow_burn: 0.38,
  emotional_chaos: 0.48,
  deep_compatibility: 0.78,
  deep_sync: 0.72,
  magnetic_chemistry: 0.9,
  night_energy: 0.65,
  stable_bond: 0.6,
  intense_attraction: 0.88,
}

/** Map AI output → realtime UI atmosphere (glow, motion, particles). */
export function buildAIAtmosphere(
  ai: AIConnectionAnalysis | null,
  syncPercent: number,
  connectionState: AIConnectionState,
  personality: ConnectionPersonality,
  isFading: boolean
): AIAtmosphereProfile {
  const level = ai?.atmosphereLevel ?? syncPercent
  const tier: SyncTier = tierFromPercent(syncPercent, isFading)
  const stateGlow = STATE_GLOW[connectionState]
  const warmth = PERSONALITY_WARMTH[personality]

  const energyMul =
    ai?.energy === "growing" ? 1.12 : ai?.energy === "cooling" ? 0.72 : ai?.energy === "fading" ? 0.5 : 1

  const glow = isFading
    ? 0.15 + (ai?.sync ?? syncPercent) / 500
    : Math.min(1, (level / 100) * 0.55 + stateGlow * 0.35 + warmth * 0.15) * energyMul

  const motion = isFading
    ? 0.35
    : Math.min(1, 0.3 + glow * 0.5 + (tier === "vibrant" || tier === "synced" ? 0.2 : 0))

  const particles = isFading
    ? 0
    : Math.min(1, glow * 0.85 * (tier === "synced" ? 1.15 : tier === "vibrant" ? 1 : 0.65))

  return {
    level,
    glow,
    motion,
    particles,
    warmth,
    depth: Math.min(1, (ai?.sync ?? syncPercent) / 100),
    tier,
    connectionState,
    personality,
    emotionalState: ai?.emotionalState ?? "curious",
  }
}
