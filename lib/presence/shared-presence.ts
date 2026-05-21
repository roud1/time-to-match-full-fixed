import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { SyncMetrics } from "@/lib/sync-system"
import { demoPeerPresence } from "@/lib/profile-life"
import type { TranslationKey } from "@/lib/i18n"

export type SharedPresence = {
  active: boolean
  togetherGlow: number
  atmosphereBoost: number
  labelKey: TranslationKey
}

export function resolveSharedPresence(
  profileId: number,
  syncMetrics: SyncMetrics | null,
  analysis: ConnectionAnalysis,
  options?: { recentActivity?: boolean; userActive?: boolean }
): SharedPresence {
  const peerTier = demoPeerPresence(profileId)
  const peerNear = peerTier === "active" || peerTier === "recent"
  const userActive = options?.userActive ?? options?.recentActivity ?? false
  const sync = syncMetrics?.syncPercent ?? analysis.syncPercent
  const active = userActive && peerNear && sync >= 58

  return {
    active,
    togetherGlow: active ? Math.min(1, 0.55 + sync / 200) : 0,
    atmosphereBoost: active ? 0.22 : 0,
    labelKey: active ? "presSharedTogether" : "presSharedApart",
  }
}

export function sharedPresenceCss(shared: SharedPresence): Record<string, string> {
  if (!shared.active) return {}
  return {
    "--pres-together-glow": String(shared.togetherGlow),
    "--pres-atmo-boost": String(shared.atmosphereBoost),
  }
}

export function sharedPresenceAttrs(shared: SharedPresence): Record<string, string> {
  return shared.active ? { "data-pres-shared": "true" } : { "data-pres-shared": "false" }
}
