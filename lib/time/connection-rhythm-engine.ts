import type { ChatMessage } from "@/lib/social-store"
import type { ConnectionRecord } from "@/lib/connection-system"
import type { TranslationKey } from "@/lib/i18n"

export type ConnectionTimeRhythm = {
  dailyCadence: number
  overlapScore: number
  consistency: number
  pacing: number
  insightKey: TranslationKey
}

function hourBuckets(messages: ChatMessage[], from: "me" | "them") {
  const buckets = Array.from({ length: 24 }, () => 0)
  for (const m of messages) {
    if (m.from !== from) continue
    buckets[new Date(m.at).getHours()] += 1
  }
  return buckets
}

function bucketOverlap(a: number[], b: number[]) {
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < 24; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  if (!na || !nb) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

function recentDaySpread(messages: ChatMessage[], now = Date.now()) {
  const dayMs = 24 * 60 * 60 * 1000
  const days = new Set<number>()
  for (const m of messages) {
    if (now - m.at > 7 * dayMs) continue
    days.add(Math.floor(m.at / dayMs))
  }
  return days.size / 7
}

export function analyzeConnectionTimeRhythm(
  messages: ChatMessage[],
  record: ConnectionRecord
): ConnectionTimeRhythm {
  const me = hourBuckets(messages, "me")
  const them = hourBuckets(messages, "them")
  const overlapScore = bucketOverlap(me, them)
  const dailyCadence = Math.min(1, messages.length / 40)
  const consistency = Math.min(1, recentDaySpread(messages) * 0.7 + record.streakDays / 10)
  const pacing = Math.min(1.15, 0.85 + overlapScore * 0.2 + dailyCadence * 0.1)

  let insightKey: TranslationKey = "timeRhythmBalanced"
  if (overlapScore >= 0.55) insightKey = "timeRhythmOverlap"
  else if (consistency >= 0.6) insightKey = "timeRhythmConsistent"
  else if (dailyCadence < 0.15) insightKey = "timeRhythmSparse"

  return {
    dailyCadence,
    overlapScore,
    consistency,
    pacing,
    insightKey,
  }
}

export function rhythmCss(rhythm: ConnectionTimeRhythm): Record<string, string> {
  return {
    "--time-rhythm-pace": String(rhythm.pacing),
    "--time-rhythm-overlap": String(rhythm.overlapScore),
  }
}
