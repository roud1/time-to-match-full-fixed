"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import { getActivityCounts } from "@/lib/activity-metrics"
import { diffActivityDigest, readActivityDigest, writeActivityDigest } from "@/lib/activity-digest"
import { getChats, getProfileById } from "@/lib/social-store"
import { hasUnreadThread } from "@/lib/chat-thread-seen"
import type { ChatThread } from "@/lib/social-store"

export type ActivityToast = {
  id: string
  variant: "message" | "like" | "match"
  title: string
  body?: string
}

type ActivityPulseContextValue = {
  hubOpen: boolean
  setHubOpen: (v: boolean) => void
  toasts: ActivityToast[]
  dismissToast: (id: string) => void
  counts: ReturnType<typeof getActivityCounts>
  refresh: () => void
  threads: ChatThread[]
  reconnectThreads: ChatThread[]
}

const ActivityPulseContext = createContext<ActivityPulseContextValue | null>(null)

export function ActivityPulseProvider({ children }: { children: React.ReactNode }) {
  const { t, locale, location } = useI18n()
  const pathname = usePathname()
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

  useEffect(() => {
    const id = window.setInterval(refresh, 14000)
    const onVis = () => {
      if (document.visibilityState === "visible") refresh()
    }
    const onStorage = () => refresh()
    const onSocial = () => refresh()
    window.addEventListener("storage", onStorage)
    window.addEventListener("ttm-social-updated", onSocial)
    document.addEventListener("visibilitychange", onVis)
    return () => {
      clearInterval(id)
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("ttm-social-updated", onSocial)
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [refresh])

  useEffect(() => {
    const counts = getActivityCounts(locale, location.position)
    const prev = readActivityDigest()
    if (!prev) {
      writeActivityDigest({
        likes: counts.likesUnread,
        chats: counts.chatsUnread,
        matches: counts.matchCount,
      })
      return
    }
    const bumps = diffActivityDigest(prev, {
      likes: counts.likesUnread,
      chats: counts.chatsUnread,
      matches: counts.matchCount,
    })
    const hasMatchBump = bumps.some((b) => b.kind === "matches")
    for (const b of bumps) {
      if (b.kind === "likes")
        pushToast({
          variant: "like",
          title: t("toastNewLike"),
          body: t("toastNewLikeBody"),
        })
      if (b.kind === "matches")
        pushToast({
          variant: "match",
          title: t("toastNewMatch"),
          body: t("toastNewMatchBody"),
        })
      if (b.kind === "chats" && !hasMatchBump)
        pushToast({
          variant: "message",
          title: t("toastNewMessage"),
          body: t("toastNewMessageBody"),
        })
    }
    writeActivityDigest({
      likes: counts.likesUnread,
      chats: counts.chatsUnread,
      matches: counts.matchCount,
    })
  }, [locale, location.position, pathname, pushToast, t, tick])

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

  return <ActivityPulseContext.Provider value={value}>{children}</ActivityPulseContext.Provider>
}

export function useActivityPulse() {
  const ctx = useContext(ActivityPulseContext)
  if (!ctx) throw new Error("useActivityPulse must be used within ActivityPulseProvider")
  return ctx
}

export function useActivityPulseOptional() {
  return useContext(ActivityPulseContext)
}
