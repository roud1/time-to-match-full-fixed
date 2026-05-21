import type { ConnectionIntelligence } from "@/lib/intelligence"
import type { TranslationKey } from "@/lib/i18n"
import { canShowReflection, markReflectionShown } from "@/lib/companion/reflection-cooldown"

export type RelationshipReflection = {
  id: string
  textKey: TranslationKey
  subKey?: TranslationKey
}

export function buildRelationshipReflection(
  profileId: number,
  intelligence: ConnectionIntelligence,
  options?: { force?: boolean }
): RelationshipReflection | null {
  if (!options?.force && !canShowReflection(profileId)) return null

  const { deepState, rhythm, forecast, compatibility } = intelligence

  let textKey: TranslationKey = "compReflectSteady"
  let subKey: TranslationKey | undefined = "compReflectSteadySub"

  if (deepState.state === "attachment_formation") {
    textKey = "compReflectAttachment"
    subKey = "compReflectAttachmentSub"
  } else if (deepState.state === "emotional_resonance") {
    textKey = "compReflectResonance"
    subKey = "compReflectResonanceSub"
  } else if (rhythm.type === "intense_chemistry") {
    textKey = "compReflectChemistry"
    subKey = "compReflectChemistrySub"
  } else if (forecast.tone === "rising" && compatibility.compatibilityScore >= 60) {
    textKey = "compReflectGrowing"
    subKey = "compReflectGrowingSub"
  } else if (forecast.tone === "softening") {
    textKey = "compReflectSoftening"
    subKey = "compReflectSofteningSub"
  }

  return {
    id: `reflect-${profileId}-${textKey}`,
    textKey,
    subKey,
  }
}

export function acknowledgeReflection(profileId: number) {
  markReflectionShown(profileId)
}
