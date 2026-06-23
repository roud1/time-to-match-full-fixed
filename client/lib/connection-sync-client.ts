import { exportConnectionStore, importConnectionStore } from "@/client/lib/connection-store"

const SYNC_DEBOUNCE_MS = 4000
let pushTimer: ReturnType<typeof setTimeout> | null = null
let lastPushedAt = 0

export type ConnectionSyncResult =
  | { ok: true; source: "server" | "local" }
  | { ok: false; reason: string }

/** Pull server snapshot when JWT session cookie is present. */
export async function pullConnectionSync(): Promise<ConnectionSyncResult> {
  if (typeof window === "undefined") return { ok: false, reason: "ssr" }

  try {
    const res = await fetch("/api/v1/connections/sync", { credentials: "include" })
    if (res.status === 401) return { ok: false, reason: "no_server_session" }
    if (!res.ok) return { ok: false, reason: `http_${res.status}` }

    const data = (await res.json()) as {
      synced?: boolean
      state?: {
        connections?: unknown[]
        memories?: unknown[]
        recentEvents?: unknown[]
      } | null
    }

    if (!data.state?.connections?.length) {
      return { ok: true, source: "local" }
    }

    importConnectionStore({
      version: 1,
      connections: data.state.connections as never[],
      memories: (data.state.memories ?? []) as never[],
      recentEvents: (data.state.recentEvents ?? []) as never[],
    })
    return { ok: true, source: "server" }
  } catch {
    return { ok: false, reason: "network" }
  }
}

/** Push local store to server (debounced). */
export function scheduleConnectionSyncPush() {
  if (typeof window === "undefined") return
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => void pushConnectionSync(), SYNC_DEBOUNCE_MS)
}

export async function pushConnectionSync(): Promise<ConnectionSyncResult> {
  if (typeof window === "undefined") return { ok: false, reason: "ssr" }

  const state = exportConnectionStore()
  if (state.connections.length === 0) return { ok: false, reason: "empty" }

  try {
    const res = await fetch("/api/v1/connections/sync", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        version: state.version,
        connections: state.connections,
        memories: state.memories,
        recentEvents: state.recentEvents,
      }),
    })

    if (res.status === 401) return { ok: false, reason: "no_server_session" }
    if (!res.ok) return { ok: false, reason: `http_${res.status}` }

    lastPushedAt = Date.now()
    return { ok: true, source: "server" }
  } catch {
    return { ok: false, reason: "network" }
  }
}

export function getLastConnectionSyncAt() {
  return lastPushedAt
}
