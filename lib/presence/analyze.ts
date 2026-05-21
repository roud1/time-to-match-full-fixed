import type { ConnectionView } from "@/lib/connection-system"
import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ConnectionIntelligence } from "@/lib/intelligence"
import type { SyncMetrics } from "@/lib/sync-system"
import type { ChatThread } from "@/lib/social-store"
import { resolveEmotionalPresence, type EmotionalPresence } from "@/lib/world"
import {
  resolveEmotionalDistance,
  distanceCss,
  distanceAttrs,
  type EmotionalDistance,
} from "@/lib/presence/emotional-distance"
import {
  resolveSharedPresence,
  sharedPresenceCss,
  sharedPresenceAttrs,
  type SharedPresence,
} from "@/lib/presence/shared-presence"
import { resolveSilentPresence, type SilentPresenceSignal } from "@/lib/presence/silent-interaction"
import { buildPresenceInsight, type PresenceInsight } from "@/lib/presence/presence-insights"
import {
  deriveConnectionResonance,
  resonanceCss,
  type ConnectionResonance,
} from "@/lib/presence/connection-resonance"
import {
  resolveLateNightPresence,
  lateNightCss,
  lateNightAttrs,
  type LateNightPresence,
} from "@/lib/presence/late-night-presence"

export type EmotionalPresenceSystem = {
  presence: EmotionalPresence
  distance: EmotionalDistance
  shared: SharedPresence
  silent: SilentPresenceSignal
  resonance: ConnectionResonance
  insight: PresenceInsight | null
  lateNight: LateNightPresence
  style: Record<string, string>
  attrs: Record<string, string>
}

export function analyzeEmotionalPresenceSystem(
  profileId: number,
  options: {
    thread?: ChatThread | null
    view?: ConnectionView | null
    syncMetrics?: SyncMetrics | null
    analysis: ConnectionAnalysis
    intelligence?: ConnectionIntelligence | null
    hour?: number
    recentActivity?: boolean
    syncSurge?: boolean
    baseStyle?: Record<string, string>
    baseAttrs?: Record<string, string>
  }
): EmotionalPresenceSystem {
  const hour = options.hour ?? new Date().getHours()
  const presence = resolveEmotionalPresence(profileId, {
    thread: options.thread,
    view: options.view,
    syncMetrics: options.syncMetrics,
    hour,
  })
  const distance = resolveEmotionalDistance(options.analysis, options.intelligence ?? null)
  const shared = resolveSharedPresence(profileId, options.syncMetrics ?? null, options.analysis, {
    recentActivity: options.recentActivity,
    userActive: options.recentActivity,
  })
  const silent = resolveSilentPresence(presence, options.analysis, shared, {
    syncSurge: options.syncSurge,
  })
  const resonance = deriveConnectionResonance(
    presence,
    distance,
    shared,
    options.analysis
  )
  const lateNight = resolveLateNightPresence(hour)
  const insight = buildPresenceInsight(profileId, presence, distance, shared, hour)

  return {
    presence,
    distance,
    shared,
    silent,
    resonance,
    insight,
    lateNight,
    style: {
      ...(options.baseStyle ?? {}),
      ...distanceCss(distance),
      ...sharedPresenceCss(shared),
      ...resonanceCss(resonance),
      ...lateNightCss(lateNight),
      "--presence-pulse": String(presence.pulseLevel),
      "--presence-hue": String(presence.glowHue),
    },
    attrs: {
      ...(options.baseAttrs ?? {}),
      ...distanceAttrs(distance),
      ...sharedPresenceAttrs(shared),
      ...lateNightAttrs(lateNight),
      "data-presence-kind": presence.kind,
      "data-presence-system": "true",
      ...(silent.active ? { "data-pres-silent": silent.kind } : {}),
    },
  }
}
