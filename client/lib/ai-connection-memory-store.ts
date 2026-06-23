import type { AIMemoryMoment } from "@/client/lib/ai-connection-engine/types"

const KEY = "ttm-ai-connection-memory"

type MemoryStore = {
  version: number
  byProfile: Record<string, AIMemoryMoment[]>
}

const DEFAULT: MemoryStore = { version: 1, byProfile: {} }

function load(): MemoryStore {
  if (typeof window === "undefined") return { ...DEFAULT }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT }
    return { ...DEFAULT, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT }
  }
}

function save(state: MemoryStore) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function getAIMemories(profileId: number): AIMemoryMoment[] {
  return load().byProfile[String(profileId)] ?? []
}

export function persistAIMemories(profileId: number, memories: AIMemoryMoment[]) {
  const state = load()
  state.byProfile[String(profileId)] = memories
  save(state)
}

export function mergeAndPersistAIMemories(profileId: number, incoming: AIMemoryMoment[]) {
  const existing = getAIMemories(profileId)
  const byId = new Map(existing.map((m) => [m.id, m]))
  for (const m of incoming) {
    const prev = byId.get(m.id)
    if (!prev || m.importance >= prev.importance) byId.set(m.id, m)
  }
  const merged = [...byId.values()].sort((a, b) => a.at - b.at)
  persistAIMemories(profileId, merged)
  return merged
}
