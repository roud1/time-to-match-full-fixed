"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import { buildEcosystemMemoryItems, type EcosystemMemoryItem } from "@/client/lib/ecosystem/memory-items"
import { runConnectionTicks } from "@/client/lib/connection-store"

export function useEcosystemMemories(
  profileId?: number,
  limit = 12
): EcosystemMemoryItem[] {
  const { t } = useI18n()
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    runConnectionTicks()
    const onUpdate = () => {
      runConnectionTicks()
      refresh()
    }
    window.addEventListener("ttm-connection-updated", onUpdate)
    window.addEventListener("ttm-social-updated", onUpdate)
    return () => {
      window.removeEventListener("ttm-connection-updated", onUpdate)
      window.removeEventListener("ttm-social-updated", onUpdate)
    }
  }, [refresh])

  return useMemo(() => {
    void tick
    return buildEcosystemMemoryItems(t, { profileId, limit })
  }, [tick, t, profileId, limit])
}
