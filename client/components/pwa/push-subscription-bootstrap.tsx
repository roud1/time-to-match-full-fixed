"use client"

import { useEffect } from "react"
import { getPushEnabled } from "@/client/lib/push-notifications"
import { usePushSubscription } from "@/client/hooks/use-push-subscription"

/** Syncs Web Push subscription to the server when user has push enabled. */
export function PushSubscriptionBootstrap() {
  const enabled = typeof window !== "undefined" && getPushEnabled()
  const { syncSubscription } = usePushSubscription(enabled)

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && getPushEnabled()) {
        void syncSubscription()
      }
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [syncSubscription])

  return null
}
