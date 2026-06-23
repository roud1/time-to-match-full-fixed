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
} from "@/client/lib/relationship-identity/types"

export {
  normalizePersonality,
  getRelationshipPersonalityLabel,
  resolveRelationshipPersonality,
  resolveEvolutionStage,
  evolutionProgress,
  evolvePersonality,
} from "@/client/lib/relationship-identity/personality"

export {
  buildConnectionAura,
  auraCssVars,
  auraDataAttributes,
} from "@/client/lib/relationship-identity/aura"

export { buildRelationshipMoments } from "@/client/lib/relationship-identity/moments"

export {
  getRelationshipIdentity,
  persistRelationshipIdentity,
} from "@/client/lib/relationship-identity/store"
