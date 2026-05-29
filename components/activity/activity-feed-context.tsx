"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useI18n } from "@/lib/i18n"
import type { ActivityBumpKind } from "@/lib/activity-notify"
import { getActivityCounts } from "@/lib/activity-metrics"
import { getChats, getProfileById } from "@/lib/social-store"
import { hasUnreadThread } from "@/lib/chat-thread-seen"
import type { ChatThread } from "@/lib/social-store"

export type ActivityToast = {
  id: string
  variant: "message" | "like" | "match"
  title: string
  body?: string
}

type ActivityFeedContextValue = {
  hubOpen: boolean
  setHubOpen: (v: boolean) => void
  toasts: ActivityToast[]
  dismissToast: (id: string) => void
  counts: ReturnType<typeof getActivityCounts>
  refresh: () => void
  threads: ChatThread[]
  reconnectThreads: ChatThread[]
}

const ActivityFeedContext = createContext<ActivityFeedContextValue | null>(null)

export function ActivityFeedProvider({ children }: { children: React.ReactNode }) {
  const { t, locale, location } = useI18n()
  const [hubOpen, setHubOpen] = useState(false)
  const [toasts, setToasts] = useState<ActivityToast[]>([])
  const [tick, setTick] = useState(0)
  const toastSeq = useRef(0)

  const refresh = useCallback(() => setTick((x) => x + 1), [])

  const pushToast = useCallback((partial: Omit<ActivityToast, "id">) => {
    const id = `toast-${Date.now()}-${toastSeq.current++}`
    const toast: ActivityToast = { id, ...partial }
    setToasts((prev) => [...prev, toast].slice(-4))
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
    }, 5200)
  }, [])

  const pushForBump = useCallback(
    (kind: ActivityBumpKind) => {
      if (kind === "likes") {
        pushToast({
          variant: "like",
          title: t("toastNewLike"),
          body: t("toastNewLikeBody"),
        })
      } else if (kind === "matches") {
        pushToast({
          variant: "match",
          title: t("toastNewMatch"),
          body: t("toastNewMatchBody"),
        })
      } else if (kind === "chats") {
        pushToast({
          variant: "message",
          title: t("toastNewMessage"),
          body: t("toastNewMessageBody"),
        })
      }
    },
    [pushToast, t]
  )

  useEffect(() => {
    const onBump = (ev: Event) => {
      const kind = (ev as CustomEvent<{ kind: ActivityBumpKind }>).detail?.kind
      if (kind) pushForBump(kind)
      refresh()
    }
    const onVis = () => {
      if (document.visibilityState === "visible") refresh()
    }
    const onStorage = () => refresh()
    const onSocial = () => refresh()
    window.addEventListener("ttm-activity-bump", onBump)
    window.addEventListener("storage", onStorage)
    window.addEventListener("ttm-social-updated", onSocial)
    document.addEventListener("visibilitychange", onVis)
    return () => {
      window.removeEventListener("ttm-activity-bump", onBump)
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("ttm-social-updated", onSocial)
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [pushForBump, refresh])

  useEffect(() => {
    const onOpenHub = () => setHubOpen(true)
    window.addEventListener("ttm-open-activity-hub", onOpenHub)
    return () => window.removeEventListener("ttm-open-activity-hub", onOpenHub)
  }, [])

  const counts = useMemo(() => getActivityCounts(locale, location.position), [locale, location.position, tick])

  const threads = useMemo(() => getChats(locale, location.position), [locale, location.position, tick])

  const reconnectThreads = useMemo(() => {
    return threads.filter((th) => {
      const p = getProfileById(th.profileId, locale, location.position)
      if (!p) return false
      const last = th.messages[th.messages.length - 1]
      const parts = p.timeLeft.split(":")
      const hours = parts[0] ? parseInt(parts[0], 10) : 99
      const urgent = !Number.isNaN(hours) && hours <= 36
      return urgent && last?.from === "them" && hasUnreadThread(th.profileId, th.updatedAt, true)
    })
  }, [threads, locale, location.position])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const value = useMemo(
    () => ({
      hubOpen,
      setHubOpen,
      toasts,
      dismissToast,
      counts,
      refresh,
      threads,
      reconnectThreads,
    }),
    [hubOpen, toasts, dismissToast, counts, refresh, threads, reconnectThreads]
  )

  return <ActivityFeedContext.Provider value={value}>{children}</ActivityFeedContext.Provider>
}

export function useActivityFeed() {
  const ctx = useContext(ActivityFeedContext)
  if (!ctx) throw new Error("useActivityFeed must be used within ActivityFeedProvider")
  return ctx
}

export function useActivityFeedOptional() {
  return useContext(ActivityFeedContext)
}
