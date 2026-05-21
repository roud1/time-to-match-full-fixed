"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { buildRetentionAnticipations, type RetentionAnticipation } from "@/lib/network"
import { subscribeWorldPulse } from "@/lib/world"
import { runConnectionTicks } from "@/lib/connection-store"

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
