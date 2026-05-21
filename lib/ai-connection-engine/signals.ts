import type { ChatMessage } from "@/lib/social-store"
import type { ConnectionRecord } from "@/lib/connection-system"
import { extractSignals, type ConnectionSignals } from "@/lib/connection-engine"
import type { AIConnectionSignals } from "@/lib/ai-connection-engine/types"

const SESSION_GAP_MS = 35 * 60 * 1000
const FAST_REPLY_MS = 8 * 60 * 1000
const NIGHT_START = 22
const NIGHT_END = 5

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

function isNightHour(ts: number) {
  const h = new Date(ts).getHours()
  return h >= NIGHT_START || h < NIGHT_END
}

function replyGaps(messages: ChatMessage[]): number[] {
  const sorted = [...messages].sort((a, b) => a.at - b.at)
  const gaps: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1].from !== sorted[i].from) {
      gaps.push(sorted[i].at - sorted[i - 1].at)
    }
  }
  return gaps
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null
  const s = [...nums].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

function sessionDepth(messages: ChatMessage[]): number {
  const sorted = [...messages].sort((a, b) => a.at - b.at)
  let peak = 0
  let count = 0
  let last = 0
  for (const m of sorted) {
    if (last && m.at - last > SESSION_GAP_MS) peak = Math.max(peak, count)
    count += 1
    last = m.at
  }
  return Math.max(peak, count)
}

/** Extract rich signals for the AI analysis API. */
export function extractAIConnectionSignals(
  messages: ChatMessage[],
  record: ConnectionRecord,
  now = Date.now()
): AIConnectionSignals {
  const base = extractSignals(messages, record, now)
  const gaps = replyGaps(messages)
  const avgGap =
    gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null
  const med = median(gaps.filter((g) => g > 0))

  const lengths = messages.map((m) => m.text.trim().length).filter((l) => l > 0)
  const avgLen = lengths.length ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0

  const nightCount = messages.filter((m) => isNightHour(m.at)).length
  const lateNightRatio = messages.length ? nightCount / messages.length : 0

  const fast = gaps.filter((g) => g > 0 && g < FAST_REPLY_MS).length
  const replyConsistency =
    gaps.length >= 2
      ? clamp01(1 - Math.min(1, (Math.max(...gaps) - Math.min(...gaps)) / (12 * 60 * 60 * 1000)))
      : gaps.length === 1
        ? 0.6
        : 0.2

  const mutualEngagement = clamp01(
    base.myCount > 0 && base.theirCount > 0
      ? 0.5 + Math.min(0.5, (Math.min(base.myCount, base.theirCount) / Math.max(base.myCount, base.theirCount)) * 0.5)
      : 0.15
  )

  const depth = clamp01(
    (sessionDepth(messages) / 20) * 0.5 +
      (base.longestSessionMessages / 16) * 0.3 +
      (avgLen / 120) * 0.2
  )

  const emotionalIntensity = clamp01(
    (base.nightMessageCount / 6) * 0.25 +
      (base.voiceLikeCount / 4) * 0.2 +
      depth * 0.35 +
      (fast / Math.max(1, gaps.length)) * 0.2
  )

  const dailyConsistency = clamp01(
    (base.dailyStreak / 7) * 0.7 + (record.streakDays / 7) * 0.3
  )

  return {
    avgReplyMs: base.avgReplyMs ?? avgGap,
    medianReplyMs: med,
    replyConsistency,
    avgMessageLength: Math.round(avgLen),
    interactionDepth: Math.round(depth * 100),
    mutualEngagement,
    lateNightRatio,
    dailyConsistency,
    emotionalIntensity: Math.round(emotionalIntensity * 100),
    oneSidedRatio: base.oneSidedRatio,
    sessionDepth: sessionDepth(messages),
    fastReplyCount: base.fastReplyCount,
    messageCount: base.messageCount,
  }
}

export function activityLevelFromSignals(
  signals: AIConnectionSignals
): "low" | "medium" | "high" {
  if (signals.messageCount >= 12 && signals.mutualEngagement >= 0.55) return "high"
  if (signals.messageCount >= 4) return "medium"
  return "low"
}

export function toLegacySignals(base: ConnectionSignals): AIConnectionSignals {
  return {
    avgReplyMs: base.avgReplyMs,
    medianReplyMs: base.avgReplyMs,
    replyConsistency: 0.5,
    avgMessageLength: 0,
    interactionDepth: Math.min(100, base.longestSessionMessages * 8),
    mutualEngagement: base.myCount && base.theirCount ? 0.6 : 0.2,
    lateNightRatio: base.nightMessageCount / Math.max(1, base.messageCount),
    dailyConsistency: base.dailyStreak / 7,
    emotionalIntensity: 40,
    oneSidedRatio: base.oneSidedRatio,
    sessionDepth: base.longestSessionMessages,
    fastReplyCount: base.fastReplyCount,
    messageCount: base.messageCount,
  }
}
