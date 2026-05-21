/**
 * Relationship Identity System — Phase 4
 * Each connection has unique personality, aura, moments, and evolution.
 */

export type {
  RelationshipPersonality,
  RelationshipMoment,
  RelationshipMomentId,
  RelationshipIdentity,
  ConnectionAuraProfile,
  ConnectionEvolutionStage,
  AnyConnectionPersonality,
} from "@/lib/relationship-identity/types"

export {
  normalizePersonality,
  getRelationshipPersonalityLabel,
  resolveRelationshipPersonality,
  resolveEvolutionStage,
  evolutionProgress,
  evolvePersonality,
} from "@/lib/relationship-identity/personality"

export {
  buildConnectionAura,
  auraCssVars,
  auraDataAttributes,
} from "@/lib/relationship-identity/aura"

export { buildRelationshipMoments } from "@/lib/relationship-identity/moments"

export {
  getRelationshipIdentity,
  persistRelationshipIdentity,
} from "@/lib/relationship-identity/store"
