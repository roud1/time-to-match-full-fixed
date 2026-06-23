"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchActiveMatches } from "@/client/lib/match-freeze-client"
import { findServerMatchForProfile } from "@/client/lib/matches/resolve"
import type { MatchDto } from "@/server/matches/types"

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
  return findServerMatchForProfile(data, profileId) ?? null
}
