"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { getActiveConnections, runConnectionTicks } from "@/lib/connection-store"
import { buildConnectionView } from "@/lib/connection-system"

export function computeConnectionWorldEnergy(): number {
  const connections = getActiveConnections()
  if (connections.length === 0) return 0.15
  const avg =
    connections.reduce((sum, c) => {
      const v = buildConnectionView(c)
      return sum + v.streakScore + v.streakDays * 5 + (v.isStable ? 12 : 0) + (v.isFading ? -8 : 0)
    }, 0) / connections.length
  return Math.min(0.55, Math.max(0.12, 0.12 + avg / 120))
}

export function useConnectionWorldEnergy(): number {
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    runConnectionTicks()
    const interval = window.setInterval(() => {
      runConnectionTicks()
      setTick((n) => n + 1)
    }, 2000)
    const onUpdate = () => {
      runConnectionTicks()
      refresh()
    }
    window.addEventListener("ttm-connection-updated", onUpdate)
    window.addEventListener("ttm-social-updated", onUpdate)
    return () => {
      clearInterval(interval)
      window.removeEventListener("ttm-connection-updated", onUpdate)
      window.removeEventListener("ttm-social-updated", onUpdate)
    }
  }, [refresh])

  return useMemo(() => {
    void tick
    return computeConnectionWorldEnergy()
  }, [tick])
}
