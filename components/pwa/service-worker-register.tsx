"use client"

import { useEffect } from "react"
import { registerAppServiceWorker } from "@/lib/push-notifications"

/** Registers PWA service worker once per session. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    void registerAppServiceWorker()
  }, [])
  return null
}
