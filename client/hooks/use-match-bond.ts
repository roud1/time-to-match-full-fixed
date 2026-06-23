"use client"

import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { MessageSentResponse, MatchBondStats } from "@/server/matches/types"
import { localBondToMatchBond } from "@/client/lib/match-bond-local"
import { isLocalMatchId } from "@/client/lib/match-freeze-client"
import { matchQueryKey, patchMatchQueryCache, useMatch } from "@/client/hooks/use-match"
import { MATCHES_QUERY_KEY } from "@/client/hooks/use-matches"
import { bondFromPayload } from "@/client/lib/match-bond-client"
import { BOND_MESSAGES_PER_PROLONG } from "@/server/matches/bond-constants"

export type BondUiState = MatchBondStats & {
  /** prolong_count + 1 for display */
  displayLevel: number
  flashKey: number
  lastProlongedFlash: boolean
}

const defaultBond = (): MatchBondStats => ({
  totalMessages: 0,
  prolongCount: 0,
  bondLevel: 0,
  bondProgress: 0,
  messagesUntilNext: BOND_MESSAGES_PER_PROLONG,
  lastProlongedAt: null,
})

export function useMatchBond(profileId: number | null | undefined, matchId: string | null) {
  const qc = useQueryClient()
  const { data: match } = useMatch(matchId)
  const [flashKey, setFlashKey] = useState(0)
  const [lastProlongedFlash, setLastProlongedFlash] = useState(false)

  useEffect(() => {
    if (profileId == null || !matchId) return
    const onBond = (e: Event) => {
      const detail = (e as CustomEvent<{
        profileId: number
        matchId: string
        payload: MessageSentResponse
      }>).detail
      if (detail?.profileId !== profileId || detail.matchId !== matchId) return

      const bond = bondFromPayload(detail.payload)
      patchMatchQueryCache(qc, matchId, {
        bond,
        ...(detail.payload.newExpiresAt ? { expiresAt: detail.payload.newExpiresAt } : {}),
      })

      qc.setQueryData<import("@/server/matches/types").MatchDto[]>(MATCHES_QUERY_KEY, (prev) => {
        if (!prev?.length) return prev
        return prev.map((m) =>
          m.id === matchId
            ? {
                ...m,
                bond,
                ...(detail.payload.newExpiresAt ? { expiresAt: detail.payload.newExpiresAt } : {}),
              }
            : m
        )
      })

      if (detail.payload.prolonged) {
        setFlashKey((k) => k + 1)
        setLastProlongedFlash(true)
        window.setTimeout(() => setLastProlongedFlash(false), 3000)
      }
    }
    window.addEventListener("ttm-bond-updated", onBond)
    return () => window.removeEventListener("ttm-bond-updated", onBond)
  }, [profileId, matchId, qc])

  return useMemo((): BondUiState => {
    const base =
      match?.bond ??
      (profileId != null && matchId && isLocalMatchId(matchId)
        ? localBondToMatchBond(profileId)
        : defaultBond())
    const displayLevel = base.prolongCount + 1
    return {
      ...base,
      displayLevel,
      flashKey,
      lastProlongedFlash,
    }
  }, [match?.bond, profileId, matchId, flashKey, lastProlongedFlash])
}
