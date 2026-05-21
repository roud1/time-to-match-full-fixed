import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ConnectionIntelligence } from "@/lib/intelligence"
import { pickPresenceObservation } from "@/lib/companion/emotional-presence"
import { buildRelationshipReflection } from "@/lib/companion/relationship-reflections"
import { detectEmotionalMoment } from "@/lib/companion/emotional-moments"
import { buildCompanionStory } from "@/lib/companion/storytelling"
import {
  deriveCompanionAtmosphere,
  companionAtmosphereCss,
  companionAtmosphereAttrs,
  type CompanionAtmosphere,
} from "@/lib/companion/atmosphere"
import type { PresenceObservation } from "@/lib/companion/emotional-presence"
import type { RelationshipReflection } from "@/lib/companion/relationship-reflections"
import type { EmotionalMomentSignal } from "@/lib/companion/emotional-moments"
import type { CompanionStory } from "@/lib/companion/storytelling"

export type EmotionalCompanion = {
  intelligence: ConnectionIntelligence
  observation: PresenceObservation
  reflection: RelationshipReflection | null
  moment: EmotionalMomentSignal | null
  story: CompanionStory | null
  atmosphere: CompanionAtmosphere
  style: Record<string, string>
  attrs: Record<string, string>
}

export function analyzeEmotionalCompanion(
  profileId: number,
  intelligence: ConnectionIntelligence,
  analysis: ConnectionAnalysis,
  messageCount: number,
  options?: {
    syncSurge?: boolean
    recentActivity?: boolean
    showReflection?: boolean
  }
): EmotionalCompanion {
  const observation = pickPresenceObservation(intelligence, analysis)
  const reflection = options?.showReflection
    ? buildRelationshipReflection(profileId, intelligence)
    : null
  const moment = detectEmotionalMoment(intelligence, analysis, {
    syncSurge: options?.syncSurge,
    recentActivity: options?.recentActivity,
  })
  const story = buildCompanionStory(intelligence, messageCount)
  const atmosphere = deriveCompanionAtmosphere(intelligence)

  return {
    intelligence,
    observation,
    reflection,
    moment,
    story,
    atmosphere,
    style: {
      ...intelligence.uiStyle,
      ...companionAtmosphereCss(atmosphere),
    },
    attrs: {
      ...intelligence.uiAttrs,
      ...companionAtmosphereAttrs(
        atmosphere,
        intelligence.deepState.state,
        intelligence.rhythm.type
      ),
      "data-companion-active": "true",
      "data-comp-moment": moment?.kind ?? "none",
    },
  }
}
