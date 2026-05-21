"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { formatExtensionHours, type ConnectionEvent } from "@/lib/connection-system"
import { clearConnectionEvent, getRecentConnectionEvents } from "@/lib/connection-store"
import { cn } from "@/lib/utils"

type ToastItem = ConnectionEvent & { key: string }

export function ConnectionExtensionToastStack() {
  const { t, locale } = useI18n()
  const reduce = useReducedMotion()
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const push = (events: ConnectionEvent[]) => {
      const fresh = events
        .filter((e) => e.type === "extended" || e.type === "stage_up" || e.type === "streak")
        .map((e) => ({ ...e, key: `${e.type}-${e.profileId}-${e.at}` }))
      if (fresh.length === 0) return
      setToasts((prev) => {
        const keys = new Set(prev.map((p) => p.key))
        return [...fresh.filter((f) => !keys.has(f.key)), ...prev].slice(0, 3)
      })
    }

    push(getRecentConnectionEvents())

    const onUpdate = (ev: Event) => {
      const detail = (ev as CustomEvent<{ events?: ConnectionEvent[] }>).detail
      if (detail?.events) push(detail.events)
    }
    window.addEventListener("ttm-connection-updated", onUpdate)
    return () => window.removeEventListener("ttm-connection-updated", onUpdate)
  }, [])

  useEffect(() => {
    if (toasts.length === 0) return
    const id = window.setTimeout(() => {
      const removed = toasts[toasts.length - 1]
      if (removed) clearConnectionEvent(removed.at, removed.type, removed.profileId)
      setToasts((prev) => prev.slice(0, -1))
    }, 3200)
    return () => clearTimeout(id)
  }, [toasts])

  const label = (item: ToastItem) => {
    if (item.type === "extended") {
      return `${t("connectionExtended")} ${formatExtensionHours(item.addedMs, locale)}`
    }
    if (item.type === "streak") {
      return t("connectionStreakChoosing")
    }
    if (item.type === "stage_up") {
      const key =
        item.stage === "stable"
          ? "connectionStageStable"
          : item.stage === "rare"
            ? "connectionStageRare"
            : item.stage === "strong"
              ? "connectionStageStrong"
              : item.stage === "active"
                ? "connectionStageActive"
                : "connectionStageSpark"
      return t(key as "connectionStageSpark")
    }
    return t("connectionExtended")
  }

  return (
    <div className="pointer-events-none fixed top-[max(4.5rem,env(safe-area-inset-top))] left-0 right-0 z-[65] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((item) => (
          <motion.div
            key={item.key}
            initial={reduce ? false : { opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className={cn(
              "pointer-events-auto rounded-2xl border border-white/14 px-4 py-2.5 text-sm font-light",
              "bg-black/75 backdrop-blur-xl shadow-[0_16px_48px_-20px_rgba(255,255,255,0.45)]",
              "text-white/90/95 max-w-sm text-center"
            )}
          >
            {label(item)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
