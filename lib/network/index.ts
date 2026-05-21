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
} from "@/lib/network/connection-evolution-events"

export {
  type RetentionAnticipation,
  type RetentionAnticipationKind,
  buildRetentionAnticipations,
} from "@/lib/network/emotional-retention"

export {
  type EmotionalPsychologyProfile,
  analyzeEmotionalPsychology,
} from "@/lib/network/ai-emotional-model"

export { type EnergyWhisper, buildEnergyWhispers } from "@/lib/network/energy-feed"

export {
  type LegacyTimelineEntry,
  buildConnectionLegacyTimeline,
  getStrongestConnectionPeriod,
} from "@/lib/network/connection-legacy"

export {
  type InvitePayload,
  getOrCreateInviteCode,
  buildInvitePayload,
  copyInviteLink,
  shareInviteNative,
} from "@/lib/network/invite"

export {
  buildAuraShareMoment,
  buildMilestoneShareMoment,
  buildEvolutionShareMoment,
} from "@/lib/network/share-cards"
