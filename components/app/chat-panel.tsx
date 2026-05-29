"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import {
  appendSystemMessage,
  deleteChatThread,
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
import { PulseChatRoom } from "@/components/chat/pulse-chat-room"
import { ChatDesktopShell } from "@/components/chat/chat-desktop-shell"
import { ChatThreadTransition } from "@/components/mobile/app-tab-transition"
import { useTrustSafetyVersion } from "@/hooks/use-trust-safety-version"
import { isProfileBlocked, isProfileMuted } from "@/lib/trust-safety-store"
import { getConnectionMemories } from "@/lib/connection-store"
import { useProfileLife } from "@/hooks/use-profile-life"
import { useDesktopAppNav } from "@/hooks/use-desktop-app-nav"
import { isPulseProfileId } from "@/lib/pulse/constants"
import { getPulseThread, subscribePulseChat } from "@/lib/pulse/chat-store"
import { cn } from "@/lib/utils"

function parseWithParam(withParam: string | null): number | null {
  if (!withParam) return null
  const id = Number.parseInt(withParam, 10)
  return Number.isFinite(id) && id > 0 ? id : null
}

function ChatDesktopPlaceholder({ title, body }: { title: string; body: string }) {
  return (
    <div className="ttm-chat-desktop-placeholder" role="status">
      <p className="ttm-chat-desktop-placeholder__title">{title}</p>
      <p className="ttm-chat-desktop-placeholder__body">{body}</p>
    </div>
  )
}

export function ChatPanel() {
  const { t, locale, location } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const withParam = searchParams.get("with")
  const trustV = useTrustSafetyVersion()
  const isDesktop = useDesktopAppNav()
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [pulseThread, setPulseThread] = useState<ChatThread | null>(null)
  const [listReady, setListReady] = useState(false)
  const [draft, setDraft] = useState("")

  const activeId = useMemo(() => parseWithParam(withParam), [withParam])
  const isPulseActive = activeId != null && isPulseProfileId(activeId)

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

  const refreshPulse = useCallback(() => {
    setPulseThread(getPulseThread(t("pulseWelcome")))
  }, [t])

  const refresh = useCallback(() => {
    setThreads(getChats(locale, location.position))
    refreshPulse()
  }, [locale, location.position, refreshPulse])

  useEffect(() => {
    setListReady(false)
    refresh()
    const id = requestAnimationFrame(() => setListReady(true))
    return () => cancelAnimationFrame(id)
  }, [refresh])

  useEffect(() => {
    const onSocial = () => refresh()
    window.addEventListener("ttm-social-updated", onSocial)
    return () => window.removeEventListener("ttm-social-updated", onSocial)
  }, [refresh])

  useEffect(() => subscribePulseChat(refreshPulse), [refreshPulse])

  const visibleThreads = useMemo(
    () => threads.filter((th) => !isProfileBlocked(th.profileId)),
    [threads, trustV]
  )

  useEffect(() => {
    if (activeId != null && !isPulseProfileId(activeId) && isProfileBlocked(activeId)) {
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
  const activeThread = isPulseActive
    ? pulseThread
    : threads.find((th) => th.profileId === activeId)
  const matchExpiry = useChatMatchExpiry(isPulseActive ? null : activeId)
  const queryClient = useQueryClient()
  const invalidateMatches = useInvalidateMatches()

  const inboxLabels = {
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
    memoryDays: (days: number) => t("connectionMemoryDays").replace("{days}", String(days)),
    memoryFaded: t("connectionMemoryFaded"),
    memoryExpired: t("connectionMemoryExpired"),
  }

  const roomLabels = {
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
  }

  const sendText = (text: string) => {
    if (activeId == null || isPulseProfileId(activeId) || !text.trim()) return
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

      const systemText =
        payload.systemMessage ??
        (payload.prolonged ? t("bondProlongToast").replace("{hours}", String(payload.addedHours ?? 6)) : null)
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
    if (!draft.trim() || isPulseActive) return
    const text = draft.trim()
    setDraft("")
    sendText(text)
  }

  const handleSendIcebreaker = (text: string) => {
    sendText(text)
  }

  const handleOpenThread = (id: number) => {
    if (isPulseProfileId(id)) {
      const th = pulseThread ?? getPulseThread(t("pulseWelcome"))
      markThreadSeen(id, th.updatedAt)
      setActiveChat(id)
      setDraft("")
      refreshPulse()
      return
    }
    const th = visibleThreads.find((x) => x.profileId === id)
    if (th) markThreadSeen(id, th.updatedAt)
    setActiveChat(id)
    setDraft("")
  }

  const handleDeleteThread = (profileId: number) => {
    if (!deleteChatThread(profileId)) return
    refresh()
    if (activeId === profileId) setActiveChat(null)
  }

  const profileLife = useProfileLife()
  const connectionsPaused =
    profileLife?.state === "sleeping" || profileLife?.state === "archived"

  const pausedBanner =
    connectionsPaused && profileLife ? (
      <div className="ttm-surface-tile mb-2 max-w-lg mx-auto w-full px-3 sm:px-4 rounded-2xl py-3 shrink-0">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--tile-text-muted)] mb-1 font-medium">
          {t("syncLabel")}
        </p>
        <p className="text-[11px] sm:text-xs text-[var(--tile-text)] font-normal leading-relaxed">
          {profileLife.state === "sleeping" ? t("lifeSleepingBody") : t("lifeArchivedBody")}
        </p>
      </div>
    ) : null

  const inbox = (
    <ChatInboxScreen
      threads={visibleThreads}
      connectionsPaused={connectionsPaused}
      locale={locale}
      profilesByThread={profileMap}
      loading={!listReady}
      memories={getConnectionMemories()}
      variant={isDesktop ? "sidebar" : "page"}
      activeProfileId={isDesktop ? activeId : null}
      pulseThread={pulseThread}
      onOpen={handleOpenThread}
      onDeleteThread={handleDeleteThread}
      labels={inboxLabels}
    />
  )

  const pulseRoom =
    isPulseActive && activeProfile && activeThread ? (
      <PulseChatRoom
        profile={activeProfile}
        thread={activeThread}
        onBack={() => setActiveChat(null)}
        showBack={!isDesktop}
        layout={isDesktop ? "embedded" : "fullscreen"}
        draft={draft}
        onDraftChange={setDraft}
        labels={roomLabels}
      />
    ) : null

  const room =
    !isPulseActive && activeId != null && activeProfile && activeThread ? (
      <ChatRoomScreen
        profile={activeProfile}
        thread={activeThread}
        onBack={() => setActiveChat(null)}
        showBack={!isDesktop}
        layout={isDesktop ? "embedded" : "fullscreen"}
        draft={draft}
        onDraftChange={setDraft}
        onSend={handleSend}
        onSendText={handleSendIcebreaker}
        composerMuted={isProfileMuted(activeId)}
        labels={roomLabels}
      />
    ) : null

  const activeRoom = pulseRoom ?? room

  if (isDesktop) {
    return (
      <div className={cn(connectionsPaused && "ttm-chat-life-sleeping", "ttm-chat-page")}>
        {pausedBanner}
        <ChatDesktopShell
          list={inbox}
          main={
            activeRoom ?? (
              <ChatDesktopPlaceholder
                title={t("chatDesktopPickTitle")}
                body={t("chatDesktopPickBody")}
              />
            )
          }
        />
      </div>
    )
  }

  if (activeId != null && activeProfile && !activeThread && !isPulseActive) {
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
        {isPulseActive ? (
          <PulseChatRoom
            profile={activeProfile}
            thread={activeThread}
            onBack={() => setActiveChat(null)}
            draft={draft}
            onDraftChange={setDraft}
            labels={roomLabels}
          />
        ) : (
          <ChatRoomScreen
            profile={activeProfile}
            thread={activeThread}
            onBack={() => setActiveChat(null)}
            draft={draft}
            onDraftChange={setDraft}
            onSend={handleSend}
            onSendText={handleSendIcebreaker}
            composerMuted={isProfileMuted(activeId)}
            labels={roomLabels}
          />
        )}
      </ChatThreadTransition>
    )
  }

  return (
    <div className={cn(connectionsPaused && "ttm-chat-life-sleeping")}>
      {pausedBanner}
      {inbox}
    </div>
  )
}
