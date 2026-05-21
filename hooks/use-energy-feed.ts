"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { buildEnergyWhispers, type EnergyWhisper } from "@/lib/network"
import { subscribeWorldPulse } from "@/lib/world"
import { runConnectionTicks } from "@/lib/connection-store"

export function useEnergyFeed(): EnergyWhisper | null {
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    runConnectionTicks()
    const unsub = subscribeWorldPulse(() => {
      runConnectionTicks()
      refresh()
    })
    const interval = window.setInterval(() => {
      runConnectionTicks()
      refresh()
    }, 5000)
    return () => {
      unsub()
      clearInterval(interval)
    }
  }, [refresh])

  return useMemo(() => {
    void tick
    const whispers = buildEnergyWhispers()
    return whispers[0] ?? null
  }, [tick])
}
