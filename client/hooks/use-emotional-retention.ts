"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import { buildRetentionAnticipations, type RetentionAnticipation } from "@/client/lib/network"
import { subscribeWorldPulse } from "@/client/lib/world"
import { runConnectionTicks } from "@/client/lib/connection-store"

export function useEmotionalRetention(): RetentionAnticipation | null {
  const { t } = useI18n()
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    runConnectionTicks()
    const unsub = subscribeWorldPulse(refresh)
    return unsub
  }, [refresh])

  return useMemo(() => {
    void tick
    return buildRetentionAnticipations()[0] ?? null
  }, [tick, t])
}
