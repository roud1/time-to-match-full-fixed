"use client"

import { useCallback, useEffect, useState } from "react"
import { getActiveConnections, runConnectionTicks } from "@/client/lib/connection-store"
import {
  computeDailyReturnInsights,
  recordDailyVisit,
  shouldShowDailyReturn,
  type DailyReturnInsight,
} from "@/client/lib/shared/daily-return"
import { trackProductEvent } from "@/client/lib/analytics-client"
import { useI18n } from "@/client/lib/i18n"
import { getPushEnabled, showEmotionalPushFromKeys } from "@/client/lib/push-notifications"

export function useGrowthSession() {
  const { t } = useI18n()
  const [insights, setInsights] = useState<DailyReturnInsight[]>([])
  const [showReturn, setShowReturn] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const refresh = useCallback(() => {
    runConnectionTicks()
    const connections = getActiveConnections()
    const next = computeDailyReturnInsights(connections)
    setInsights(next)
    const show = !dismissed && shouldShowDailyReturn(connections)
    setShowReturn(show)
    if (show && next.length > 0) {
      trackProductEvent("daily_return_shown", { insights: next.length })
      const top = next[0]
      if (getPushEnabled()) {
        void showEmotionalPushFromKeys(top.titleKey, top.bodyKey, t, {
          url: top.profileId ? `/app?tab=chat&with=${top.profileId}` : "/app",
          tag: `daily-${top.id}`,
        })
      }
    }
  }, [dismissed, t])

  useEffect(() => {
    refresh()
    const onUpdate = () => refresh()
    window.addEventListener("ttm-connection-updated", onUpdate)
    window.addEventListener("ttm-social-updated", onUpdate)
    const id = setInterval(() => runConnectionTicks(), 30_000)
    return () => {
      window.removeEventListener("ttm-connection-updated", onUpdate)
      window.removeEventListener("ttm-social-updated", onUpdate)
      clearInterval(id)
    }
  }, [refresh])

  const dismissReturn = useCallback(() => {
    setDismissed(true)
    setShowReturn(false)
    recordDailyVisit(getActiveConnections())
  }, [])

  const acknowledgeReturn = useCallback(() => {
    dismissReturn()
  }, [dismissReturn])

  useEffect(() => {
    const onUnload = () => recordDailyVisit(getActiveConnections())
    window.addEventListener("beforeunload", onUnload)
    return () => {
      recordDailyVisit(getActiveConnections())
      window.removeEventListener("beforeunload", onUnload)
    }
  }, [])

  return {
    insights,
    showReturn,
    dismissReturn,
    acknowledgeReturn,
    refresh,
  }
}
