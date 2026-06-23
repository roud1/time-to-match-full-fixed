import type { ConnectionRecord, ConnectionView } from "@/client/lib/connection-system"
import type { ChatMessage } from "@/client/lib/social-store"
import type { SyncMetrics, SyncTier } from "@/client/lib/sync-system"

/** Raw signals extracted from chat + connection record. */
export type ConnectionSignals = {
  messageCount: number
  myCount: number
  theirCount: number
  avgReplyMs: number | null
  fastReplyCount: number
  mutualSessions: number
  longestSessionMessages: number
  nightMessageCount: number
  voiceLikeCount: number
  idleMs: number
  oneSidedRatio: number
  sessionMinutes: number
  dailyStreak: number
}

export type EmotionalState =
  | "curious"
  | "warm"
  | "electric"
  | "aligned"
  | "distant"
  | "fading"

export type ChemistryLevel = "low" | "medium" | "high" | "peak"

export type BondLevel = "forming" | "growing" | "stable" | "deep"

export type ConnectionAnalysis = {
  syncPercent: number
  chemistryPercent: number
  bondPercent: number
  energyPercent: number
  connectionPercent: number
  tier: SyncTier
  emotionalState: EmotionalState
  chemistryLevel: ChemistryLevel
  bondLevel: BondLevel
  signals: ConnectionSignals
  momentum: number
  isDecaying: boolean
}

const FAST_REPLY_MS = 8 * 60 * 1000
const SESSION_GAP_MS = 35 * 60 * 1000
const NIGHT_START = 22
const NIGHT_END = 5

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function isNightHour(ts: number) {
  const h = new Date(ts).getHours()
  return h >= NIGHT_START || h < NIGHT_END
}

function isVoiceLike(text: string) {
  const t = text.trim()
  return t.startsWith("🎤") || t.includes("[voice]") || t.length < 4 && t === "…"
}

/** Analyze message thread for interaction patterns. */
export function extractSignals(
  messages: ChatMessage[],
  record: ConnectionRecord,
  now = Date.now()
): ConnectionSignals {
  const sorted = [...messages].sort((a, b) => a.at - b.at)
  let fastReplyCount = 0
  let nightMessageCount = 0
  let voiceLikeCount = 0
  const replyDelays: number[] = []

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const cur = sorted[i]
    if (prev.from !== cur.from) {
      const delay = cur.at - prev.at
      replyDelays.push(delay)
      if (delay <= FAST_REPLY_MS) fastReplyCount += 1
    }
    if (isNightHour(cur.at)) nightMessageCount += 1
    if (isVoiceLike(cur.text)) voiceLikeCount += 1
  }

  let mutualSessions = 0
  let longestSessionMessages = 0
  let sessionStart = sorted[0]?.at
  let sessionCount = 0
  let lastAt = sorted[0]?.at
  let hadMe = false
  let hadThem = false

  for (const m of sorted) {
    if (lastAt != null && m.at - lastAt > SESSION_GAP_MS) {
      if (hadMe && hadThem) mutualSessions += 1
      longestSessionMessages = Math.max(longestSessionMessages, sessionCount)
      sessionCount = 0
      hadMe = false
      hadThem = false
      sessionStart = m.at
    }
    sessionCount += 1
    if (m.from === "me") hadMe = true
    else hadThem = true
    lastAt = m.at
  }
  if (hadMe && hadThem) mutualSessions += 1
  longestSessionMessages = Math.max(longestSessionMessages, sessionCount)

  const myCount = sorted.filter((m) => m.from === "me").length
  const theirCount = sorted.filter((m) => m.from === "them").length
  const total = sorted.length
  const oneSidedRatio =
    total === 0 ? 0 : Math.abs(myCount - theirCount) / Math.max(total, 1)

  const sessionMinutes =
    sorted.length >= 2 && sessionStart != null && lastAt != null
      ? Math.max(1, Math.round((lastAt - sessionStart) / 60_000))
      : 0

  const avgReplyMs =
    replyDelays.length > 0
      ? replyDelays.reduce((a, b) => a + b, 0) / replyDelays.length
      : null

  return {
    messageCount: total,
    myCount,
    theirCount,
    avgReplyMs,
    fastReplyCount,
    mutualSessions,
    longestSessionMessages,
    nightMessageCount,
    voiceLikeCount,
    idleMs: Math.max(0, now - record.lastInteractionAt),
    oneSidedRatio,
    sessionMinutes,
    dailyStreak: record.streakDays,
  }
}

function scoreFromSignals(
  signals: ConnectionSignals,
  view: ConnectionView,
  recentActivity: boolean
): Omit<ConnectionAnalysis, "signals" | "tier"> {
  let sync = 8 + view.streakScore * 0.42 + view.streakDays * 5

  if (signals.messageCount >= 1) sync += 6
  if (signals.myCount > 0 && signals.theirCount > 0) sync += 14
  sync += Math.min(18, signals.fastReplyCount * 3)
  sync += Math.min(12, signals.mutualSessions * 4)
  sync += Math.min(14, Math.floor(signals.longestSessionMessages / 2) * 2)
  sync += Math.min(10, signals.nightMessageCount * 2)
  sync += Math.min(8, signals.voiceLikeCount * 4)
  sync += Math.min(14, signals.dailyStreak * 3)
  if (signals.dailyStreak >= 3) sync += 8
  sync += Math.min(10, Math.floor(signals.sessionMinutes / 15) * 2)
  if (signals.messageCount >= 8 && signals.myCount >= 2 && signals.theirCount >= 2) sync += 6

  if (signals.avgReplyMs != null && signals.avgReplyMs < FAST_REPLY_MS) sync += 8

  if (recentActivity) sync += 12
  if (view.isStable) sync = Math.max(sync, 88)
  if (view.bothParticipated) sync += 6

  sync -= clamp(signals.oneSidedRatio * 28, 0, 28)
  const idleHours = signals.idleMs / (60 * 60 * 1000)
  if (idleHours > 2) sync -= clamp((idleHours - 2) * 4, 0, 35)
  if (idleHours > 8) sync -= 12
  if (view.isFading) sync -= clamp(view.fadeIntensity * 40, 8, 45)
  if (!view.bothParticipated) sync = clamp(sync * 0.55, 6, 32)

  sync = clamp(sync)

  let chemistry =
    10 +
    (view.bothParticipated ? 28 : 0) +
    Math.min(22, signals.fastReplyCount * 4) +
    Math.min(16, signals.nightMessageCount * 3) +
    Math.min(14, signals.mutualSessions * 5) +
    Math.min(12, signals.voiceLikeCount * 5) +
    (recentActivity ? 15 : 0)
  chemistry -= clamp(signals.oneSidedRatio * 35, 0, 35)
  if (view.isFading) chemistry -= 20
  chemistry = clamp(chemistry)

  let bond =
    8 +
    view.streakDays * 6 +
    view.streakScore * 0.28 +
    (view.isStable ? 35 : 0) +
    (view.stage === "rare" || view.stage === "stable" ? 18 : view.stage === "strong" ? 10 : 0) +
    Math.min(20, signals.longestSessionMessages)
  if (!view.bothParticipated) bond = clamp(bond * 0.4, 5, 25)
  if (view.isFading) bond -= 15
  bond = clamp(bond)

  let energy =
    chemistry * 0.35 +
    sync * 0.3 +
    (recentActivity ? 25 : 5) +
    Math.min(15, signals.fastReplyCount * 2) -
    clamp(idleHours * 3, 0, 25)
  if (view.isFading) energy = clamp(energy * (1 - view.fadeIntensity * 0.6))
  energy = clamp(energy)

  const connectionPercent = clamp(
    sync * 0.5 + bond * 0.3 + chemistry * 0.2 - (view.isFading ? 15 : 0)
  )

  const momentum = clamp(
    (recentActivity ? 30 : 0) +
      signals.fastReplyCount * 4 +
      (signals.avgReplyMs != null && signals.avgReplyMs < FAST_REPLY_MS ? 12 : 0) -
      idleHours * 2
  )

  const isDecaying = view.isFading || idleHours > 6 || signals.oneSidedRatio > 0.75

  let emotionalState: EmotionalState = "curious"
  if (view.isFading || isDecaying) emotionalState = "fading"
  else if (!view.bothParticipated) emotionalState = "distant"
  else if (sync >= 85 && bond >= 70) emotionalState = "aligned"
  else if (chemistry >= 70 && recentActivity) emotionalState = "electric"
  else if (bond >= 50 || view.streakDays >= 2) emotionalState = "warm"

  const chemistryLevel: ChemistryLevel =
    chemistry >= 82 ? "peak" : chemistry >= 58 ? "high" : chemistry >= 32 ? "medium" : "low"

  const bondLevel: BondLevel =
    bond >= 80 || view.isStable
      ? "deep"
      : bond >= 55
        ? "stable"
        : bond >= 30
          ? "growing"
          : "forming"

  return {
    syncPercent: sync,
    chemistryPercent: chemistry,
    bondPercent: bond,
    energyPercent: energy,
    connectionPercent,
    emotionalState,
    chemistryLevel,
    bondLevel,
    momentum,
    isDecaying,
  }
}

export function tierFromPercent(p: number, fading: boolean): SyncTier {
  if (fading && p < 30) return "cold"
  if (p >= 80) return p >= 98 ? "synced" : "vibrant"
  if (p >= 50) return "active"
  if (p >= 20) return "soft"
  return "cold"
}

/** Full connection analysis — foundation for UI + AI layer. */
export function analyzeConnection(
  view: ConnectionView,
  messages: ChatMessage[],
  record: ConnectionRecord,
  opts?: { recentActivity?: boolean; now?: number }
): ConnectionAnalysis {
  const now = opts?.now ?? Date.now()
  const recentActivity = opts?.recentActivity ?? false
  const signals = extractSignals(messages, record, now)
  const scored = scoreFromSignals(signals, view, recentActivity)
  const tier = tierFromPercent(scored.syncPercent, view.isFading)

  return { ...scored, signals, tier }
}

/** Map analysis to existing SyncMetrics for SyncRing / headers. */
export function analysisToSyncMetrics(
  analysis: ConnectionAnalysis,
  view: ConnectionView,
  recentActivity: boolean
): SyncMetrics {
  return {
    syncPercent: analysis.syncPercent,
    connectionPercent: analysis.connectionPercent,
    chemistryPercent: analysis.chemistryPercent,
    energyPercent: analysis.energyPercent,
    bondPercent: analysis.bondPercent,
    tier: analysis.tier,
    isActive: recentActivity || view.urgency === "calm" || view.urgency === "aware",
    isFading: view.isFading || analysis.isDecaying,
    isSynced: analysis.syncPercent >= 98 && view.bothParticipated && !view.isFading,
    recentActivity,
  }
}
