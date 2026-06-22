"use client"

import { trackProductEvent } from "@/lib/analytics-client"

const ONCE_KEY = "ttm-analytics-once"

function readOnceMap(): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(ONCE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

function writeOnceMap(map: Record<string, boolean>) {
  if (typeof window === "undefined") return
  localStorage.setItem(ONCE_KEY, JSON.stringify(map))
}

/** Fire a funnel event at most once per browser (per event name). */
export function trackFunnelOnce(
  event: string,
  properties?: Record<string, string | number | boolean>
) {
  const map = readOnceMap()
  if (map[event]) return
  map[event] = true
  writeOnceMap(map)
  trackProductEvent(event, properties)
}

/** Fire match_expired once per match id. */
export function trackMatchExpiredOnce(matchKey: string) {
  const map = readOnceMap()
  const key = `match_expired:${matchKey}`
  if (map[key]) return
  map[key] = true
  writeOnceMap(map)
  trackProductEvent("match_expired", { match_key: matchKey })
}
