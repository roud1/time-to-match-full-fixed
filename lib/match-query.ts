import type { MatchDto } from "@/lib/server/matches/types"
import { fetchActiveMatches, isLocalMatchId } from "@/lib/match-freeze-client"
import { localBondToMatchBond } from "@/lib/match-bond-local"

export const matchQueryKey = (matchId: string) => ["match", matchId] as const

export async function fetchMatchById(matchId: string): Promise<MatchDto | null> {
  if (isLocalMatchId(matchId)) {
    const profileId = Number.parseInt(matchId.slice("local:".length), 10)
    if (!Number.isFinite(profileId)) return null
    return {
      id: matchId,
      peerUserId: String(profileId),
      peerName: null,
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      isFrozen: false,
      isExpired: false,
      bond: localBondToMatchBond(profileId),
    }
  }
  const matches = await fetchActiveMatches()
  return matches.find((m) => m.id === matchId) ?? null
}
