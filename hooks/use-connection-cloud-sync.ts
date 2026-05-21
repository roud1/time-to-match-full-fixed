"use client"

import { useEffect, useRef } from "react"
import { pullConnectionSync, scheduleConnectionSyncPush } from "@/lib/connection-sync-client"
import { trackProductEvent } from "@/lib/analytics-client"

/** Pull server snapshot on mount; push on connection/social updates. */
export function useConnectionCloudSync(enabled: boolean) {
  const pulled = useRef(false)

  useEffect(() => {
    if (!enabled || pulled.current) return
    pulled.current = true
    void pullConnectionSync().then((r) => {
      if (r.ok && r.source === "server") {
        trackProductEvent("connection_sync_pull")
      }
    })
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    const onUpdate = () => scheduleConnectionSyncPush()
    window.addEventListener("ttm-connection-updated", onUpdate)
    window.addEventListener("ttm-social-updated", onUpdate)
    return () => {
      window.removeEventListener("ttm-connection-updated", onUpdate)
      window.removeEventListener("ttm-social-updated", onUpdate)
    }
  }, [enabled])
}
