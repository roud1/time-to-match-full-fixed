import type { ConnectionRecord } from "@/client/lib/connection-system"
import type { ChatMessage } from "@/client/lib/social-store"
import { CONNECTION_INITIAL_MS } from "@/client/lib/connection-system"

export type TimelineMilestoneId =
  | "first_message"
  | "first_night_talk"
  | "connection_24h"
  | "deep_conversation"
  | "consistent_replies"
  | "sync_increased"
  | "strong_sync"

export type TimelineMilestone = {
  id: TimelineMilestoneId
  at: number
  reached: boolean
}

const NIGHT_START = 22
const NIGHT_END = 5

function isNightHour(ts: number) {
  const h = new Date(ts).getHours()
  return h >= NIGHT_START || h < NIGHT_END
}

function hasNightExchange(messages: ChatMessage[]) {
  const night = messages.filter((m) => isNightHour(m.at))
  const me = night.some((m) => m.from === "me")
  const them = night.some((m) => m.from === "them")
  return me && them && night.length >= 2
}

function sessionMessagePeak(messages: ChatMessage[]): number {
  const sorted = [...messages].sort((a, b) => a.at - b.at)
  let peak = 0
  let count = 0
  let last = 0
  const GAP = 35 * 60 * 1000
  for (const m of sorted) {
    if (last && m.at - last > GAP) {
      peak = Math.max(peak, count)
      count = 0
    }
    count += 1
    last = m.at
  }
  return Math.max(peak, count)
}

/** Shared connection timeline milestones. */
export function buildConnectionMilestones(
  messages: ChatMessage[],
  record: ConnectionRecord,
  syncPercent: number,
  now = Date.now()
): TimelineMilestone[] {
  const sorted = [...messages].sort((a, b) => a.at - b.at)
  const firstAt = sorted[0]?.at ?? record.matchedAt
  const nightAt = sorted.find((m) => isNightHour(m.at))?.at
  const deepAt =
    sessionMessagePeak(messages) >= 12
      ? sorted[Math.min(sorted.length - 1, 11)]?.at
      : undefined
  const h24At = record.matchedAt + CONNECTION_INITIAL_MS
  const syncIncreasedAt =
    syncPercent >= 55 && record.bothParticipated ? sorted[Math.max(0, sorted.length - 1)]?.at : undefined
  const strongAt = syncPercent >= 78 ? now - 60_000 : undefined

  const defs: { id: TimelineMilestoneId; at?: number; reached: boolean }[] = [
    { id: "first_message", at: firstAt, reached: sorted.length >= 1 },
    {
      id: "first_night_talk",
      at: nightAt,
      reached: hasNightExchange(messages),
    },
    {
      id: "connection_24h",
      at: h24At,
      reached: now >= h24At && record.bothParticipated,
    },
    {
      id: "deep_conversation",
      at: deepAt,
      reached: sessionMessagePeak(messages) >= 12,
    },
    {
      id: "consistent_replies",
      at:
        record.bothParticipated && sorted.length >= 6
          ? sorted[Math.min(sorted.length - 1, 5)]?.at
          : undefined,
      reached:
        record.bothParticipated &&
        sorted.length >= 6 &&
        sorted.filter((m) => m.from === "me").length >= 2 &&
        sorted.filter((m) => m.from === "them").length >= 2,
    },
    {
      id: "sync_increased",
      at: syncIncreasedAt,
      reached: syncPercent >= 55 && sorted.length >= 4 && record.bothParticipated,
    },
    {
      id: "strong_sync",
      at: strongAt,
      reached: syncPercent >= 78 && record.bothParticipated,
    },
  ]

  return defs
    .filter((d) => d.at != null || d.reached)
    .map((d) => ({
      id: d.id,
      at: d.at ?? record.matchedAt,
      reached: d.reached,
    }))
    .sort((a, b) => a.at - b.at)
}
