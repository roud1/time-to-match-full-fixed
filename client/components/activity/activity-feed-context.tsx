"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import type { ActivityBumpKind } from "@/client/lib/activity-notify"
import { getActivityCounts } from "@/client/lib/activity-metrics"
import { getChats, getChatsWithServerSync, getProfileById } from "@/client/lib/social-store"
import { isThreadUnread } from "@/client/lib/chat-thread-seen"
import { fetchIncomingLikes } from "@/client/lib/likes/api"
import type { ChatThread } from "@/client/lib/social-store"

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

  // Likes badge: the server's count of people who liked me (the local store only holds demo/old data).
  const [serverLikes, setServerLikes] = useState<number | null>(null)
  useEffect(() => {
    let alive = true
    fetchIncomingLikes()
      .then((d) => {
        if (alive && typeof d.count === "number") setServerLikes(d.count)
      })
      .catch(() => null)
    return () => {
      alive = false
    }
  }, [tick])

  // Chats with the server's newest message per match, so the unread badge also counts messages
  // this device has not loaded yet (refreshed on activity, when the app is shown, and every minute).
  const [serverThreads, setServerThreads] = useState<ChatThread[] | null>(null)
  useEffect(() => {
    let alive = true
    void getChatsWithServerSync(locale, location.position)
      .then((next) => {
        if (alive) setServerThreads(next)
      })
      .catch(() => null)
    return () => {
      alive = false
    }
  }, [locale, location.position, tick])
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh()
    }, 60_000)
    return () => window.clearInterval(id)
  }, [refresh])

  const threads = useMemo(
    () => serverThreads ?? getChats(locale, location.position),
    [serverThreads, locale, location.position, tick]
  )

  const counts = useMemo(() => {
    const local = getActivityCounts(locale, location.position)
    const chatsUnread = threads.filter((th) => isThreadUnread(th)).length
    return {
      ...local,
      chatsUnread,
      likesUnread: serverLikes === null ? local.likesUnread : serverLikes,
    }
  }, [locale, location.position, tick, serverLikes, threads])

  const reconnectThreads = useMemo(() => {
    return threads.filter((th) => {
      const p = getProfileById(th.profileId, locale, location.position)
      if (!p) return false
      const parts = p.timeLeft.split(":")
      const hours = parts[0] ? parseInt(parts[0], 10) : 99
      const urgent = !Number.isNaN(hours) && hours <= 36
      return urgent && isThreadUnread(th)
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
