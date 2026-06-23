"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  buildConnectionView,
  type ConnectionEvent,
  type ConnectionView,
} from "@/client/lib/connection-system"
import {
  getConnection,
  getRecentConnectionEvents,
  runConnectionTicks,
} from "@/client/lib/connection-store"

export function useConnectionLive(profileId: number | null | undefined): ConnectionView | null {
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    if (profileId == null) return
    runConnectionTicks()
    const interval = window.setInterval(() => {
      runConnectionTicks()
      setTick((n) => n + 1)
    }, 1000)
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
  }, [profileId, refresh])

  return useMemo(() => {
    void tick
    if (profileId == null) return null
    const record = getConnection(profileId)
    if (!record) return null
    return buildConnectionView(record)
  }, [profileId, tick])
}

export function useConnectionEvents(): ConnectionEvent[] {
  const [events, setEvents] = useState<ConnectionEvent[]>([])

  useEffect(() => {
    const sync = () => setEvents(getRecentConnectionEvents())
    sync()
    window.addEventListener("ttm-connection-updated", sync)
    return () => window.removeEventListener("ttm-connection-updated", sync)
  }, [])

  return events
}
