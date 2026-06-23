import type { ConnectionView } from "@/client/lib/connection-system"
import type { SyncMetrics } from "@/client/lib/sync-system"
import type { ChatThread } from "@/client/lib/social-store"
import type { TranslationKey } from "@/client/lib/i18n"
import { demoPeerPresence } from "@/client/lib/profile-life"

/** Phase 12 — emotional presence (not binary online/offline). */
export type EmotionalPresenceKind =
  | "energy_active"
  | "connection_nearby"
  | "emotionally_present"
  | "sync_active_tonight"
  | "deep_night_energy"
  | "quiet_presence"
  | "distant_field"

export type EmotionalPresence = {
  kind: EmotionalPresenceKind
  labelKey: TranslationKey
  pulseLevel: number
  glowHue: number
}

const LABELS: Record<EmotionalPresenceKind, TranslationKey> = {
  energy_active: "presenceEnergyActive",
  connection_nearby: "presenceConnectionNearby",
  emotionally_present: "presenceEmotionallyPresent",
  sync_active_tonight: "presenceSyncTonight",
  deep_night_energy: "presenceDeepNight",
  quiet_presence: "presenceQuiet",
  distant_field: "presenceDistantField",
}

function isEveningSyncWindow(hour: number): boolean {
  return hour >= 18 && hour < 24
}

function isDeepNight(hour: number): boolean {
  return hour >= 22 || hour < 5
}

export function resolveEmotionalPresence(
  profileId: number,
  options?: {
    thread?: ChatThread | null
    view?: ConnectionView | null
    syncMetrics?: SyncMetrics | null
    hour?: number
  }
): EmotionalPresence {
  const hour = options?.hour ?? new Date().getHours()
  const tier = demoPeerPresence(profileId)
  const view = options?.view
  const sync = options?.syncMetrics?.syncPercent ?? 0
  const evening = isEveningSyncWindow(hour)

  if (view && isDeepNight(hour) && sync >= 65) {
    return { kind: "deep_night_energy", labelKey: LABELS.deep_night_energy, pulseLevel: 0.88, glowHue: 268 }
  }

  if (view && sync >= 88 && evening) {
    return { kind: "sync_active_tonight", labelKey: LABELS.sync_active_tonight, pulseLevel: 0.95, glowHue: 280 }
  }

  if (view && sync >= 72 && (view.streakDays >= 1 || view.isStable)) {
    return { kind: "emotionally_present", labelKey: LABELS.emotionally_present, pulseLevel: 0.82, glowHue: 265 }
  }

  if (tier === "active" && sync >= 55) {
    return { kind: "energy_active", labelKey: LABELS.energy_active, pulseLevel: 0.9, glowHue: 250 }
  }

  if (tier === "active" || tier === "recent") {
    return { kind: "connection_nearby", labelKey: LABELS.connection_nearby, pulseLevel: 0.65, glowHue: 240 }
  }

  if (view?.isFading || tier === "fading") {
    return { kind: "distant_field", labelKey: LABELS.distant_field, pulseLevel: 0.28, glowHue: 220 }
  }

  return { kind: "quiet_presence", labelKey: LABELS.quiet_presence, pulseLevel: 0.4, glowHue: 230 }
}

export function isEmotionallyReachable(presence: EmotionalPresence): boolean {
  return presence.kind !== "distant_field" && presence.kind !== "quiet_presence"
}
