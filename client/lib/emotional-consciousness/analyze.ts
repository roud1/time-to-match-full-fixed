import type { EmotionalOperatingSystem } from "@/client/lib/emotional-os/types"
import type { EmotionalRealityExpansion } from "@/client/lib/reality-expansion/types"
import type { EmotionalConsciousness } from "@/client/lib/emotional-consciousness/types"
import {
  analyzeConsciousnessReading,
  consciousnessCss,
} from "@/client/lib/emotional-consciousness/consciousness-engine"
import {
  analyzeSilenceUnderstanding,
  silenceAttrs,
  silenceCss,
} from "@/client/lib/emotional-consciousness/silence-understanding"
import {
  deriveRelationshipTension,
  tensionAttrs,
  tensionCss,
} from "@/client/lib/emotional-consciousness/relationship-tension"
import { buildEmotionalReflectionV2 } from "@/client/lib/emotional-consciousness/reflections-v2"
import {
  analyzeSpaceEvolution,
  spaceEvolutionAttrs,
  spaceEvolutionCss,
} from "@/client/lib/emotional-consciousness/space-evolution"
import { orchestrateAtmosphericConsciousness, atmosphericCss } from "@/client/lib/emotional-consciousness/atmospheric-ai"
import { analyzeMemoryEchoes, memoryEchoAttrs, memoryEchoCss } from "@/client/lib/emotional-consciousness/memory-echoes"
import type { Locale } from "@/client/lib/i18n"
import type { ChatMessage } from "@/client/lib/social-store"

export function analyzeEmotionalConsciousness(
  os: EmotionalOperatingSystem,
  expansion: EmotionalRealityExpansion,
  options?: {
    locale?: Locale
    profileId?: number
    messages?: ChatMessage[]
    hour?: number
  }
): EmotionalConsciousness {
  const messages = options?.messages ?? []
  const reading = analyzeConsciousnessReading(os.hub, messages, options?.profileId)
  const silence = analyzeSilenceUnderstanding(os.hub, reading, messages, options?.profileId)
  const tension = deriveRelationshipTension(os.hub, reading, silence)
  const reflection = buildEmotionalReflectionV2(
    os.hub,
    reading,
    silence,
    tension,
    expansion.rhythm,
    { profileId: options?.profileId, hour: options?.hour }
  )
  const space =
    options?.profileId != null
      ? analyzeSpaceEvolution(options.profileId, messages, reading, tension)
      : null
  const atmosphere = orchestrateAtmosphericConsciousness(os, expansion, reading, silence, tension)
  const echoes = analyzeMemoryEchoes(expansion, reading)

  const style: Record<string, string> = {
    ...consciousnessCss(reading),
    ...silenceCss(silence),
    ...tensionCss(tension),
    ...atmosphericCss(atmosphere),
    ...memoryEchoCss(echoes),
    ...(space ? spaceEvolutionCss(space) : {}),
  }

  const attrs: Record<string, string> = {
    ...silenceAttrs(silence),
    ...tensionAttrs(tension),
    ...memoryEchoAttrs(echoes),
    ...(space ? spaceEvolutionAttrs(space) : {}),
    "data-emotional-consciousness": "true",
    "data-ec-aware": reading.aware ? "true" : "false",
  }

  return {
    reading,
    silence,
    tension,
    reflection,
    space,
    atmosphere,
    echoes,
    style,
    attrs,
  }
}
