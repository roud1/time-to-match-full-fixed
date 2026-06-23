export type RealtimeState = {
  partnerTyping: boolean
  partnerOnline: boolean
  provider?: string
}

export async function fetchRealtimeState(matchId: string): Promise<RealtimeState | null> {
  if (!matchId || matchId.startsWith("local:")) return null
  try {
    const res = await fetch(`/api/realtime/state?matchId=${encodeURIComponent(matchId)}`, {
      credentials: "include",
    })
    if (!res.ok) return null
    return (await res.json()) as RealtimeState
  } catch {
    return null
  }
}

export async function sendRealtimePulse(matchId: string, typing?: boolean): Promise<RealtimeState | null> {
  if (!matchId || matchId.startsWith("local:")) return null
  try {
    const res = await fetch("/api/realtime/pulse", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, typing }),
    })
    if (!res.ok) return null
    return (await res.json()) as RealtimeState
  } catch {
    return null
  }
}

export async function fetchOnlineMap(userIds: string[]): Promise<Record<string, boolean>> {
  const ids = userIds.filter(Boolean)
  if (!ids.length) return {}
  try {
    const res = await fetch(`/api/realtime/online?ids=${encodeURIComponent(ids.join(","))}`, {
      credentials: "include",
    })
    if (!res.ok) return {}
    const data = (await res.json()) as { online?: Record<string, boolean> }
    return data.online ?? {}
  } catch {
    return {}
  }
}
