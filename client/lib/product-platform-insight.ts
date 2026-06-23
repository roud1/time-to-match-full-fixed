import type { EmotionalReflectionV2 } from "@/client/lib/emotional-consciousness"
import type { EmotionalOrchestration } from "@/client/lib/emotional-os"
import type { RelationshipNarrative } from "@/client/lib/reality-expansion"
import type { EnergyWhisper } from "@/client/lib/network"
import type { TranslationKey } from "@/client/lib/i18n"

export type PlatformInsight =
  | { kind: "reflection"; reflection: EmotionalReflectionV2 }
  | { kind: "narrative"; narrative: RelationshipNarrative }
  | { kind: "energy"; messageKey: TranslationKey }
  | { kind: "orchestrator"; textKey: TranslationKey }

type PickPlatformInsightInput = {
  reflection: EmotionalReflectionV2 | null
  narrative: RelationshipNarrative | null
  orchestration: EmotionalOrchestration
  energy: EnergyWhisper | null
}

/** One platform line at a time — avoids whisper stacking in the shell. */
export function pickPlatformInsight(input: PickPlatformInsightInput): PlatformInsight | null {
  if (input.reflection?.scope === "platform") {
    return { kind: "reflection", reflection: input.reflection }
  }
  if (input.narrative?.scope === "platform") {
    return { kind: "narrative", narrative: input.narrative }
  }
  if (input.energy) {
    return { kind: "energy", messageKey: input.energy.messageKey }
  }
  if (input.orchestration.whisperKey) {
    return { kind: "orchestrator", textKey: input.orchestration.whisperKey }
  }
  return null
}
