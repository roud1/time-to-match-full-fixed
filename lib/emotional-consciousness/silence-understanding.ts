import { getConnection } from "@/lib/connection-store"
import { extractSignals } from "@/lib/connection-engine"
import type { ChatMessage } from "@/lib/social-store"
import type { ConsciousnessReading } from "@/lib/emotional-consciousness/consciousness-engine"
import type { ConnectionHubSnapshot } from "@/lib/emotional-os/connection-hub"
import type { TranslationKey } from "@/lib/i18n"

export type SilenceKind =
  | "calm_silence"
  | "distant_silence"
  | "emotional_pause"
  | "stable_quietness"
  | "fading_silence"

export type SilenceUnderstanding = {
  kind: SilenceKind
  depth: number
  stillness: number
  labelKey: TranslationKey
}

export function analyzeSilenceUnderstanding(
  hub: ConnectionHubSnapshot,
  reading: ConsciousnessReading,
  messages: ChatMessage[],
  profileId?: number
): SilenceUnderstanding {
  const record = profileId != null ? getConnection(profileId) : null
  const signals = record ? extractSignals(messages, record) : null
  const idleMs = signals?.idleMs ?? 0
  const oneSided = signals?.oneSidedRatio ?? 0

  let kind: SilenceKind = "stable_quietness"
  let labelKey: TranslationKey = "ecSilenceStable"

  if (hub.hasFading || hub.dominantEmotionalState === "fading") {
    kind = "fading_silence"
    labelKey = "ecSilenceFading"
  } else if (oneSided > 0.55 || idleMs > 24 * 60 * 60 * 1000) {
    kind = "distant_silence"
    labelKey = "ecSilenceDistant"
  } else if (idleMs > 4 * 60 * 60 * 1000 && messages.length > 2) {
    kind = "emotional_pause"
    labelKey = "ecSilencePause"
  } else if (reading.pacing === "slow" && reading.consistency > 0.6) {
    kind = "calm_silence"
    labelKey = "ecSilenceCalm"
  }

  const depth = Math.min(1, 0.25 + idleMs / (48 * 60 * 60 * 1000))
  const stillness = kind === "calm_silence" || kind === "stable_quietness" ? 0.55 : 0.75

  return { kind, depth, stillness, labelKey }
}

export function silenceCss(s: SilenceUnderstanding): Record<string, string> {
  return {
    "--ec-silence-depth": String(s.depth),
    "--ec-silence-still": String(s.stillness),
  }
}

export function silenceAttrs(s: SilenceUnderstanding): Record<string, string> {
  return { "data-ec-silence": s.kind }
}
