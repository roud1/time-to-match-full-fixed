/**
 * Phase 18 — Emotional Presence System (presence without messages).
 */
export {
  type EmotionalDistanceId,
  type EmotionalDistance,
  resolveEmotionalDistance,
  distanceCss,
  distanceAttrs,
} from "@/lib/presence/emotional-distance"

export {
  type SharedPresence,
  resolveSharedPresence,
  sharedPresenceCss,
  sharedPresenceAttrs,
} from "@/lib/presence/shared-presence"

export {
  type SilentPresenceKind,
  type SilentPresenceSignal,
  resolveSilentPresence,
} from "@/lib/presence/silent-interaction"

export {
  type PresenceInsight,
  buildPresenceInsight,
  canShowPresenceInsight,
  markPresenceInsightShown,
} from "@/lib/presence/presence-insights"

export {
  type ConnectionResonance,
  deriveConnectionResonance,
  resonanceCss,
} from "@/lib/presence/connection-resonance"

export {
  type LateNightPresence,
  resolveLateNightPresence,
  lateNightCss,
  lateNightAttrs,
} from "@/lib/presence/late-night-presence"

export {
  type EmotionalPresenceSystem,
  analyzeEmotionalPresenceSystem,
} from "@/lib/presence/analyze"

export {
  PRESENCE_REALTIME_EVENT,
  broadcastPresenceUpdate,
  presenceTransitionMs,
  type PresenceRealtimeDetail,
} from "@/lib/presence/realtime-presence"
