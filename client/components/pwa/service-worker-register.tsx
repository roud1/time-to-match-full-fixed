"use client"

import { useEffect } from "react"
import { registerAppServiceWorker, unregisterAppServiceWorkers } from "@/client/lib/push-notifications"

/** Registers PWA service worker in production; clears SW + Cache Storage in dev (stale SW = blank pages). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      void unregisterAppServiceWorkers()
      return
    }
    void registerAppServiceWorker()
  }, [])
  return null
}
