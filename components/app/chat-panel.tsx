"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import {
  appendSystemMessage,
  getChats,
  getProfileById,
  sendMessage,
  type ChatThread,
} from "@/lib/social-store"
import { reportMessageSent, bondFromPayload, patchMatchInCache } from "@/lib/match-bond-client"
import { MATCHES_QUERY_KEY, useInvalidateMatches } from "@/hooks/use-matches"
import { matchQueryKey, patchMatchQueryCache } from "@/hooks/use-match"
import { applyGamificationSnapshot } from "@/lib/gamification/apply-snapshot"
import { useChatMatchExpiry } from "@/hooks/use-chat-match-expiry"
import { useQueryClient } from "@tanstack/react-query"
import type { MatchDto } from "@/lib/server/matches/types"
import { markThreadSeen } from "@/lib/chat-thread-seen"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { ChatInboxScreen } from "@/components/chat/chat-inbox-screen"
import { ChatRoomScreen } from "@/components/chat/chat-room-screen"
import { ChatThreadTransition } from "@/components/mobile/app-tab-transition"
import { useTrustSafetyVersion } from "@/hooks/use-trust-safety-version"
import { isProfileBlocked, isProfileMuted } from "@/lib/trust-safety-store"
import { getUserProfile } from "@/lib/user-profile"
import { getConnectionMemories } from "@/lib/connection-store"
import { useProfileLife } from "@/hooks/use-profile-life"
import { cn } from "@/lib/utils"

function parseWithParam(withParam: string | null): number | null {
  if (!withParam) return null
  const id = Number.parseInt(withParam, 10)
  return Number.isFinite(id) && id > 0 ? id : null
}

export function ChatPanel() {
  const { t, locale, location } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const withParam = searchParams.get("with")
  const trustV = useTrustSafetyVersion()
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [listReady, setListReady] = useState(false)
  const [draft, setDraft] = useState("")

  const activeId = useMemo(() => parseWithParam(withParam), [withParam])

  const setActiveChat = useCallback(
    (id: number | null) => {
      if (id == null) {
        router.replace("/app?tab=chat")
        return
      }
      router.replace(`/app?tab=chat&with=${id}`)
    },
    [router]
  )

  const refresh = () => setThreads(getChats(locale, location.position))

  useEffect(() => {
    setListReady(false)
    refresh()
    const id = requestAnimationFrame(() => setListReady(true))
    return () => cancelAnimationFrame(id)
  }, [locale, location.position])

  useEffect(() => {
    const onSocial = () => refresh()
    window.addEventListener("ttm-social-updated", onSocial)
    return () => window.removeEventListener("ttm-social-updated", onSocial)
  }, [locale, location.position])

  const visibleThreads = useMemo(
    () => threads.filter((th) => !isProfileBlocked(th.profileId)),
    [threads, trustV]
  )

  useEffect(() => {
    if (activeId != null && isProfileBlocked(activeId)) {
      setActiveChat(null)
    }
  }, [activeId, trustV, setActiveChat])

  const profileMap = useMemo(() => {
    const m = new Map<number, SwipeProfile>()
    for (const th of visibleThreads) {
      const p = getProfileById(th.profileId, locale, location.position)
      if (p) m.set(th.profileId, p)
    }
    return m
  }, [visibleThreads, locale, location.position])

  const activeProfile =
    activeId != null ? getProfileById(activeId, locale, location.position) : undefined
  const activeThread = threads.find((th) => th.profileId === activeId)
  const matchExpiry = useChatMatchExpiry(activeId)
  const queryClient = useQueryClient()
  const invalidateMatches = useInvalidateMatches()

  const sendText = (text: string) => {
    if (activeId == null || !text.trim()) return
    const body = text.trim()
    sendMessage(activeId, body, locale, location.position)
    refresh()

    void reportMessageSent(activeId).then((result) => {
      if (!result.ok) return
      const { payload, matchId } = result

      if (payload.prolonged && payload.newExpiresAt && matchExpiry) {
        matchExpiry.applyFreeze({
          expiresAt: payload.newExpiresAt,
          isFrozen: matchExpiry.isFrozen,
          matchId,
        })
      }

      const systemText = payload.systemMessage ?? (payload.prolonged ? t("bondProlongToast").replace("{hours}", String(payload.addedHours ?? 6)) : null)
      if (systemText) {
        appendSystemMessage(activeId, systemText, locale, location.position)
        refresh()
      }

      queryClient.setQueryData<MatchDto[]>(MATCHES_QUERY_KEY, (prev) => {
        if (!prev?.length) return prev
        const bond = bondFromPayload(payload)
        return patchMatchInCache(prev, matchId, {
          bond,
          ...(payload.newExpiresAt ? { expiresAt: payload.newExpiresAt } : {}),
        })
      })
      patchMatchQueryCache(queryClient, matchId, {
        bond: bondFromPayload(payload),
        ...(payload.newExpiresAt ? { expiresAt: payload.newExpiresAt } : {}),
      })
      void queryClient.invalidateQueries({ queryKey: matchQueryKey(matchId) })
      void invalidateMatches()
      applyGamificationSnapshot(queryClient, payload.gamification)
    })
  }

  const handleSend = () => {
    if (!draft.trim()) return
    const text = draft.trim()
    setDraft("")
    sendText(text)
  }

  const handleSendIcebreaker = (text: string) => {
    sendText(text)
  }

  const profileLife = useProfileLife()
  const connectionsPaused =
    profileLife?.state === "sleeping" || profileLife?.state === "archived"

  if (activeId != null && activeProfile && !activeThread) {
    return (
      <div className="ttm-page ttm-page--app max-w-lg mx-auto px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground font-normal">{t("chatEmpty")}</p>
        <button
          type="button"
          className="mt-4 text-sm text-primary font-medium"
          onClick={() => setActiveChat(null)}
        >
          {t("chatBack")}
        </button>
      </div>
    )
  }

  if (activeId != null && activeProfile && activeThread) {
    return (
      <ChatThreadTransition open>
      <ChatRoomScreen
        profile={activeProfile}
        thread={activeThread}
        onBack={() => setActiveChat(null)}
        draft={draft}
        onDraftChange={setDraft}
        onSend={handleSend}
        onSendText={handleSendIcebreaker}
        composerMuted={isProfileMuted(activeId)}
        labels={{
          back: t("chatBack"),
          typing: t("chatTyping"),
          online: t("chatOnline"),
          lastSeen: t("chatLastSeen"),
          reconnect: t("chatReconnectHint"),
          safetyAria: t("trustSafetyOpenAria"),
          composerMutedHint: t("trustComposerMutedHint"),
          bubble: {
            chatDelivered: t("chatDelivered"),
            chatRead: t("chatRead"),
            chatReply: t("chatReply"),
            chatReact: t("chatReact"),
          },
          composer: {
            placeholder: t("chatPlaceholder"),
            send: t("chatSend"),
            voiceHint: t("chatVoiceHint"),
            voiceDemo: t("chatVoiceDemo"),
            attach: t("chatAttach"),
            mediaDemo: t("chatMediaDemo"),
            voiceDuration: t("chatVoiceDuration"),
            replyingTo: t("chatReplyingTo"),
            cancelReply: t("chatCancelReply"),
          },
        }}
      />
      </ChatThreadTransition>
    )
  }

  return (
    <div className={cn(connectionsPaused && "ttm-chat-life-sleeping")}>
      {connectionsPaused && profileLife && (
        <div className="ttm-surface-tile mt-3 mb-1 max-w-lg mx-auto w-full px-3 sm:px-4 rounded-2xl py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--tile-text-muted)] mb-1 font-medium">
            {t("syncLabel")}
          </p>
          <p className="text-[11px] sm:text-xs text-[var(--tile-text)] font-normal leading-relaxed">
            {profileLife.state === "sleeping" ? t("lifeSleepingBody") : t("lifeArchivedBody")}
          </p>
        </div>
      )}
      <ChatInboxScreen
        threads={visibleThreads}
        connectionsPaused={connectionsPaused}
        locale={locale}
        profilesByThread={profileMap}
        loading={!listReady}
        memories={getConnectionMemories()}
        onOpen={(id) => {
          const th = visibleThreads.find((x) => x.profileId === id)
          if (th) markThreadSeen(id, th.updatedAt)
          setActiveChat(id)
          setDraft("")
        }}
        labels={{
          title: t("tabChat"),
          subtitle: t("chatSubtitle"),
          empty: t("chatEmpty"),
          emptyTitle: t("chatEmptyNoMatchesTitle"),
          emptyBody: t("chatEmptyNoMatchesBody"),
          emptyCta: t("chatEmptyNoMatchesCta"),
          urgency: t("chatUrgencyLine"),
          reconnect: t("chatReconnectHint"),
          unread: t("chatUnread"),
          memoryTitle: t("connectionMemoryTitle"),
          memoryDays: (days) => t("connectionMemoryDays").replace("{days}", String(days)),
          memoryFaded: t("connectionMemoryFaded"),
          memoryExpired: t("connectionMemoryExpired"),
        }}
      />
    </div>
  )
}
