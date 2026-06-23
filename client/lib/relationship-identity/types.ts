/** Canonical relationship personality — each connection feels unique. */
export type RelationshipPersonality =
  | "slow_burn"
  | "deep_sync"
  | "emotional_chaos"
  | "calm_connection"
  | "magnetic_chemistry"
  | "night_energy"
  | "stable_bond"
  | "intense_attraction"

/** Legacy Phase 3 personalities → Phase 4 */
export type LegacyConnectionPersonality =
  | "intense_chemistry"
  | "deep_compatibility"

export type AnyConnectionPersonality = RelationshipPersonality | LegacyConnectionPersonality

export type RelationshipMomentId =
  | "first_deep_talk"
  | "three_night_talks"
  | "high_sync_week"
  | "strong_chemistry_period"
  | "fast_reply_streak"
  | "emotional_peak"
  | "first_message"
  | "long_night"

export type RelationshipMoment = {
  id: RelationshipMomentId
  at: number
  title: string
  subtitle?: string
  importance: number
  reached: boolean
}

export type ConnectionEvolutionStage = "forming" | "growing" | "deepening" | "peak" | "fading"

export type RelationshipIdentity = {
  profileId: number
  personality: RelationshipPersonality
  evolutionStage: ConnectionEvolutionStage
  evolutionProgress: number
  syncPercent: number
  moments: RelationshipMoment[]
  updatedAt: number
}

export type ConnectionAuraProfile = {
  personality: RelationshipPersonality
  glow: string
  gradientFrom: string
  gradientTo: string
  ringHue: string
  motion: "calm" | "flow" | "breathe" | "pulse" | "flicker"
  particles: "none" | "soft" | "cinematic" | "ember"
  warmth: number
  intensity: number
  chaos: number
}
