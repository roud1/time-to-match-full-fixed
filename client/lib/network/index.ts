/**
 * Phase 13 — Emotional Network Effect (retention, events, invite, legacy).
 */
export {
  type EvolutionEventKind,
  type EvolutionEvent,
  detectEvolutionEvents,
  persistEvolutionEvents,
  getEvolutionEvents,
  getUnseenEvolutionEvents,
  markEvolutionEventSeen,
} from "@/client/lib/network/connection-evolution-events"

export {
  type RetentionAnticipation,
  type RetentionAnticipationKind,
  buildRetentionAnticipations,
} from "@/client/lib/network/emotional-retention"

export {
  type EmotionalPsychologyProfile,
  analyzeEmotionalPsychology,
} from "@/client/lib/network/ai-emotional-model"

export { type EnergyWhisper, buildEnergyWhispers } from "@/client/lib/network/energy-feed"

export {
  type LegacyTimelineEntry,
  buildConnectionLegacyTimeline,
  getStrongestConnectionPeriod,
} from "@/client/lib/network/connection-legacy"

export {
  type InvitePayload,
  getOrCreateInviteCode,
  buildInvitePayload,
  copyInviteLink,
  shareInviteNative,
} from "@/client/lib/network/invite"

export {
  buildAuraShareMoment,
  buildMilestoneShareMoment,
  buildEvolutionShareMoment,
} from "@/client/lib/network/share-cards"
