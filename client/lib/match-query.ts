import type { MatchDto } from "@/server/matches/types"
import { fetchActiveMatches, isLocalMatchId } from "@/client/lib/match-freeze-client"
import { fetchMatchDetail } from "@/client/lib/matches/api"
import { localBondToMatchBond } from "@/client/lib/match-bond-local"

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
  const detail = await fetchMatchDetail(matchId)
  if (detail.ok) {
    const { messages: _messages, ...rest } = detail.match
    return {
      id: rest.id,
      peerUserId: rest.peerUserId,
      peerName: rest.peerName,
      expiresAt: rest.expiresAt,
      isFrozen: rest.isFrozen ?? false,
      isExpired: rest.isExpired,
      status: rest.status,
      bond: rest.bond,
    }
  }

  const matches = await fetchActiveMatches()
  return matches.find((m) => m.id === matchId) ?? null
}
