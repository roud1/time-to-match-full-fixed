"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchActiveMatches } from "@/lib/match-freeze-client"
import type { MatchDto } from "@/lib/server/matches/types"

export const MATCHES_QUERY_KEY = ["matches"] as const

export function useMatches() {
  return useQuery({
    queryKey: MATCHES_QUERY_KEY,
    queryFn: fetchActiveMatches,
    staleTime: 30_000,
  })
}

export function useInvalidateMatches() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: MATCHES_QUERY_KEY })
}

export function useMatchForProfile(profileId: number | null | undefined): MatchDto | null {
  const { data } = useMatches()
  if (profileId == null || !data) return null
  const stored =
    typeof window !== "undefined"
      ? sessionStorage.getItem(`ttm-server-match:${profileId}`)
      : null
  if (stored) {
    const hit = data.find((m) => m.id === stored)
    if (hit) return hit
  }
  return data.find((m) => m.peerUserId === String(profileId)) ?? null
}
