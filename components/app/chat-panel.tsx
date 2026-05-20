"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import {
  getChats,
  getProfileById,
  receiveMessage,
  sendMessage,
  type ChatThread,
} from "@/lib/social-store"
import { isPulseProfile } from "@/lib/pulse-companion"
import { fetchPulseReply } from "@/lib/pulse-ai-client"
import { markThreadSeen } from "@/lib/chat-thread-seen"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { ChatInboxScreen } from "@/components/chat/chat-inbox-screen"
import { ChatRoomScreen } from "@/components/chat/chat-room-screen"
import { useTrustSafetyVersion } from "@/hooks/use-trust-safety-version"
import { isProfileBlocked, isProfileMuted } from "@/lib/trust-safety-store"
import { getUserProfile, isPremiumActive } from "@/lib/user-profile"
import { getConnectionMemories } from "@/lib/connection-store"
import { useProfileLife } from "@/hooks/use-profile-life"
import { cn } from "@/lib/utils"

function parseWithParam(withParam: string | null): number | null {
  if (!withParam) return null
  const id = Number.parseInt(withParam, 10)
  return Number.isFinite(id) ? id : null
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
  const [pulseThinking, setPulseThinking] = useState(false)

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
    () => threads.filter((th) => !isProfileBlocked(th.profileId) || isPulseProfile(th.profileId)),
    [threads, trustV]
  )

  useEffect(() => {
    if (activeId != null && isProfileBlocked(activeId) && !isPulseProfile(activeId)) {
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

  const requestPulseResponse = useCallback(
    async (threadAfterSend: ChatThread) => {
      setPulseThinking(true)
      try {
        const userName = getUserProfile()?.name
        const { reply } = await fetchPulseReply(locale, threadAfterSend.messages, userName)
        receiveMessage(activeId!, reply, locale, location.position)
        refresh()
      } catch {
        receiveMessage(
          activeId!,
          t("pulseAiError"),
          locale,
          location.position
        )
        refresh()
      } finally {
        setPulseThinking(false)
      }
    },
    [activeId, locale, location.position, t]
  )

  const handleSend = () => {
    if (activeId == null || !draft.trim()) return
    const text = draft.trim()
    setDraft("")
    sendMessage(activeId, text, locale, location.position)
    refresh()

    if (isPulseProfile(activeId)) {
      const thread = getChats(locale, location.position).find((c) => c.profileId === activeId)
      if (thread) void requestPulseResponse(thread)
    }
  }

  const me = getUserProfile()
  const chatPremium = Boolean(me && isPremiumActive(me))
  const profileLife = useProfileLife()
  const connectionsPaused =
    profileLife?.state === "sleeping" || profileLife?.state === "archived"

  if (activeId != null && activeProfile && activeThread) {
    return (
      <>
        <ChatRoomScreen
          profile={activeProfile}
          thread={activeThread}
          onBack={() => setActiveChat(null)}
          draft={draft}
          onDraftChange={setDraft}
          onSend={handleSend}
          composerMuted={isProfileMuted(activeId) && !isPulseProfile(activeId)}
          forceTyping={pulseThinking}
          isAiCompanion={isPulseProfile(activeId)}
          labels={{
            back: t("chatBack"),
            typing: pulseThinking ? t("pulseAiTyping") : t("chatTyping"),
            online: isPulseProfile(activeId) ? t("pulseAiOnline") : t("chatOnline"),
            lastSeen: t("chatLastSeen"),
            reconnect: t("chatReconnectHint"),
            premiumPlusStrip: chatPremium ? t("premiumChatPlusStrip") : undefined,
            safetyAria: t("trustSafetyOpenAria"),
            composerMutedHint: t("trustComposerMutedHint"),
            bubble: {
              chatDelivered: t("chatDelivered"),
              chatRead: t("chatRead"),
              chatReply: t("chatReply"),
              chatReact: t("chatReact"),
            },
            composer: {
              placeholder: isPulseProfile(activeId)
                ? t("pulseChatPlaceholder")
                : t("chatPlaceholder"),
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
      </>
    )
  }

  return (
    <div className={cn(connectionsPaused && "ttm-chat-life-sleeping")}>
      {connectionsPaused && profileLife && (
        <div className="mt-3 mb-1 max-w-lg mx-auto w-full px-3 sm:px-4 rounded-2xl border border-white/10 bg-white/[0.03] py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/35 mb-1">{t("syncLabel")}</p>
          <p className="text-[11px] sm:text-xs text-white/70 font-extralight leading-relaxed">
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
