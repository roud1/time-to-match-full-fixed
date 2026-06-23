"use client"

import { useEffect, useState } from "react"
import { fetchOnlineMap } from "@/lib/chat-realtime-client"

const POLL_MS = 30_000

/** Batch online presence for match list rows (optional MVP). */
export function useMatchPresence(peerUserIds: string[]) {
  const [online, setOnline] = useState<Record<string, boolean>>({})
  const key = peerUserIds.filter(Boolean).sort().join(",")

  useEffect(() => {
    const ids = key ? key.split(",") : []
    if (!ids.length) {
      setOnline({})
      return
    }

    let cancelled = false

    const refresh = async () => {
      const map = await fetchOnlineMap(ids)
      if (!cancelled) setOnline(map)
    }

    void refresh()
    const id = window.setInterval(refresh, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [key])

  return online
}
