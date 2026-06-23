"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchAchievements } from "@/client/lib/gamification/api"

export const ACHIEVEMENTS_QUERY_KEY = ["achievements"] as const

export function useAchievements(enabled = true) {
  return useQuery({
    queryKey: ACHIEVEMENTS_QUERY_KEY,
    queryFn: fetchAchievements,
    enabled,
    staleTime: 60_000,
  })
}
