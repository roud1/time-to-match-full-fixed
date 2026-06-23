import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { CompatibilityIntelligence } from "@/client/lib/intelligence/compatibility-engine"
import type { RelationshipRhythmType } from "@/client/lib/intelligence/relationship-rhythm"
import type { TranslationKey } from "@/client/lib/i18n"

export type ConnectionForecastTone = "rising" | "steady" | "softening" | "uncertain"

export type ConnectionForecast = {
  tone: ConnectionForecastTone
  insightKey: TranslationKey
  secondaryKey?: TranslationKey
}

export function buildConnectionForecast(
  analysis: ConnectionAnalysis,
  compatibility: CompatibilityIntelligence,
  rhythmType: RelationshipRhythmType
): ConnectionForecast {
  if (analysis.isDecaying || rhythmType === "unstable") {
    return {
      tone: "softening",
      insightKey: "intelForecastSoftening",
      secondaryKey: "intelForecastSofteningSub",
    }
  }

  if (analysis.momentum > 0.22 || compatibility.consistencyScore >= 65) {
    return {
      tone: "rising",
      insightKey: "intelForecastRising",
      secondaryKey: "intelForecastRisingSub",
    }
  }

  if (rhythmType === "slow_burn" || rhythmType === "calm_connection") {
    return {
      tone: "steady",
      insightKey: "intelForecastSteady",
      secondaryKey: "intelForecastSteadySub",
    }
  }

  if (rhythmType === "intense_chemistry") {
    return {
      tone: "rising",
      insightKey: "intelForecastIntense",
      secondaryKey: "intelForecastIntenseSub",
    }
  }

  return {
    tone: "uncertain",
    insightKey: "intelForecastUncertain",
    secondaryKey: "intelForecastUncertainSub",
  }
}
