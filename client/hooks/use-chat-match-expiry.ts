"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { getConnection } from "@/client/lib/connection-store"
import { fetchActiveMatches, localMatchId } from "@/client/lib/match-freeze-client"
import { findServerMatchForProfile, serverMatchKey } from "@/client/lib/matches/resolve"
import type { MatchDto } from "@/server/matches/types"

const serverMatchKeyExport = serverMatchKey

export type ChatMatchExpiryState = {
  matchId: string
  expiresAt: string
  isFrozen: boolean
  flashKey: number
  refresh: () => void
  applyFreeze: (patch: { expiresAt: string; isFrozen: boolean; matchId?: string }) => void
}

export function useChatMatchExpiry(profileId: number | null | undefined): ChatMatchExpiryState | null {
  const [serverMatch, setServerMatch] = useState<MatchDto | null>(null)
  const [override, setOverride] = useState<{ expiresAt: string; isFrozen: boolean } | null>(null)
  const [flashKey, setFlashKey] = useState(0)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => {
    setTick((n) => n + 1)
  }, [])

  useEffect(() => {
    if (profileId == null) return
    let cancelled = false

    void fetchActiveMatches().then((matches) => {
      if (cancelled) return
      const found = findServerMatchForProfile(matches, profileId) ?? null
      setServerMatch(found)
    })

    const onUpdate = () => refresh()
    window.addEventListener("ttm-connection-updated", onUpdate)
    window.addEventListener("ttm-social-updated", onUpdate)
    return () => {
      cancelled = true
      window.removeEventListener("ttm-connection-updated", onUpdate)
      window.removeEventListener("ttm-social-updated", onUpdate)
    }
  }, [profileId, refresh, tick])

  return useMemo(() => {
    void tick
    if (profileId == null) return null

    const connection = getConnection(profileId)
    if (!connection) return null

    const matchId = serverMatch?.id ?? localMatchId(profileId)
    const expiresAt =
      override?.expiresAt ??
      serverMatch?.expiresAt ??
      new Date(connection.expiresAt).toISOString()
    const isFrozen = override?.isFrozen ?? serverMatch?.isFrozen ?? Boolean(connection.isFrozen)

    return {
      matchId,
      expiresAt,
      isFrozen,
      flashKey,
      refresh,
      applyFreeze: (patch) => {
        if (patch.matchId && typeof window !== "undefined") {
          sessionStorage.setItem(serverMatchKeyExport(profileId), patch.matchId)
          setServerMatch((prev) =>
            prev
              ? { ...prev, ...patch, id: patch.matchId! }
              : {
                  id: patch.matchId!,
                  peerUserId: "",
                  peerName: null,
                  expiresAt: patch.expiresAt,
                  isFrozen: patch.isFrozen,
                  isExpired: false,
                  bond: {
                    totalMessages: 0,
                    prolongCount: 0,
                    bondLevel: 0,
                    bondProgress: 0,
                    messagesUntilNext: 5,
                    lastProlongedAt: null,
                  },
                }
          )
        }
        setOverride({ expiresAt: patch.expiresAt, isFrozen: patch.isFrozen })
        setFlashKey((k) => k + 1)
        refresh()
      },
    }
  }, [profileId, serverMatch, override, flashKey, refresh, tick])
}
