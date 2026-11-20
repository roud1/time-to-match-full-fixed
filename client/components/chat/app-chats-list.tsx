"use client"

import "./app-chats.css"
import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Crown, MessageCircle, Search, Sparkles, X } from "lucide-react"
import type { ChatThread } from "@/client/lib/social-store"
import type { SwipeProfile } from "@/client/lib/demo-profiles"
import type { Locale } from "@/client/lib/i18n"
import { useI18n } from "@/client/lib/i18n"
import { formatChatThreadPreviewTime } from "@/client/lib/format-chat-time"
import { hasUnreadThread } from "@/client/lib/chat-thread-seen"
import { VerifiedBadge } from "@/client/components/ui/verified-badge"
import { usePremiumUpgrade } from "@/client/components/premium/premium-upgrade-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/client/components/ui/alert-dialog"
import { cn } from "@/client/lib/utils"

type AppChatsListProps = {
  threads: ChatThread[]
  profilesByThread: Map<number, SwipeProfile>
  pulseThread: ChatThread | null
  locale: Locale
  loading: boolean
  onlineByUserId: Record<string, boolean>
  onOpen: (profileId: number) => void
  onDeleteThread?: (profileId: number) => void
  /** Desktop: the list is the left column next to the open conversation. */
  compact?: boolean
  activeProfileId?: number | null
}

/** Messages from the other person after the last one I sent, if the thread is unread. */
function unreadCount(thread: ChatThread): number {
  const last = thread.messages[thread.messages.length - 1]
  if (!hasUnreadThread(thread.profileId, thread.updatedAt, last?.from === "them")) return 0
  let n = 0
  for (let i = thread.messages.length - 1; i >= 0; i--) {
    const m = thread.messages[i]
    if (m.from === "them") n++
    else if (m.from === "me") break
  }
  return n
}

/**
 * Chat list of the native app / installed PWA (rendered only when html[data-ttm-app] is set).
 * Real threads only; long-press a row to delete the conversation.
 */
export function AppChatsList({
  threads,
  profilesByThread,
  pulseThread,
  locale,
  loading,
  onlineByUserId,
  onOpen,
  onDeleteThread,
  compact = false,
  activeProfileId = null,
}: AppChatsListProps) {
  const { t } = useI18n()
  const { openUpgrade } = usePremiumUpgrade()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const pressTimer = useRef<number | null>(null)
  const longPressed = useRef(false)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return threads
      .map((thread) => ({ thread, profile: profilesByThread.get(thread.profileId) }))
      .filter((r): r is { thread: ChatThread; profile: SwipeProfile } => Boolean(r.profile))
      .filter((r) => !q || r.profile.name.toLowerCase().includes(q))
  }, [threads, profilesByThread, query])

  const startPress = (id: number) => {
    longPressed.current = false
    if (!onDeleteThread) return
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true
      setDeleteId(id)
    }, 550)
  }
  const endPress = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current)
    pressTimer.current = null
  }

  const pulseLast = pulseThread?.messages[pulseThread.messages.length - 1]
  const showPulse = Boolean(pulseThread) && (!query || "luvia ai".includes(query.trim().toLowerCase()))

  return (
    <div className={cn("ttm-app-chats", compact && "ttm-app-chats--compact")}>
      <div className="ttm-app-chats__top">
        {searchOpen ? (
          <label className="ttm-app-chats__search">
            <Search aria-hidden strokeWidth={1.8} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("appChatsSearch")}
              aria-label={t("appChatsSearch")}
            />
            <button
              type="button"
              aria-label={t("discoverFiltersClose")}
              onClick={() => {
                setQuery("")
                setSearchOpen(false)
              }}
            >
              <X aria-hidden strokeWidth={1.8} />
            </button>
          </label>
        ) : (
          <>
            <h1 className="ttm-app-chats__title">{t("appNavChats")}</h1>
            <button
              type="button"
              className="ttm-app-chats__icon-btn"
              aria-label={t("appChatsSearch")}
              onClick={() => setSearchOpen(true)}
            >
              <Search aria-hidden strokeWidth={1.8} />
            </button>
          </>
        )}
      </div>

      {loading ? (
        <ul className="ttm-app-chats__list" aria-busy>
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="ttm-app-chats__row ttm-app-chats__row--skeleton" />
          ))}
        </ul>
      ) : rows.length === 0 && !showPulse ? (
        <div className="ttm-app-chats__empty">
          <span className="ttm-app-chats__empty-icon" aria-hidden>
            <MessageCircle strokeWidth={1.6} />
          </span>
          <p className="ttm-app-chats__empty-title">{query ? t("appChatsNothingFound") : t("chatEmptyTitle")}</p>
          {!query && <p className="ttm-app-chats__empty-body">{t("chatEmptyBody")}</p>}
          {!query && (
            <Link href="/app" className="ttm-app-chats__empty-cta">
              {t("likesDiscoverCta")}
            </Link>
          )}
        </div>
      ) : (
        <ul className="ttm-app-chats__list">
          {rows.map(({ thread, profile }) => {
            const last = thread.messages[thread.messages.length - 1]
            const unread = unreadCount(thread)
            const online = profile.userId ? Boolean(onlineByUserId[profile.userId]) : false
            return (
              <li key={thread.profileId}>
                <button
                  type="button"
                  className={cn(
                    "ttm-app-chats__row",
                    unread > 0 && "is-unread",
                    activeProfileId === thread.profileId && "is-active"
                  )}
                  aria-current={activeProfileId === thread.profileId ? "true" : undefined}
                  onClick={() => {
                    if (longPressed.current) return
                    onOpen(thread.profileId)
                  }}
                  onPointerDown={() => startPress(thread.profileId)}
                  onPointerUp={endPress}
                  onPointerLeave={endPress}
                  onContextMenu={(e) => {
                    if (!onDeleteThread) return
                    e.preventDefault()
                    setDeleteId(thread.profileId)
                  }}
                >
                  <span className="ttm-app-chats__avatar">
                    <Image src={profile.image} alt="" fill sizes="56px" className="object-cover" />
                    {online && <span className="ttm-app-chats__online" aria-hidden />}
                  </span>
                  <span className="ttm-app-chats__text">
                    <span className="ttm-app-chats__name">
                      <span className="truncate">{profile.name}</span>
                      {profile.photoVerified === true && (
                        <VerifiedBadge size={15} title={t("photoVerifiedLabel")} className="shrink-0" />
                      )}
                    </span>
                    <span className="ttm-app-chats__preview">{last?.text ?? t("appChatsSayHi")}</span>
                  </span>
                  <span className="ttm-app-chats__meta">
                    <span className="ttm-app-chats__time">
                      {formatChatThreadPreviewTime(last?.at ?? thread.updatedAt, locale)}
                    </span>
                    {unread > 0 && <span className="ttm-app-chats__count">{unread > 9 ? "9+" : unread}</span>}
                  </span>
                </button>
              </li>
            )
          })}

          {showPulse && pulseThread && (
            <li>
              <button
                type="button"
                className={cn("ttm-app-chats__row", activeProfileId === pulseThread.profileId && "is-active")}
                onClick={() => onOpen(pulseThread.profileId)}
              >
                <span className="ttm-app-chats__avatar ttm-app-chats__avatar--ai" aria-hidden>
                  <Sparkles strokeWidth={1.8} />
                </span>
                <span className="ttm-app-chats__text">
                  <span className="ttm-app-chats__name">
                    <span className="truncate">Luvia AI</span>
                    <span className="ttm-app-chats__ai-chip">{t("pulseInboxBadge")}</span>
                  </span>
                  <span className="ttm-app-chats__preview">{pulseLast?.text ?? t("pulseInboxPreview")}</span>
                </span>
                <span className="ttm-app-chats__meta">
                  {pulseLast && (
                    <span className="ttm-app-chats__time">{formatChatThreadPreviewTime(pulseLast.at, locale)}</span>
                  )}
                </span>
              </button>
            </li>
          )}
        </ul>
      )}

      <button type="button" className="ttm-app-chats__premium" onClick={() => openUpgrade("likes")}>
        <span className="ttm-app-chats__crown" aria-hidden>
          <Crown strokeWidth={1.8} />
        </span>
        <span className="ttm-app-chats__premium-text">{t("appChatsPremium")}</span>
        <ChevronRight aria-hidden strokeWidth={1.8} />
      </button>

      <AlertDialog open={deleteId != null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("chatDeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("chatDeleteBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("chatDeleteCancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId != null) onDeleteThread?.(deleteId)
                setDeleteId(null)
              }}
            >
              {t("chatDeleteConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
