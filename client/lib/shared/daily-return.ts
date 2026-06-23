import { buildConnectionView, type ConnectionRecord, type ConnectionStage } from "@/client/lib/connection-system"
import type { TranslationKey } from "@/client/lib/i18n"

const STORE_KEY = "ttm-daily-return"
const MIN_AWAY_MS = 45 * 60 * 1000

export type DailyReturnInsightKind =
  | "evolved"
  | "pattern"
  | "sync_shift"
  | "fading"
  | "waiting"
  | "chemistry"

export type DailyReturnInsight = {
  id: string
  kind: DailyReturnInsightKind
  profileId?: number
  titleKey: TranslationKey
  bodyKey: TranslationKey
  priority: number
}

type ConnectionSnapshot = {
  profileId: number
  stage: ConnectionStage
  syncScore: number
  status: string
}

type DailyReturnStore = {
  lastVisitAt: number
  snapshots: ConnectionSnapshot[]
}

function load(): DailyReturnStore {
  if (typeof window === "undefined") {
    return { lastVisitAt: 0, snapshots: [] }
  }
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return { lastVisitAt: 0, snapshots: [] }
    return JSON.parse(raw) as DailyReturnStore
  } catch {
    return { lastVisitAt: 0, snapshots: [] }
  }
}

function save(store: DailyReturnStore) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

function snapshotFromRecord(record: ConnectionRecord): ConnectionSnapshot {
  const view = buildConnectionView(record)
  return {
    profileId: record.profileId,
    stage: record.stage,
    syncScore: view.streakScore + view.streakDays * 8 + (view.bothParticipated ? 20 : 0),
    status: record.status,
  }
}

const STAGE_RANK: Record<ConnectionStage, number> = {
  spark: 0,
  active: 1,
  strong: 2,
  rare: 3,
  stable: 4,
}

export function recordDailyVisit(connections: ConnectionRecord[], now = Date.now()) {
  save({
    lastVisitAt: now,
    snapshots: connections.map(snapshotFromRecord),
  })
}

export function computeDailyReturnInsights(
  connections: ConnectionRecord[],
  now = Date.now()
): DailyReturnInsight[] {
  const prev = load()
  const awayMs = now - prev.lastVisitAt
  if (awayMs < MIN_AWAY_MS || prev.snapshots.length === 0) {
    return []
  }

  const insights: DailyReturnInsight[] = []
  const prevById = new Map(prev.snapshots.map((s) => [s.profileId, s]))

  for (const record of connections) {
    if (record.status === "archived") continue
    const view = buildConnectionView(record, now)
    const old = prevById.get(record.profileId)
    const score =
      view.streakScore + view.streakDays * 8 + (view.bothParticipated ? 20 : 0)

    if (view.isFading) {
      insights.push({
        id: `fade-${record.profileId}`,
        kind: "fading",
        profileId: record.profileId,
        titleKey: "dailyReturnFadeTitle",
        bodyKey: "dailyReturnFadeBody",
        priority: 90,
      })
      continue
    }

    if (old && STAGE_RANK[record.stage] > STAGE_RANK[old.stage]) {
      insights.push({
        id: `evolved-${record.profileId}`,
        kind: "evolved",
        profileId: record.profileId,
        titleKey: "dailyReturnEvolvedTitle",
        bodyKey: "dailyReturnEvolvedBody",
        priority: 85,
      })
    } else if (old && score - old.syncScore >= 12) {
      insights.push({
        id: `sync-${record.profileId}`,
        kind: "sync_shift",
        profileId: record.profileId,
        titleKey: "dailyReturnSyncTitle",
        bodyKey: "dailyReturnSyncBody",
        priority: 70,
      })
    } else if (!old && record.messagesExchanged > 0) {
      insights.push({
        id: `pattern-${record.profileId}`,
        kind: "pattern",
        profileId: record.profileId,
        titleKey: "dailyReturnPatternTitle",
        bodyKey: "dailyReturnPatternBody",
        priority: 60,
      })
    } else if (view.bothParticipated && view.streakDays >= 2) {
      insights.push({
        id: `chem-${record.profileId}`,
        kind: "chemistry",
        profileId: record.profileId,
        titleKey: "dailyReturnChemistryTitle",
        bodyKey: "dailyReturnChemistryBody",
        priority: 55,
      })
    }
  }

  const alive = connections.filter((c) => c.status !== "archived")
  if (alive.some((c) => c.theirMessages > c.myMessages && Date.now() - c.lastInteractionAt < 6 * 60 * 60 * 1000)) {
    insights.push({
      id: "waiting-global",
      kind: "waiting",
      titleKey: "dailyReturnWaitingTitle",
      bodyKey: "dailyReturnWaitingBody",
      priority: 95,
    })
  }

  return insights.sort((a, b) => b.priority - a.priority).slice(0, 3)
}

export function shouldShowDailyReturn(connections: ConnectionRecord[], now = Date.now()): boolean {
  const prev = load()
  if (now - prev.lastVisitAt < MIN_AWAY_MS) return false
  return computeDailyReturnInsights(connections, now).length > 0
}
