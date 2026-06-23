"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  computeEmotionalWorldState,
  subscribeWorldPulse,
  type EmotionalWorldState,
} from "@/client/lib/world"
import { runConnectionTicks } from "@/client/lib/connection-store"

export function useEmotionalWorld(): EmotionalWorldState {
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    runConnectionTicks()
    const interval = window.setInterval(() => {
      runConnectionTicks()
      setTick((n) => n + 1)
    }, 2500)
    const unsub = subscribeWorldPulse(() => {
      runConnectionTicks()
      refresh()
    })
    return () => {
      clearInterval(interval)
      unsub()
    }
  }, [refresh])

  return useMemo(() => {
    void tick
    return computeEmotionalWorldState()
  }, [tick])
}
