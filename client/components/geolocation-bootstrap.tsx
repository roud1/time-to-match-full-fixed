"use client"

import { useEffect, useRef } from "react"
import { useI18n } from "@/client/lib/i18n"
import { isLocationSettled } from "@/client/lib/location-settled"

type GeolocationBootstrapProps = {
  /** Request GPS once when status is still idle (e.g. on auth or /app). */
  autoRequest?: boolean
}

/** Triggers initial geolocation prompt when appropriate. */
export function GeolocationBootstrap({ autoRequest = false }: GeolocationBootstrapProps) {
  const { location } = useI18n()
  const requestedRef = useRef(false)

  useEffect(() => {
    if (!autoRequest || requestedRef.current) return
    if (isLocationSettled()) return
    if (location.status !== "idle") return

    requestedRef.current = true
    location.requestLocation()
  }, [autoRequest, location.status, location.requestLocation])

  return null
}
