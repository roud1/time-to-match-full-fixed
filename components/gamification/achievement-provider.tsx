"use client"

import { useCallback, useEffect, useState } from "react"
import type { GamificationSnapshot, UnlockedAchievement } from "@/lib/gamification/types"
import { AchievementPopup } from "@/components/gamification/achievement-popup"

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<UnlockedAchievement[]>([])

  const enqueue = useCallback((snapshot: GamificationSnapshot) => {
    if (!snapshot.unlocked?.length) return
    setQueue((prev) => {
      const keys = new Set(prev.map((p) => p.key))
      const next = snapshot.unlocked.filter((u) => !keys.has(u.key))
      return [...prev, ...next]
    })
  }, [])

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<GamificationSnapshot>).detail
      if (detail) enqueue(detail)
    }
    window.addEventListener("ttm-gamification-updated", onUpdate)
    return () => window.removeEventListener("ttm-gamification-updated", onUpdate)
  }, [enqueue])

  const dismiss = useCallback((key: string) => {
    setQueue((prev) => prev.filter((p) => p.key !== key))
  }, [])

  return (
    <>
      {children}
      <AchievementPopup queue={queue} onDismiss={dismiss} />
    </>
  )
}
