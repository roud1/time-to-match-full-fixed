import { discoverIdToNumeric } from "@/lib/discover/map-profile"
import { fetchActiveMatches, isLocalMatchId, localMatchId } from "@/lib/match-freeze-client"

export const serverMatchKey = (profileId: number) => `ttm-server-match:${profileId}`

export function storeServerMatchId(profileId: number, matchId: string): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(serverMatchKey(profileId), matchId)
}

export function readStoredServerMatchId(profileId: number): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(serverMatchKey(profileId))
}

/** Resolve like/match id for a chat profile (numeric discover id). */
export async function resolveMatchIdForProfile(profileId: number): Promise<string> {
  const stored = readStoredServerMatchId(profileId)
  if (stored && !isLocalMatchId(stored)) return stored

  const matches = await fetchActiveMatches()
  const found = matches.find((m) => discoverIdToNumeric(m.peerUserId) === profileId)
  if (found) {
    storeServerMatchId(profileId, found.id)
    return found.id
  }

  return localMatchId(profileId)
}

export function findServerMatchForProfile<T extends { id: string; peerUserId: string }>(
  matches: T[],
  profileId: number
): T | undefined {
  const stored = readStoredServerMatchId(profileId)
  if (stored) {
    const byId = matches.find((m) => m.id === stored)
    if (byId) return byId
  }
  return matches.find((m) => discoverIdToNumeric(m.peerUserId) === profileId)
}
