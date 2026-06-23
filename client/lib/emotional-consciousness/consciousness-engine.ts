import { getConnection } from "@/client/lib/connection-store"
import { buildConnectionView } from "@/client/lib/connection-system"
import { analyzeConnection, extractSignals } from "@/client/lib/connection-engine"
import type { ConnectionHubSnapshot } from "@/client/lib/emotional-os/connection-hub"
import type { ChatMessage } from "@/client/lib/social-store"
import type { TranslationKey } from "@/client/lib/i18n"

export type ConsciousnessReading = {
  pacing: "slow" | "balanced" | "urgent"
  consistency: number
  attachmentSignal: number
  depthSense: number
  rhythmLabelKey: TranslationKey
  aware: boolean
}

export function analyzeConsciousnessReading(
  hub: ConnectionHubSnapshot,
  messages: ChatMessage[],
  profileId?: number
): ConsciousnessReading {
  let consistency = 0.55
  let pacing: ConsciousnessReading["pacing"] = "balanced"
  let attachmentSignal = hub.attachmentDepth / 100
  let depthSense = hub.platformSync / 100
  let rhythmLabelKey: TranslationKey = "ecRhythmBalanced"

  if (profileId != null) {
    const record = getConnection(profileId)
    if (record) {
      const view = buildConnectionView(record)
      const analysis = analyzeConnection(view, messages, record)
      const signals = extractSignals(messages, record)
      depthSense = Math.min(1, analysis.bondPercent / 100 * 0.5 + analysis.syncPercent / 100 * 0.5)
      attachmentSignal = Math.min(
        1,
        (record.streakDays / 7) * 0.35 + analysis.chemistryPercent / 100 * 0.4
      )
      const ratio = signals.oneSidedRatio
      consistency = Math.max(0.2, 1 - ratio * 0.65)
      if (signals.avgReplyMs != null && signals.avgReplyMs < 20 * 60 * 1000) {
        pacing = "urgent"
        rhythmLabelKey = "ecRhythmUrgent"
      } else if (signals.idleMs > 12 * 60 * 60 * 1000) {
        pacing = "slow"
        rhythmLabelKey = "ecRhythmSlow"
      }
    }
  } else {
    rhythmLabelKey =
      hub.dominantEmotionalState === "fading"
        ? "ecRhythmFading"
        : hub.dominantEmotionalState === "aligned"
          ? "ecRhythmAligned"
          : "ecRhythmBalanced"
  }

  return {
    pacing,
    consistency,
    attachmentSignal,
    depthSense,
    rhythmLabelKey,
    aware: hub.activeCount > 0 || messages.length > 0,
  }
}

export function consciousnessCss(r: ConsciousnessReading): Record<string, string> {
  return {
    "--ec-conscious-depth": String(r.depthSense),
    "--ec-attachment": String(r.attachmentSignal),
    "--ec-consistency": String(r.consistency),
  }
}
