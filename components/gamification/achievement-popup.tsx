"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type { UnlockedAchievement } from "@/lib/gamification/types"
import { cn } from "@/lib/utils"

type AchievementPopupProps = {
  queue: UnlockedAchievement[]
  onDismiss: (key: string) => void
}

export function AchievementPopup({ queue, onDismiss }: AchievementPopupProps) {
  const reduce = useReducedMotion()
  const [current, setCurrent] = useState<UnlockedAchievement | null>(null)

  useEffect(() => {
    if (current || !queue.length) return
    setCurrent(queue[0]!)
  }, [queue, current])

  useEffect(() => {
    if (!current) return
    const id = window.setTimeout(() => {
      onDismiss(current.key)
      setCurrent(null)
    }, 4200)
    return () => clearTimeout(id)
  }, [current, onDismiss])

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          className="fixed bottom-20 left-1/2 z-[200] w-[min(92vw,22rem)] -translate-x-1/2 pointer-events-none"
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="polite"
        >
          <div
            className={cn(
              "rounded-2xl border border-[var(--accent-soft-border)] px-4 py-3.5 shadow-lg",
              "bg-[var(--bg-secondary)]/95 backdrop-blur-xl"
            )}
          >
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Достижение разблокировано!
            </p>
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none" aria-hidden>
                {current.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{current.title}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                  {current.description}
                </p>
                <p className="text-xs text-[var(--accent)] mt-1 font-medium">
                  +{current.xpReward} XP
                  {current.freezeReward > 0 ? ` · +${current.freezeReward} заморозок` : ""}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
