import { isLocalMatchId } from "@/lib/match-freeze-client"
import { resolveMatchIdForProfile } from "@/lib/matches/resolve"

export async function unmatchOnServer(profileId: number): Promise<{ ok: boolean; demo?: boolean }> {
  const matchId = await resolveMatchIdForProfile(profileId)
  if (isLocalMatchId(matchId)) {
    return { ok: true, demo: true }
  }

  try {
    const res = await fetch(`/api/matches/${encodeURIComponent(matchId)}/unmatch`, {
      method: "POST",
      credentials: "include",
    })
    if (res.status === 503 || res.ok) {
      const data = (await res.json().catch(() => ({}))) as { mode?: string }
      if (data.mode === "demo") return { ok: true, demo: true }
    }
    return { ok: res.ok }
  } catch {
    return { ok: false }
  }
}
