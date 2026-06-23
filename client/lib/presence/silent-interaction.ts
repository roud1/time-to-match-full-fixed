import type { EmotionalPresence } from "@/client/lib/world"
import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { SharedPresence } from "@/client/lib/presence/shared-presence"
import type { TranslationKey } from "@/client/lib/i18n"

export type SilentPresenceKind = "resonance_pulse" | "quiet_field" | "sync_echo" | "none"

export type SilentPresenceSignal = {
  kind: SilentPresenceKind
  active: boolean
  pulse: number
  hintKey?: TranslationKey
}

export function resolveSilentPresence(
  presence: EmotionalPresence,
  analysis: ConnectionAnalysis,
  shared: SharedPresence,
  options?: { syncSurge?: boolean }
): SilentPresenceSignal {
  if (options?.syncSurge) {
    return {
      kind: "sync_echo",
      active: true,
      pulse: 0.9,
      hintKey: "presSilentSyncEcho",
    }
  }

  if (shared.active && analysis.syncPercent >= 70) {
    return {
      kind: "resonance_pulse",
      active: true,
      pulse: presence.pulseLevel,
      hintKey: "presSilentResonance",
    }
  }

  if (presence.kind === "quiet_presence" || presence.kind === "distant_field") {
    return {
      kind: "quiet_field",
      active: true,
      pulse: presence.pulseLevel * 0.6,
      hintKey: "presSilentQuiet",
    }
  }

  return { kind: "none", active: false, pulse: 0 }
}
