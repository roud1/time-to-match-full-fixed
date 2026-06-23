/**
 * Phase 18 — Emotional Presence System (presence without messages).
 */
export {
  type EmotionalDistanceId,
  type EmotionalDistance,
  resolveEmotionalDistance,
  distanceCss,
  distanceAttrs,
} from "@/client/lib/presence/emotional-distance"

export {
  type SharedPresence,
  resolveSharedPresence,
  sharedPresenceCss,
  sharedPresenceAttrs,
} from "@/client/lib/presence/shared-presence"

export {
  type SilentPresenceKind,
  type SilentPresenceSignal,
  resolveSilentPresence,
} from "@/client/lib/presence/silent-interaction"

export {
  type PresenceInsight,
  buildPresenceInsight,
  canShowPresenceInsight,
  markPresenceInsightShown,
} from "@/client/lib/presence/presence-insights"

export {
  type ConnectionResonance,
  deriveConnectionResonance,
  resonanceCss,
} from "@/client/lib/presence/connection-resonance"

export {
  type LateNightPresence,
  resolveLateNightPresence,
  lateNightCss,
  lateNightAttrs,
} from "@/client/lib/presence/late-night-presence"

export {
  type EmotionalPresenceSystem,
  analyzeEmotionalPresenceSystem,
} from "@/client/lib/presence/analyze"

export {
  PRESENCE_REALTIME_EVENT,
  broadcastPresenceUpdate,
  presenceTransitionMs,
  type PresenceRealtimeDetail,
} from "@/client/lib/presence/realtime-presence"
