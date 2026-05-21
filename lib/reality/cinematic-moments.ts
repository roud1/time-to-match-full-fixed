import type { EmotionalCompanion } from "@/lib/companion"
import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { TranslationKey } from "@/lib/i18n"

export type CinematicMomentKind =
  | "sync_peak"
  | "breakthrough"
  | "chemistry"
  | "attachment"

export type CinematicMomentState = {
  kind: CinematicMomentKind
  active: boolean
  titleKey: TranslationKey
  bodyKey: TranslationKey
  burst: number
  motionScale: number
}

export function resolveCinematicMoment(
  analysis: ConnectionAnalysis,
  companion: EmotionalCompanion | null,
  options?: { syncSurge?: boolean }
): CinematicMomentState | null {
  if (options?.syncSurge) {
    return burst("sync_peak", "realCineSyncTitle", "realCineSyncBody", 0.95, 1.15)
  }

  const moment = companion?.moment
  if (!moment?.active) return null

  if (moment.kind === "sync_surge" || moment.kind === "peak") {
    return burst("sync_peak", moment.titleKey, moment.bodyKey, moment.intensity, 1.1)
  }
  if (moment.kind === "turning") {
    return burst("breakthrough", moment.titleKey, moment.bodyKey, moment.intensity, 1.08)
  }
  if (moment.kind === "attachment") {
    return burst("attachment", moment.titleKey, moment.bodyKey, moment.intensity, 1.05)
  }

  if (analysis.chemistryPercent >= 80) {
    return burst("chemistry", "realCineChemTitle", "realCineChemBody", 0.82, 1.06)
  }

  return null
}

function burst(
  kind: CinematicMomentKind,
  titleKey: TranslationKey,
  bodyKey: TranslationKey,
  burst: number,
  motionScale: number
): CinematicMomentState {
  return {
    kind,
    active: true,
    titleKey,
    bodyKey,
    burst,
    motionScale,
  }
}
