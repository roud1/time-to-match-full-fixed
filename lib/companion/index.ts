/**
 * Phase 15 — Invisible AI Emotional Companion (no chatbot, no assistant UI).
 */
export {
  type PresenceObservation,
  type PresenceObservationKind,
  buildPresenceObservations,
  pickPresenceObservation,
} from "@/lib/companion/emotional-presence"

export {
  type RelationshipReflection,
  buildRelationshipReflection,
  acknowledgeReflection,
} from "@/lib/companion/relationship-reflections"

export {
  type EmotionalMomentSignal,
  type EmotionalMomentKind,
  detectEmotionalMoment,
} from "@/lib/companion/emotional-moments"

export { type CompanionStory, buildCompanionStory } from "@/lib/companion/storytelling"

export {
  type CompanionAtmosphere,
  deriveCompanionAtmosphere,
  companionAtmosphereCss,
  companionAtmosphereAttrs,
} from "@/lib/companion/atmosphere"

export { type EmotionalCompanion, analyzeEmotionalCompanion } from "@/lib/companion/analyze"

export { type PlatformPresenceLine, pickPlatformPresenceLine } from "@/lib/companion/platform-presence"
