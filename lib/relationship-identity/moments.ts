import type { ChatMessage } from "@/lib/social-store"
import type { ConnectionRecord } from "@/lib/connection-system"
import type { AIConnectionSignals } from "@/lib/ai-connection-engine/types"
import type { RelationshipMoment, RelationshipMomentId } from "@/lib/relationship-identity/types"
import type { TimelineMilestone } from "@/lib/connection-timeline"
import type { TranslationKey } from "@/lib/i18n"

const NIGHT_START = 22
const NIGHT_END = 5

function isNightHour(ts: number) {
  const h = new Date(ts).getHours()
  return h >= NIGHT_START || h < NIGHT_END
}

function countNightSessions(messages: ChatMessage[]): number {
  const nights = new Set<string>()
  for (const m of messages.filter((x) => isNightHour(x.at))) {
    nights.add(new Date(m.at).toDateString())
  }
  return nights.size
}

function sessionPeak(messages: ChatMessage[]): number {
  const sorted = [...messages].sort((a, b) => a.at - b.at)
  const GAP = 35 * 60 * 1000
  let peak = 0
  let count = 0
  let last = 0
  for (const m of sorted) {
    if (last && m.at - last > GAP) peak = Math.max(peak, count)
    count += 1
    last = m.at
  }
  return Math.max(peak, count)
}

const MOMENT_TITLE: Record<RelationshipMomentId, TranslationKey> = {
  first_message: "relMomentFirstMessage",
  first_deep_talk: "relMomentFirstDeepTalk",
  long_night: "relMomentLongNight",
  three_night_talks: "relMomentThreeNights",
  high_sync_week: "relMomentHighSyncWeek",
  strong_chemistry_period: "relMomentStrongChemistry",
  fast_reply_streak: "relMomentFastReplyStreak",
  emotional_peak: "relMomentEmotionalPeak",
}

const MOMENT_SUB: Partial<Record<RelationshipMomentId, TranslationKey>> = {
  first_deep_talk: "relMomentFirstDeepTalkSub",
  long_night: "relMomentLongNightSub",
  three_night_talks: "relMomentThreeNightsSub",
  high_sync_week: "relMomentHighSyncWeekSub",
  emotional_peak: "relMomentEmotionalPeakSub",
}

/** Build living relationship moments for timeline + memory cards. */
export function buildRelationshipMoments(
  messages: ChatMessage[],
  record: ConnectionRecord,
  signals: AIConnectionSignals,
  syncPercent: number,
  t: (key: TranslationKey) => string,
  now = Date.now()
): RelationshipMoment[] {
  const sorted = [...messages].sort((a, b) => a.at - b.at)
  const nightSessions = countNightSessions(messages)
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const matchedWeekAgo = now - record.matchedAt >= weekMs * 0.85

  const defs: { id: RelationshipMomentId; at?: number; reached: boolean }[] = [
    {
      id: "first_message",
      at: sorted[0]?.at,
      reached: sorted.length >= 1,
    },
    {
      id: "first_deep_talk",
      at: sessionPeak(messages) >= 12 ? sorted[Math.min(11, sorted.length - 1)]?.at : undefined,
      reached: sessionPeak(messages) >= 12,
    },
    {
      id: "long_night",
      at: sorted.find((m) => isNightHour(m.at))?.at,
      reached: nightSessions >= 1 && sorted.filter((m) => isNightHour(m.at)).length >= 4,
    },
    {
      id: "three_night_talks",
      at: sorted.filter((m) => isNightHour(m.at)).pop()?.at,
      reached: nightSessions >= 3,
    },
    {
      id: "high_sync_week",
      at: matchedWeekAgo && syncPercent >= 60 ? now - weekMs / 2 : undefined,
      reached: matchedWeekAgo && syncPercent >= 60 && record.bothParticipated,
    },
    {
      id: "strong_chemistry_period",
      at: syncPercent >= 70 ? sorted[sorted.length - 1]?.at : undefined,
      reached: syncPercent >= 70 && signals.emotionalIntensity >= 50,
    },
    {
      id: "fast_reply_streak",
      at: signals.fastReplyCount >= 4 ? sorted[Math.min(sorted.length - 1, 3)]?.at : undefined,
      reached: signals.fastReplyCount >= 4 && record.bothParticipated,
    },
    {
      id: "emotional_peak",
      at: syncPercent >= 82 && signals.emotionalIntensity >= 60 ? now - 3600_000 : undefined,
      reached: syncPercent >= 82 && signals.emotionalIntensity >= 60,
    },
  ]

  return defs
    .filter((d) => d.reached || d.at != null)
    .map((d) => ({
      id: d.id,
      at: d.at ?? record.matchedAt,
      title: t(MOMENT_TITLE[d.id]),
      subtitle: MOMENT_SUB[d.id] ? t(MOMENT_SUB[d.id]!) : undefined,
      importance: d.id === "emotional_peak" ? 0.95 : d.id === "first_deep_talk" ? 0.9 : 0.7,
      reached: d.reached,
    }))
    .sort((a, b) => a.at - b.at)
}

export function momentsFromTimeline(
  milestones: TimelineMilestone[],
  t: (key: TranslationKey) => string
): RelationshipMoment[] {
  const map: Partial<Record<RelationshipMomentId, TimelineMilestone["id"]>> = {
    first_message: "first_message",
    first_deep_talk: "deep_conversation",
    long_night: "first_night_talk",
  }
  return milestones
    .filter((m) => m.reached)
    .map((m) => {
      const relId = (Object.entries(map).find(([, v]) => v === m.id)?.[0] ??
        m.id) as RelationshipMomentId
      return {
        id: relId in MOMENT_TITLE ? relId : "first_message",
        at: m.at,
        title: t(MOMENT_TITLE[relId in MOMENT_TITLE ? relId : "first_message"]),
        importance: 0.65,
        reached: true,
      }
    })
}
