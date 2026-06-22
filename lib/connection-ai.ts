import type { ConnectionRecord, ConnectionView } from "@/lib/connection-system"
import type { ChatMessage } from "@/lib/social-store"
import {
  analyzeConnection,
  type ConnectionAnalysis,
  type ConnectionSignals,
} from "@/lib/connection-engine"

/** Payload for future server-side AI analysis. */
export type ConnectionAIPayload = {
  profileId: number
  locale: string
  messageCount: number
  signals: ConnectionSignals
  view: Pick<
    ConnectionView,
    "stage" | "streakDays" | "bothParticipated" | "isFading" | "isStable"
  >
  recentMessages: Array<{ from: "me" | "them"; text: string; at: number }>
}

export type ConnectionAIInsight = {
  summary: string
  syncDelta: number
  chemistryDelta: number
  bondDelta: number
  qualityScore: number
  patternTags: string[]
  analyzedAt: number
}

export type ConnectionAIResult = {
  analysis: ConnectionAnalysis
  insight: ConnectionAIInsight
  usedRemoteModel: boolean
}

function qualityScore(signals: ConnectionSignals): number {
  let q = 50
  if (signals.myCount > 0 && signals.theirCount > 0) q += 15
  q += Math.min(15, signals.fastReplyCount * 3)
  q += Math.min(10, signals.mutualSessions * 4)
  q -= Math.round(signals.oneSidedRatio * 25)
  if (signals.idleMs > 6 * 60 * 60 * 1000) q -= 15
  return Math.min(100, Math.max(0, Math.round(q)))
}

function patternTags(signals: ConnectionSignals, analysis: ConnectionAnalysis): string[] {
  const tags: string[] = []
  if (signals.fastReplyCount >= 3) tags.push("quick_replies")
  if (signals.nightMessageCount >= 2) tags.push("late_night")
  if (signals.mutualSessions >= 2) tags.push("mutual_sessions")
  if (signals.longestSessionMessages >= 10) tags.push("deep_thread")
  if (signals.oneSidedRatio > 0.65) tags.push("one_sided")
  if (signals.idleMs > 8 * 60 * 60 * 1000) tags.push("idle_gap")
  if (analysis.emotionalState === "aligned") tags.push("aligned")
  if (analysis.isDecaying) tags.push("decay_risk")
  return tags
}

function localInsight(
  analysis: ConnectionAnalysis,
  signals: ConnectionSignals,
  recentActivity: boolean
): ConnectionAIInsight {
  const q = qualityScore(signals)
  const syncDelta = recentActivity
    ? Math.min(8, 2 + signals.fastReplyCount)
    : signals.idleMs > 4 * 60 * 60 * 1000
      ? -Math.min(6, Math.floor(signals.idleMs / (60 * 60 * 1000)))
      : 0
  const chemistryDelta = recentActivity && signals.nightMessageCount > 0 ? 4 : 0
  const bondDelta =
    signals.mutualSessions > 0 && signals.myCount > 0 && signals.theirCount > 0 ? 3 : 0

  let summary = "Steady rhythm — connection is finding its pace."
  if (analysis.emotionalState === "aligned")
    summary = "Strong alignment — you are moving in sync."
  else if (analysis.emotionalState === "electric")
    summary = "High chemistry — momentum is building fast."
  else if (analysis.emotionalState === "fading")
    summary = "Gap in replies — sync is cooling. A message could reignite it."
  else if (analysis.emotionalState === "distant")
    summary = "Waiting for mutual energy — one side is carrying the thread."
  else if (signals.fastReplyCount >= 2)
    summary = "Quick exchanges are strengthening your bond."

  return {
    summary,
    syncDelta,
    chemistryDelta,
    bondDelta,
    qualityScore: q,
    patternTags: patternTags(signals, analysis),
    analyzedAt: Date.now(),
  }
}

/** Build payload for optional remote AI endpoint. */
export function buildConnectionAIPayload(
  profileId: number,
  locale: string,
  messages: ChatMessage[],
  record: ConnectionRecord,
  view: ConnectionView
): ConnectionAIPayload {
  const analysis = analyzeConnection(view, messages, record)
  const recent = [...messages].sort((a, b) => b.at - a.at).slice(0, 24).reverse()
  return {
    profileId,
    locale,
    messageCount: messages.length,
    signals: analysis.signals,
    view: {
      stage: view.stage,
      streakDays: view.streakDays,
      bothParticipated: view.bothParticipated,
      isFading: view.isFading,
      isStable: view.isStable,
    },
    recentMessages: recent
      .filter((m) => m.from !== "system")
      .map((m) => ({ from: m.from as "me" | "them", text: m.text, at: m.at })),
  }
}

/**
 * Analyze connection — local heuristic "AI" today; swap body for remote model later.
 * Set `remoteAnalyzer` when wiring OpenAI / internal API.
 */
export async function analyzeConnectionWithAI(
  view: ConnectionView,
  messages: ChatMessage[],
  record: ConnectionRecord,
  opts?: {
    recentActivity?: boolean
    locale?: string
    remoteAnalyzer?: (payload: ConnectionAIPayload) => Promise<Partial<ConnectionAIInsight>>
  }
): Promise<ConnectionAIResult> {
  const recentActivity = opts?.recentActivity ?? false
  const analysis = analyzeConnection(view, messages, record, { recentActivity })
  let insight = localInsight(analysis, analysis.signals, recentActivity)
  let usedRemoteModel = false

  if (opts?.remoteAnalyzer) {
    try {
      const payload = buildConnectionAIPayload(
        view.profileId,
        opts.locale ?? "ru",
        messages,
        record,
        view
      )
      const remote = await opts.remoteAnalyzer(payload)
      insight = { ...insight, ...remote, analyzedAt: Date.now() }
      usedRemoteModel = true
    } catch {
      /* keep local insight */
    }
  }

  return { analysis, insight, usedRemoteModel }
}
