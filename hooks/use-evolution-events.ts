"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  getUnseenEvolutionEvents,
  markEvolutionEventSeen,
  type EvolutionEvent,
} from "@/lib/network"

export function useEvolutionEvents(): {
  pending: EvolutionEvent | null
  dismiss: () => void
} {
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    const onEvolution = () => refresh()
    const onConnection = () => refresh()
    window.addEventListener("ttm-evolution-event", onEvolution)
    window.addEventListener("ttm-connection-updated", onConnection)
    return () => {
      window.removeEventListener("ttm-evolution-event", onEvolution)
      window.removeEventListener("ttm-connection-updated", onConnection)
    }
  }, [refresh])

  const pending = useMemo(() => {
    void tick
    const unseen = getUnseenEvolutionEvents()
    return unseen[0] ?? null
  }, [tick])

  const dismiss = useCallback(() => {
    if (pending) markEvolutionEventSeen(pending.id)
    refresh()
  }, [pending, refresh])

  return { pending, dismiss }
}
