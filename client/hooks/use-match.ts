"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchMatchById, matchQueryKey } from "@/client/lib/match-query"
import type { MatchDto } from "@/server/matches/types"

export { matchQueryKey } from "@/client/lib/match-query"

export function useMatch(matchId: string | null | undefined) {
  return useQuery({
    queryKey: matchId ? matchQueryKey(matchId) : ["match", "none"],
    queryFn: () => (matchId ? fetchMatchById(matchId) : null),
    enabled: Boolean(matchId),
    staleTime: 15_000,
  })
}

export function useInvalidateMatch() {
  const qc = useQueryClient()
  return (matchId: string) => {
    void qc.invalidateQueries({ queryKey: matchQueryKey(matchId) })
  }
}

export function patchMatchQueryCache(
  qc: ReturnType<typeof useQueryClient>,
  matchId: string,
  patch: Partial<MatchDto> & { bond?: MatchDto["bond"] }
) {
  qc.setQueryData<MatchDto | null>(matchQueryKey(matchId), (prev) =>
    prev ? { ...prev, ...patch, bond: patch.bond ?? prev.bond } : prev
  )
}
