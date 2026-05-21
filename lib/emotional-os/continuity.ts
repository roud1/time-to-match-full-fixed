import type { ConnectionHubSnapshot } from "@/lib/emotional-os/connection-hub"

export type EmotionalContinuity = {
  active: boolean
  breathRate: number
  presenceRemain: number
  syncDrift: number
  atmosphereEvolves: boolean
}

/** Emotional continuity — bond breathes while user is away. */
export function deriveEmotionalContinuity(
  hub: ConnectionHubSnapshot,
  offlineMs = 0
): EmotionalContinuity {
  const away = offlineMs > 5 * 60 * 1000
  const sync = hub.platformSync

  const breathRate = away
    ? Math.max(0.15, 0.45 - offlineMs / (1000 * 60 * 60 * 8))
    : 0.65 + sync / 200

  const presenceRemain = hub.activeCount > 0 ? Math.min(1, 0.35 + sync / 130) : 0.15

  return {
    active: hub.activeCount > 0 || away,
    breathRate,
    presenceRemain,
    syncDrift: away ? Math.max(-8, -offlineMs / (1000 * 60 * 30)) : 0,
    atmosphereEvolves: away || hub.hasFading,
  }
}

export function continuityCss(c: EmotionalContinuity): Record<string, string> {
  return {
    "--eo-continuity-breath": String(c.breathRate),
    "--eo-presence-remain": String(c.presenceRemain),
  }
}

export function continuityAttrs(c: EmotionalContinuity): Record<string, string> {
  return c.active ? { "data-eo-continuity": "true" } : {}
}
