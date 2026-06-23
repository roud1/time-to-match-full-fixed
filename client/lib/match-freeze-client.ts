import type { FreezeMatchResponse, MatchDto } from "@/server/matches/types"

export type FreezeMatchApiError = {
  error: string
  message?: string
}

export async function fetchActiveMatches(): Promise<MatchDto[]> {
  try {
    const res = await fetch("/api/matches", { credentials: "include", cache: "no-store" })
    if (!res.ok) return []
    const data = (await res.json()) as { matches: MatchDto[] }
    return data.matches ?? []
  } catch {
    return []
  }
}

export async function freezeMatch(
  matchId: string
): Promise<
  | { ok: true; match: MatchDto; gamification?: FreezeMatchResponse["gamification"] }
  | { ok: false; error: FreezeMatchApiError }
> {
  try {
    const res = await fetch(`/api/matches/${encodeURIComponent(matchId)}/freeze`, {
      method: "POST",
      credentials: "include",
    })
    const body = (await res.json()) as FreezeMatchResponse & FreezeMatchApiError
    if (!res.ok) {
      return { ok: false, error: { error: body.error ?? "unknown", message: body.message } }
    }
    return { ok: true, match: body.match, gamification: body.gamification }
  } catch {
    return { ok: false, error: { error: "network_error", message: "Network error" } }
  }
}

export function localMatchId(profileId: number): string {
  return `local:${profileId}`
}

export function isLocalMatchId(matchId: string): boolean {
  return matchId.startsWith("local:")
}
