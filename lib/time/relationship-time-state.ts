import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ConnectionRecord } from "@/lib/connection-system"
import type { ChatMessage } from "@/lib/social-store"
import type { TranslationKey } from "@/lib/i18n"

export type RelationshipTimeStateId =
  | "fresh_connection"
  | "growing_rhythm"
  | "stable_presence"
  | "deep_night_energy"
  | "fading_connection"
  | "emotional_echo"

export type RelationshipTimeState = {
  id: RelationshipTimeStateId
  labelKey: TranslationKey
  descriptionKey: TranslationKey
  weight: number
}

const NIGHT_START = 22
const NIGHT_END = 5

function isNightNow() {
  const h = new Date().getHours()
  return h >= NIGHT_START || h < NIGHT_END
}

function nightMessageCount(messages: ChatMessage[]) {
  return messages.filter((m) => {
    const h = new Date(m.at).getHours()
    return h >= NIGHT_START || h < NIGHT_END
  }).length
}

export function resolveRelationshipTimeState(
  record: ConnectionRecord,
  analysis: ConnectionAnalysis,
  messages: ChatMessage[],
  now = Date.now()
): RelationshipTimeState {
  const idleMs = now - record.lastInteractionAt
  const bondAgeMs = now - record.matchedAt
  const nights = nightMessageCount(messages)

  if (record.status === "archived" || (idleMs > 5 * 24 * 60 * 60 * 1000 && messages.length > 0)) {
    return state("emotional_echo", "timeStateEcho", "timeStateEchoDesc", 0.35)
  }

  if (analysis.isDecaying || idleMs > 6 * 60 * 60 * 1000) {
    return state("fading_connection", "timeStateFading", "timeStateFadingDesc", 0.4)
  }

  if (isNightNow() && nights >= 3) {
    return state("deep_night_energy", "timeStateNight", "timeStateNightDesc", 0.88)
  }

  if (record.streakDays >= 3 && !analysis.isDecaying) {
    return state("stable_presence", "timeStateStable", "timeStateStableDesc", 0.75)
  }

  if (bondAgeMs < CONNECTION_FRESH_MS || messages.length < 4) {
    return state("fresh_connection", "timeStateFresh", "timeStateFreshDesc", 0.55)
  }

  return state("growing_rhythm", "timeStateGrowing", "timeStateGrowingDesc", 0.65)
}

const CONNECTION_FRESH_MS = 36 * 60 * 60 * 1000

function state(
  id: RelationshipTimeStateId,
  labelKey: TranslationKey,
  descriptionKey: TranslationKey,
  weight: number
): RelationshipTimeState {
  return { id, labelKey, descriptionKey, weight }
}

export function timeStateAttrs(state: RelationshipTimeState): Record<string, string> {
  return { "data-time-state": state.id }
}
