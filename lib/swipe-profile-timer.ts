"use client"

import { useEffect, useMemo, useState } from "react"

const STORAGE_PREFIX = "ttm-swipe-expires-"

/** Parse demo `HH:MM:SS` or `H:MM:SS` into milliseconds. */
export function parseSwipeTimeLeft(value: string): number {
  const parts = value.split(":").map((p) => parseInt(p, 10))
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return 0
  const [h, m, s] = parts
  return ((h * 3600 + m * 60 + s) * 1000) | 0
}

export function formatSwipeTimeLeft(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function getExpiresAt(profileId: number, initialMs: number): number {
  if (typeof window === "undefined") return Date.now() + initialMs
  const key = STORAGE_PREFIX + profileId
  const stored = sessionStorage.getItem(key)
  if (stored) {
    const n = Number(stored)
    if (Number.isFinite(n)) return n
  }
  const expiresAt = Date.now() + initialMs
  sessionStorage.setItem(key, String(expiresAt))
  return expiresAt
}

/** Live countdown for swipe cards; persists end time per profile in session. */
export function useSwipeProfileCountdown(profileId: number, initialTimeLeft: string, active: boolean) {
  const initialMs = useMemo(() => parseSwipeTimeLeft(initialTimeLeft), [initialTimeLeft])
  const [display, setDisplay] = useState(initialTimeLeft)

  useEffect(() => {
    if (!active || initialMs <= 0) {
      setDisplay(initialTimeLeft)
      return
    }
    const expiresAt = getExpiresAt(profileId, initialMs)
    const tick = () => setDisplay(formatSwipeTimeLeft(expiresAt - Date.now()))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [profileId, initialMs, initialTimeLeft, active])

  return display
}
