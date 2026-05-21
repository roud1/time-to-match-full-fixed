import type { ConnectionView } from "@/lib/connection-system"
import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ConnectionRecord } from "@/lib/connection-system"
import type { RelationshipEcology } from "@/lib/ecosystem"
import type { TranslationKey } from "@/lib/i18n"

export type EvolutionEventKind =
  | "sync_peak"
  | "emotional_resonance"
  | "stable_bond_week"
  | "night_energy_surge"
  | "deep_compatibility"

export type EvolutionEvent = {
  id: string
  kind: EvolutionEventKind
  profileId: number
  at: number
  seen: boolean
  rarity: "rare" | "legendary"
  titleKey: TranslationKey
  bodyKey: TranslationKey
}

const STORE_KEY = "ttm-evolution-events"
const MAX_STORED = 24

const META: Record<
  EvolutionEventKind,
  { titleKey: TranslationKey; bodyKey: TranslationKey; rarity: "rare" | "legendary" }
> = {
  sync_peak: { titleKey: "netEventSyncPeakTitle", bodyKey: "netEventSyncPeakBody", rarity: "legendary" },
  emotional_resonance: {
    titleKey: "netEventResonanceTitle",
    bodyKey: "netEventResonanceBody",
    rarity: "legendary",
  },
  stable_bond_week: { titleKey: "netEventStableWeekTitle", bodyKey: "netEventStableWeekBody", rarity: "rare" },
  night_energy_surge: { titleKey: "netEventNightSurgeTitle", bodyKey: "netEventNightSurgeBody", rarity: "rare" },
  deep_compatibility: {
    titleKey: "netEventDeepCompatTitle",
    bodyKey: "netEventDeepCompatBody",
    rarity: "legendary",
  },
}

type EventStore = { events: EvolutionEvent[] }

function load(): EventStore {
  if (typeof window === "undefined") return { events: [] }
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return { events: [] }
    return JSON.parse(raw) as EventStore
  } catch {
    return { events: [] }
  }
}

function save(store: EventStore) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

export function getEvolutionEvents(): EvolutionEvent[] {
  return load().events.sort((a, b) => b.at - a.at)
}

export function getUnseenEvolutionEvents(): EvolutionEvent[] {
  return getEvolutionEvents().filter((e) => !e.seen)
}

export function markEvolutionEventSeen(id: string) {
  const store = load()
  store.events = store.events.map((e) => (e.id === id ? { ...e, seen: true } : e))
  save(store)
}

function hasRecentKind(profileId: number, kind: EvolutionEventKind, withinMs = 6 * 60 * 60 * 1000): boolean {
  const cutoff = Date.now() - withinMs
  return load().events.some((e) => e.profileId === profileId && e.kind === kind && e.at >= cutoff)
}

export function detectEvolutionEvents(
  profileId: number,
  view: ConnectionView,
  analysis: ConnectionAnalysis,
  ecology: RelationshipEcology | null
): EvolutionEvent[] {
  const hour = new Date().getHours()
  const detected: EvolutionEventKind[] = []

  if (analysis.syncPercent >= 92 && analysis.momentum > 0.15 && !hasRecentKind(profileId, "sync_peak")) {
    detected.push("sync_peak")
  }
  if (
    ecology?.stage === "emotional_resonance" ||
    ecology?.stage === "high_sync"
  ) {
    if (!hasRecentKind(profileId, "emotional_resonance", 12 * 60 * 60 * 1000)) {
      detected.push("emotional_resonance")
    }
  }
  if (view.streakDays >= 7 && view.isStable && !hasRecentKind(profileId, "stable_bond_week", 24 * 60 * 60 * 1000)) {
    detected.push("stable_bond_week")
  }
  if (hour >= 20 && hour <= 23 && analysis.syncPercent >= 70 && !hasRecentKind(profileId, "night_energy_surge")) {
    detected.push("night_energy_surge")
  }
  if (
    analysis.bondPercent >= 65 &&
    analysis.signals.oneSidedRatio <= 0.45 &&
    ecology?.attachmentPattern === "secure" &&
    !hasRecentKind(profileId, "deep_compatibility", 24 * 60 * 60 * 1000)
  ) {
    detected.push("deep_compatibility")
  }

  const newEvents: EvolutionEvent[] = []
  for (const kind of detected) {
    const meta = META[kind]
    newEvents.push({
      id: `${profileId}-${kind}-${Date.now()}`,
      kind,
      profileId,
      at: Date.now(),
      seen: false,
      rarity: meta.rarity,
      titleKey: meta.titleKey,
      bodyKey: meta.bodyKey,
    })
  }
  return newEvents
}

export function persistEvolutionEvents(incoming: EvolutionEvent[]): EvolutionEvent[] {
  if (incoming.length === 0) return []
  const store = load()
  const ids = new Set(store.events.map((e) => e.id))
  const merged = [...incoming.filter((e) => !ids.has(e.id)), ...store.events].slice(0, MAX_STORED)
  save({ events: merged })
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ttm-evolution-event", { detail: { count: incoming.length } }))
  }
  return incoming
}
