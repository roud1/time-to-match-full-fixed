/**
 * Phase 15 — Invisible AI Emotional Companion (no chatbot, no assistant UI).
 */
export {
  type PresenceObservation,
  type PresenceObservationKind,
  buildPresenceObservations,
  pickPresenceObservation,
} from "@/client/lib/companion/emotional-presence"

export {
  type RelationshipReflection,
  buildRelationshipReflection,
  acknowledgeReflection,
} from "@/client/lib/companion/relationship-reflections"

export {
  type EmotionalMomentSignal,
  type EmotionalMomentKind,
  detectEmotionalMoment,
} from "@/client/lib/companion/emotional-moments"

export { type CompanionStory, buildCompanionStory } from "@/client/lib/companion/storytelling"

export {
  type CompanionAtmosphere,
  deriveCompanionAtmosphere,
  companionAtmosphereCss,
  companionAtmosphereAttrs,
} from "@/client/lib/companion/atmosphere"

export { type EmotionalCompanion, analyzeEmotionalCompanion } from "@/client/lib/companion/analyze"

export { type PlatformPresenceLine, pickPlatformPresenceLine } from "@/client/lib/companion/platform-presence"
