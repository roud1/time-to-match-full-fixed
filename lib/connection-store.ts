import {
  applyInteraction,
  createConnectionRecord,
  tickConnection,
  type ConnectionEvent,
  type ConnectionMemory,
  type ConnectionRecord,
} from "@/lib/connection-system"

const STORE_KEY = "ttm-connections"
const STORE_VERSION = 1
const MAX_EVENTS = 8

type ConnectionStoreState = {
  version: number
  connections: ConnectionRecord[]
  memories: ConnectionMemory[]
  recentEvents: ConnectionEvent[]
}

const DEFAULT: ConnectionStoreState = {
  version: STORE_VERSION,
  connections: [],
  memories: [],
  recentEvents: [],
}

function load(): ConnectionStoreState {
  if (typeof window === "undefined") return { ...DEFAULT, connections: [], memories: [], recentEvents: [] }
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return { ...DEFAULT }
    const parsed = JSON.parse(raw) as Partial<ConnectionStoreState>
    return {
      ...DEFAULT,
      ...parsed,
      connections: parsed.connections ?? [],
      memories: parsed.memories ?? [],
      recentEvents: parsed.recentEvents ?? [],
    }
  } catch {
    return { ...DEFAULT }
  }
}

function save(state: ConnectionStoreState) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORE_KEY, JSON.stringify(state))
}

function dispatch(events: ConnectionEvent[]) {
  if (typeof window === "undefined" || events.length === 0) return
  window.dispatchEvent(new CustomEvent("ttm-connection-updated", { detail: { events } }))
  window.dispatchEvent(new CustomEvent("ttm-social-updated"))
}

export function getConnectionStore(): ConnectionStoreState {
  return load()
}

export function getConnection(profileId: number): ConnectionRecord | undefined {
  return load().connections.find((c) => c.profileId === profileId && c.status !== "archived")
}

export function getActiveConnections(): ConnectionRecord[] {
  return load().connections.filter((c) => c.status !== "archived")
}

export function getConnectionMemories(): ConnectionMemory[] {
  return [...load().memories].sort((a, b) => b.endedAt - a.endedAt)
}

export function getRecentConnectionEvents(): ConnectionEvent[] {
  return load().recentEvents
}

export function ensureConnectionForMatch(
  profileId: number,
  matchedAt?: number
): ConnectionRecord {
  let state = load()
  let existing = state.connections.find((c) => c.profileId === profileId)
  if (existing && existing.status !== "archived") return existing

  const record = createConnectionRecord(profileId, matchedAt ?? Date.now())
  if (existing?.status === "archived") {
    state.connections = state.connections.map((c) =>
      c.profileId === profileId ? record : c
    )
  } else {
    state.connections.push(record)
  }
  save(state)
  dispatch([])
  return record
}

/** Backfill connections for existing matches without one. */
export function migrateConnectionsFromMatches(
  matchIds: number[],
  chatUpdatedAt: Map<number, number>
) {
  let state = load()
  let changed = false
  for (const id of matchIds) {
    const hasActive = state.connections.some((c) => c.profileId === id && c.status !== "archived")
    if (hasActive) continue
    const archived = state.connections.find((c) => c.profileId === id && c.status === "archived")
    if (archived) continue
    const matchedAt = chatUpdatedAt.get(id) ?? Date.now() - 6 * 60 * 60 * 1000
    const record = createConnectionRecord(id, matchedAt)
    record.lastInteractionAt = chatUpdatedAt.get(id) ?? matchedAt
    record.messagesExchanged = 1
    record.theirMessages = 1
    record.streakScore = 4
    record.stage = "spark"
    state.connections.push(record)
    changed = true
  }
  if (changed) save(state)
}

export function recordConnectionMessage(
  profileId: number,
  from: "me" | "them" = "me"
): ConnectionEvent[] {
  let state = load()
  let record = state.connections.find((c) => c.profileId === profileId && c.status !== "archived")
  if (!record) {
    record = createConnectionRecord(profileId)
    state.connections.push(record)
  }

  const normalized: ConnectionRecord = {
    ...record,
    myMessages: record.myMessages ?? 0,
    theirMessages: record.theirMessages ?? 0,
    bothParticipated: record.bothParticipated ?? false,
  }

  const { record: next, events } = applyInteraction(normalized, from)
  state.connections = state.connections.map((c) => (c.profileId === profileId ? next : c))
  state.recentEvents = [...events, ...state.recentEvents].slice(0, MAX_EVENTS)
  save(state)
  dispatch(events)
  return events
}

export function runConnectionTicks(): ConnectionEvent[] {
  let state = load()
  const allEvents: ConnectionEvent[] = []
  const nextConnections: ConnectionRecord[] = []
  const newMemories: ConnectionMemory[] = []

  for (const record of state.connections) {
    if (record.status === "archived") {
      nextConnections.push(record)
      continue
    }
    const { record: next, events, archived } = tickConnection(record)
    nextConnections.push(next)
    allEvents.push(...events)
    if (archived) {
      newMemories.push(archived)
    }
  }

  if (allEvents.length > 0 || newMemories.length > 0) {
    state.connections = nextConnections
    state.memories = [...newMemories, ...state.memories]
    state.recentEvents = [...allEvents, ...state.recentEvents].slice(0, MAX_EVENTS)
    save(state)
    dispatch(allEvents)
  }

  return allEvents
}

export function setMemoryProfileName(profileId: number, name: string) {
  const state = load()
  const memories = state.memories.map((m) =>
    m.profileId === profileId && !m.profileName ? { ...m, profileName: name } : m
  )
  if (memories.some((m, i) => m !== state.memories[i])) {
    save({ ...state, memories })
  }
}

export function clearConnectionEvent(eventAt: number, type: ConnectionEvent["type"], profileId: number) {
  const state = load()
  state.recentEvents = state.recentEvents.filter(
    (e) => !(e.at === eventAt && e.type === type && e.profileId === profileId)
  )
  save(state)
}
