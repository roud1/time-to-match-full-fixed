import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ConnectionIntelligence } from "@/lib/intelligence"
import type { TranslationKey } from "@/lib/i18n"

export type EmotionalDistanceId =
  | "close"
  | "aligned"
  | "steady"
  | "fading"
  | "disconnected"

export type EmotionalDistance = {
  id: EmotionalDistanceId
  labelKey: TranslationKey
  descriptionKey: TranslationKey
  proximity: number
  atmosphereDim: number
  motionScale: number
}

export function resolveEmotionalDistance(
  analysis: ConnectionAnalysis,
  intelligence: ConnectionIntelligence | null
): EmotionalDistance {
  const deep = intelligence?.deepState.state

  if (deep === "emotional_distance" || analysis.emotionalState === "distant" || analysis.isDecaying) {
    return dist("disconnected", "presDistDisconnected", "presDistDisconnectedDesc", 0.2, 0.45, 0.78)
  }

  if (analysis.isDecaying || analysis.emotionalState === "fading") {
    return dist("fading", "presDistFading", "presDistFadingDesc", 0.42, 0.28, 0.88)
  }

  if (deep === "emotional_resonance" || analysis.emotionalState === "aligned") {
    return dist("aligned", "presDistAligned", "presDistAlignedDesc", 0.92, 0, 1.04)
  }

  if (deep === "attachment_formation" || analysis.bondLevel === "deep") {
    return dist("close", "presDistClose", "presDistCloseDesc", 0.85, 0.05, 1.02)
  }

  return dist("steady", "presDistSteady", "presDistSteadyDesc", 0.65, 0.12, 0.95)
}

function dist(
  id: EmotionalDistanceId,
  labelKey: TranslationKey,
  descriptionKey: TranslationKey,
  proximity: number,
  atmosphereDim: number,
  motionScale: number
): EmotionalDistance {
  return { id, labelKey, descriptionKey, proximity, atmosphereDim, motionScale }
}

export function distanceCss(distance: EmotionalDistance): Record<string, string> {
  return {
    "--pres-proximity": String(distance.proximity),
    "--pres-dist-dim": String(distance.atmosphereDim),
    "--pres-dist-motion": String(distance.motionScale),
  }
}

export function distanceAttrs(distance: EmotionalDistance): Record<string, string> {
  return { "data-pres-distance": distance.id }
}
