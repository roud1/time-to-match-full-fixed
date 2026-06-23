"use client"

/**
 * Fire-and-forget product analytics (server logs + optional log drain).
 * Safe for onboarding/retention funnels — do not send PII (email, exact coords).
 */
export function trackProductEvent(
  event: string,
  properties?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined") return
  if (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ANALYTICS_DISABLED === "1") return

  const payload = JSON.stringify({ event, properties })
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" })
      navigator.sendBeacon("/api/v1/analytics/event", blob)
      return
    }
  } catch {
    /* fall through */
  }

  void fetch("/api/v1/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {})
}

/** Canonical client analytics helper — alias for trackProductEvent. */
export const trackEvent = trackProductEvent
