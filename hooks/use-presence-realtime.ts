"use client"

import { useEffect, useRef, useState } from "react"
import { PRESENCE_REALTIME_EVENT } from "@/lib/presence/realtime-presence"

type UsePresenceRealtimeOptions = {
  /** Background refresh for night window + peer tiers */
  intervalMs?: number
  /** Faster tick when tab visible (smooth aura transitions) */
  activeIntervalMs?: number
  profileId?: number
}

/**
 * Adaptive presence clock — events + visibility-aware polling.
 * WebSocket layer should dispatch `ttm-presence-updated` on peer changes.
 */
export function usePresenceRealtime(options: UsePresenceRealtimeOptions = {}) {
  const { intervalMs = 30_000, activeIntervalMs = 12_000, profileId } = options
  const [tick, setTick] = useState(0)
  const profileRef = useRef(profileId)
  profileRef.current = profileId

  useEffect(() => {
    const bump = (e?: Event) => {
      const detail = (e as CustomEvent<{ profileId?: number }> | undefined)?.detail
      if (detail?.profileId != null && profileRef.current != null) {
        if (detail.profileId !== profileRef.current) return
      }
      setTick((n) => n + 1)
    }

    window.addEventListener("ttm-connection-updated", bump)
    window.addEventListener("ttm-social-updated", bump)
    window.addEventListener(PRESENCE_REALTIME_EVENT, bump)

    const slow = window.setInterval(bump, intervalMs)

    let active: ReturnType<typeof setInterval> | undefined
    const startActive = () => {
      if (document.hidden) return
      active = window.setInterval(bump, activeIntervalMs)
    }
    const stopActive = () => {
      if (active) window.clearInterval(active)
      active = undefined
    }

    const onVis = () => {
      stopActive()
      if (!document.hidden) {
        bump()
        startActive()
      }
    }

    onVis()
    document.addEventListener("visibilitychange", onVis)

    return () => {
      window.removeEventListener("ttm-connection-updated", bump)
      window.removeEventListener("ttm-social-updated", bump)
      window.removeEventListener(PRESENCE_REALTIME_EVENT, bump)
      window.clearInterval(slow)
      stopActive()
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [intervalMs, activeIntervalMs])

  return tick
}
