import type { Locale } from "@/client/lib/i18n"

/** Emotional stages — connection evolves as users interact. */
export type ConnectionStage = "spark" | "active" | "strong" | "rare" | "stable"

export type ConnectionStatus = "alive" | "fading" | "archived"

export type ConnectionRecord = {
  profileId: number
  matchedAt: number
  expiresAt: number
  /** One-time 24h freeze applied to this match (demo / client). */
  isFrozen?: boolean
  stage: ConnectionStage
  status: ConnectionStatus
  streakDays: number
  streakScore: number
  lastInteractionAt: number
  lastStreakDay?: string
  lastExtensionAt?: number
  totalExtensionsMs: number
  messagesExchanged: number
  myMessages: number
  theirMessages: number
  bothParticipated: boolean
  stabilizedAt?: number
  fadeStartedAt?: number
}

export type ConnectionMemory = {
  profileId: number
  profileName: string
  matchedAt: number
  endedAt: number
  daysTogether: number
  stageReached: ConnectionStage
  reason: "expired" | "faded"
}

export type ConnectionEvent =
  | { type: "extended"; profileId: number; addedMs: number; at: number }
  | { type: "stage_up"; profileId: number; stage: ConnectionStage; at: number }
  | { type: "streak"; profileId: number; days: number; at: number }
  | { type: "fading"; profileId: number; at: number }
  | { type: "archived"; profileId: number; at: number }

export type ConnectionUrgency = "calm" | "aware" | "urgent" | "critical"

export type ConnectionView = {
  profileId: number
  remainingMs: number
  formattedTime: string
  stage: ConnectionStage
  status: ConnectionStatus
  streakDays: number
  streakScore: number
  isFading: boolean
  isStable: boolean
  fadeIntensity: number
  auraTier: 0 | 1 | 2 | 3 | 4
  urgency: ConnectionUrgency
  showTimer: boolean
  bothParticipated: boolean
  /** @deprecated Use sync metrics from lib/sync-system */
}

export const CONNECTION_INITIAL_MS = 24 * 60 * 60 * 1000
export const CONNECTION_EXTENSION_BASE_MS = 2 * 60 * 60 * 1000
export const CONNECTION_EXTENSION_STRONG_MS = 4 * 60 * 60 * 1000
export const CONNECTION_EXTENSION_RARE_MS = 6 * 60 * 60 * 1000
export const CONNECTION_FADE_AFTER_MS = 4 * 60 * 60 * 1000
export const CONNECTION_STABLE_STREAK_DAYS = 7
export const CONNECTION_STABLE_SCORE = 120
export const CONNECTION_MAX_WINDOW_MS = 14 * 24 * 60 * 60 * 1000
export const CONNECTION_STABLE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

const STAGE_ORDER: ConnectionStage[] = ["spark", "active", "strong", "rare", "stable"]

export function formatConnectionTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function dayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export function daysBetween(a: number, b: number): number {
  return Math.max(1, Math.ceil(Math.abs(b - a) / (24 * 60 * 60 * 1000)))
}

function scoreToStage(score: number, streakDays: number, stabilizedAt?: number): ConnectionStage {
  if (stabilizedAt || (streakDays >= CONNECTION_STABLE_STREAK_DAYS && score >= CONNECTION_STABLE_SCORE)) {
    return "stable"
  }
  if (score >= 80) return "rare"
  if (score >= 40) return "strong"
  if (score >= 10) return "active"
  return "spark"
}

function extensionForStage(stage: ConnectionStage): number {
  if (stage === "rare" || stage === "stable") return CONNECTION_EXTENSION_RARE_MS
  if (stage === "strong") return CONNECTION_EXTENSION_STRONG_MS
  return CONNECTION_EXTENSION_BASE_MS
}

function maxWindowFor(record: ConnectionRecord): number {
  return record.stabilizedAt ? CONNECTION_STABLE_WINDOW_MS : CONNECTION_MAX_WINDOW_MS
}

export function createConnectionRecord(profileId: number, now = Date.now()): ConnectionRecord {
  return {
    profileId,
    matchedAt: now,
    expiresAt: now + CONNECTION_INITIAL_MS,
    stage: "spark",
    status: "alive",
    streakDays: 0,
    streakScore: 0,
    lastInteractionAt: now,
    totalExtensionsMs: 0,
    messagesExchanged: 0,
    myMessages: 0,
    theirMessages: 0,
    bothParticipated: false,
  }
}

export function applyInteraction(
  record: ConnectionRecord,
  from: "me" | "them",
  now = Date.now()
): { record: ConnectionRecord; events: ConnectionEvent[] } {
  const events: ConnectionEvent[] = []
  let next = { ...record }
  const prevStage = next.stage

  next.messagesExchanged += 1
  if (from === "me") next.myMessages += 1
  else next.theirMessages += 1
  next.bothParticipated = next.myMessages > 0 && next.theirMessages > 0
  next.lastInteractionAt = now
  next.status = "alive"
  next.fadeStartedAt = undefined

  if (next.bothParticipated) {
    next.streakScore += 5
    const today = dayKey(now)
    if (next.lastStreakDay !== today) {
      const yesterday = dayKey(now - 24 * 60 * 60 * 1000)
      if (next.lastStreakDay === yesterday || next.streakDays === 0) {
        next.streakDays += 1
        events.push({ type: "streak", profileId: next.profileId, days: next.streakDays, at: now })
      } else if (next.lastStreakDay && next.lastStreakDay !== today) {
        next.streakDays = 1
      } else if (!next.lastStreakDay) {
        next.streakDays = 1
      }
      next.lastStreakDay = today
    }

    if (next.messagesExchanged % 3 === 0) next.streakScore += 3
  } else {
    next.streakScore += 1
  }

  const stage = scoreToStage(next.streakScore, next.streakDays, next.stabilizedAt)
  next.stage = stage

  if (STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf(prevStage)) {
    events.push({ type: "stage_up", profileId: next.profileId, stage, at: now })
  }

  if (
    !next.stabilizedAt &&
    next.bothParticipated &&
    next.streakDays >= CONNECTION_STABLE_STREAK_DAYS &&
    next.streakScore >= CONNECTION_STABLE_SCORE
  ) {
    next.stabilizedAt = now
    next.stage = "stable"
    events.push({ type: "stage_up", profileId: next.profileId, stage: "stable", at: now })
  }

  if (next.bothParticipated) {
    const addedMs = extensionForStage(next.stage)
    const cap = next.matchedAt + maxWindowFor(next)
    const proposed = next.expiresAt + addedMs
    next.expiresAt = Math.min(proposed, cap)
    if (next.stabilizedAt) {
      next.expiresAt = Math.max(next.expiresAt, now + 7 * 24 * 60 * 60 * 1000)
    }
    next.totalExtensionsMs += addedMs
    next.lastExtensionAt = now
    events.push({ type: "extended", profileId: next.profileId, addedMs, at: now })
  }

  return { record: next, events }
}

export function tickConnection(
  record: ConnectionRecord,
  now = Date.now()
): { record: ConnectionRecord; events: ConnectionEvent[]; archived?: ConnectionMemory } {
  if (record.status === "archived") return { record, events: [] }

  const events: ConnectionEvent[] = []
  let next = { ...record }
  const idle = now - next.lastInteractionAt

  if (next.expiresAt <= now) {
    next.status = "archived"
    events.push({ type: "archived", profileId: next.profileId, at: now })
    return {
      record: next,
      events,
      archived: {
        profileId: next.profileId,
        profileName: "",
        matchedAt: next.matchedAt,
        endedAt: now,
        daysTogether: daysBetween(next.matchedAt, now),
        stageReached: next.stage,
        reason: next.fadeStartedAt ? "faded" : "expired",
      },
    }
  }

  if (idle >= CONNECTION_FADE_AFTER_MS && next.status === "alive") {
    const fadeThreshold = next.bothParticipated ? CONNECTION_FADE_AFTER_MS : CONNECTION_FADE_AFTER_MS / 2
    if (idle >= fadeThreshold) {
      next.status = "fading"
      next.fadeStartedAt = next.fadeStartedAt ?? now
      events.push({ type: "fading", profileId: next.profileId, at: now })
    }
  }

  if (next.stabilizedAt && next.stage !== "stable") {
    next.stage = "stable"
  } else if (!next.stabilizedAt) {
    next.stage = scoreToStage(next.streakScore, next.streakDays, next.stabilizedAt)
  }

  return { record: next, events }
}

export function buildConnectionView(record: ConnectionRecord, now = Date.now()): ConnectionView {
  const remainingMs = Math.max(0, record.expiresAt - now)
  const isStable = Boolean(record.stabilizedAt) || record.stage === "stable"
  const isFading = record.status === "fading"
  const idle = now - record.lastInteractionAt
  const fadeProgress = isFading
    ? Math.min(1, (now - (record.fadeStartedAt ?? now)) / CONNECTION_FADE_AFTER_MS)
    : 0

  let urgency: ConnectionUrgency = "calm"
  if (isFading || remainingMs < 2 * 60 * 60 * 1000) urgency = "critical"
  else if (remainingMs < 6 * 60 * 60 * 1000) urgency = "urgent"
  else if (remainingMs < 12 * 60 * 60 * 1000 || idle > CONNECTION_FADE_AFTER_MS / 2) urgency = "aware"

  let auraTier: ConnectionView["auraTier"] = 0
  if (record.stage === "active") auraTier = 1
  else if (record.stage === "strong") auraTier = 2
  else if (record.stage === "rare") auraTier = 3
  else if (record.stage === "stable") auraTier = 4

  return {
    profileId: record.profileId,
    remainingMs,
    formattedTime: formatConnectionTime(remainingMs),
    stage: record.stage,
    status: record.status,
    streakDays: record.streakDays,
    streakScore: record.streakScore,
    isFading,
    isStable,
    fadeIntensity: fadeProgress,
    auraTier,
    urgency,
    showTimer: !isStable || remainingMs < 24 * 60 * 60 * 1000,
    bothParticipated: record.bothParticipated,
  }
}

export type ConnectionCopyKeys = {
  stageSpark: string
  stageActive: string
  stageStrong: string
  stageRare: string
  stageStable: string
  streakStill: string
  streakChoosing: string
  streakIncreased: string
  fading: string
  fadingLong: string
  extended: string
  togetherHours: string
  memoryDays: string
  memoryFaded: string
  timerTogether: string
  stableLabel: string
}

export function stageLabel(stage: ConnectionStage, copy: ConnectionCopyKeys): string {
  switch (stage) {
    case "spark":
      return copy.stageSpark
    case "active":
      return copy.stageActive
    case "strong":
      return copy.stageStrong
    case "rare":
      return copy.stageRare
    case "stable":
      return copy.stageStable
  }
}

export function streakMessage(
  view: ConnectionView,
  copy: ConnectionCopyKeys
): string | null {
  if (view.isStable) return copy.streakChoosing
  if (view.streakDays >= 3) return copy.streakChoosing
  if (view.streakDays >= 1) return copy.streakStill
  if (view.stage === "strong" || view.stage === "rare") return copy.streakIncreased
  return null
}

export function formatExtensionHours(ms: number, locale: Locale): string {
  const h = Math.round(ms / (60 * 60 * 1000))
  if (locale === "ru" || locale === "uk") return `+${h}ч`
  if (locale === "tr") return `+${h}s`
  if (locale === "de") return `+${h} Std.`
  if (locale === "pl") return `+${h} godz.`
  return `+${h}h`
}
