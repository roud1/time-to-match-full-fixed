import type { ConnectionIntelligence } from "@/lib/intelligence"
import type { TranslationKey } from "@/lib/i18n"

export type CompanionStory = {
  id: string
  headlineKey: TranslationKey
  bodyKey: TranslationKey
}

export function buildCompanionStory(
  intelligence: ConnectionIntelligence,
  messageCount: number
): CompanionStory | null {
  if (messageCount < 4) return null

  const hour = new Date().getHours()
  const evening = hour >= 18

  if (evening && intelligence.forecast.tone === "rising") {
    return {
      id: "story-tonight",
      headlineKey: "compStoryTonightHead",
      bodyKey: "compStoryTonightBody",
    }
  }

  if (intelligence.rhythm.type === "slow_burn" && intelligence.compatibility.consistencyScore >= 50) {
    return {
      id: "story-week",
      headlineKey: "compStoryWeekHead",
      bodyKey: "compStoryWeekBody",
    }
  }

  if (intelligence.deepState.state === "emotional_resonance") {
    return {
      id: "story-rhythm",
      headlineKey: "compStoryRhythmHead",
      bodyKey: "compStoryRhythmBody",
    }
  }

  return null
}
