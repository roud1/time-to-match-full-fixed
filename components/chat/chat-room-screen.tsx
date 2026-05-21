"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"
import type { ChatThread } from "@/lib/social-store"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { markThreadSeen } from "@/lib/chat-thread-seen"
import { ChatProfileAvatar } from "@/components/chat/chat-profile-avatar"
import { ChatTypingIndicator } from "@/components/chat/chat-typing-indicator"
import { ChatMessageList } from "@/components/chat/chat-message-list"
import { ChatComposer } from "@/components/chat/chat-composer"
import { SwipeProfileDetailScreen } from "@/components/app/swipe-profile-detail-screen"
import { useChatScrollEnd } from "@/hooks/use-chat-scroll-end"
import { useI18n } from "@/lib/i18n"
import { getPeerTrustSignals } from "@/lib/demo-trust-signals"
import { isChatPeerOnline } from "@/lib/chat-presence"
import { buildConnectionCopy } from "@/lib/connection-copy"
import { buildSyncCopy } from "@/lib/sync-copy"
import { useConnectionLive } from "@/hooks/use-connection-live"
import { SyncChatHeader } from "@/components/sync/sync-chat-header"
import { PulseChatHeader } from "@/components/chat/pulse-chat-header"
import { AnimatedConnectionBackground } from "@/components/sync/animated-connection-background"
import { SyncAmbientField } from "@/components/sync/sync-ambient-field"
import { isPulseProfile } from "@/lib/pulse-companion"
import { useConnectionAnalysis } from "@/hooks/use-connection-analysis"
import { hasUnreadThread } from "@/lib/chat-thread-seen"
import { SafetyHubDialog } from "@/components/trust/safety-hub-dialog"
import { cn } from "@/lib/utils"

type ChatRoomScreenProps = {
  profile: SwipeProfile
  thread: ChatThread
  onBack: () => void
  draft: string
  onDraftChange: (v: string) => void
  onSend: () => void
  composerMuted?: boolean
  isPulseGuide?: boolean
  forceTyping?: boolean
  labels: {
    back: string
    typing: string
    online: string
    lastSeen: string
    reconnect: string
    premiumPlusStrip?: string
    safetyAria: string
    composerMutedHint: string
    bubble: {
      chatDelivered: string
      chatRead: string
      chatReply: string
      chatReact: string
    }
    composer: {
      placeholder: string
      send: string
      voiceHint: string
      voiceDemo: string
      attach: string
      mediaDemo: string
      voiceDuration: string
      replyingTo: string
      cancelReply: string
    }
  }
}

export function ChatRoomScreen({
  profile,
  thread,
  onBack,
  draft,
  onDraftChange,
  onSend,
  composerMuted = false,
  isPulseGuide = false,
  forceTyping = false,
  labels,
}: ChatRoomScreenProps) {
  const { locale, t } = useI18n()
  const reduce = useReducedMotion()
  const pulseModeEarly = isPulseGuide || isPulseProfile(profile.id)
  const [typing, setTyping] = useState(!pulseModeEarly)
  const [replySnippet, setReplySnippet] = useState<string | null>(null)
  const [safetyOpen, setSafetyOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [justSent, setJustSent] = useState(false)
  const prevMsgCount = useRef(thread.messages.length)
  const { ref: scrollRef } = useChatScrollEnd(thread.messages.length, thread.profileId)
  const trust = getPeerTrustSignals(profile.id)
  const isOnline = isChatPeerOnline(profile.id, thread)
  const pulseMode = isPulseGuide || isPulseProfile(profile.id)
  const showTyping = pulseMode
    ? forceTyping
    : forceTyping || (typing && isOnline)
  const statusLine = showTyping
    ? labels.typing
    : pulseMode
      ? labels.online
      : isOnline
        ? labels.online
        : labels.lastSeen
  const connectionView = useConnectionLive(profile.id)
  const connectionCopy = buildConnectionCopy(t)
  const syncCopy = buildSyncCopy(t)
  const lastMsg = thread.messages[thread.messages.length - 1]
  const hasUnread = hasUnreadThread(thread.profileId, thread.updatedAt, lastMsg?.from === "them")
  const recentActivity = Boolean(justSent || showTyping || hasUnread)
  const connectionAnalysis = useConnectionAnalysis(
    pulseMode ? null : connectionView ?? null,
    thread.messages,
    { recentActivity, enableAI: !pulseMode }
  )
  const { metrics: syncMetrics, aiEnhanced } = connectionAnalysis

  useEffect(() => {
    markThreadSeen(thread.profileId, thread.updatedAt)
  }, [thread.profileId, thread.updatedAt])

  useEffect(() => {
    const count = thread.messages.length
    if (count > prevMsgCount.current) {
      const last = thread.messages[count - 1]
      if (last?.from === "me") setJustSent(true)
    }
    prevMsgCount.current = count
  }, [thread.messages])

  useEffect(() => {
    if (!justSent) return
    const id = window.setTimeout(() => setJustSent(false), 1200)
    return () => clearTimeout(id)
  }, [justSent])

  useEffect(() => {
    if (pulseMode) {
      setTyping(false)
      return
    }
    if (forceTyping) return
    const last = thread.messages[thread.messages.length - 1]
    if (last?.from === "them") {
      setTyping(false)
      return
    }
    setTyping(true)
    const id = window.setTimeout(() => setTyping(false), 2000)
    return () => clearTimeout(id)
  }, [thread.profileId, thread.messages.length, forceTyping, pulseMode, thread.messages])

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-40 flex flex-col w-full bg-[#050506]",
        "bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))]",
        "pt-[env(safe-area-inset-top,0px)]"
      )}
    >
      <SafetyHubDialog
        open={safetyOpen}
        onOpenChange={setSafetyOpen}
        profileId={profile.id}
        profileName={profile.name}
        context="chat"
        onAfterBlock={onBack}
      />

      <SwipeProfileDetailScreen
        profile={profileOpen ? profile : null}
        context="chat"
        trust={trust}
        onClose={() => setProfileOpen(false)}
        onLike={() => setProfileOpen(false)}
        onNope={() => setProfileOpen(false)}
        onOpenSafety={() => {
          setProfileOpen(false)
          setSafetyOpen(true)
        }}
      />

      <header className="shrink-0 z-20 flex items-center gap-2 px-3 py-2 border-b border-white/[0.08] bg-[#050506]/92 backdrop-blur-2xl">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 shrink-0 rounded-xl border border-white/12 bg-white/[0.04] flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
          aria-label={labels.back}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => !pulseMode && setProfileOpen(true)}
          disabled={pulseMode}
          className={cn(
            "flex flex-1 min-w-0 items-center gap-3 rounded-2xl px-1 py-1 text-left touch-manipulation transition-all",
            !pulseMode && "hover:bg-white/[0.04] active:scale-[0.99]"
          )}
          aria-label={pulseMode ? profile.name : t("swipeProfileOpenAria")}
        >
          <ChatProfileAvatar
            src={profile.image}
            name={profile.name}
            profileId={profile.id}
            size="sm"
            showOnline={isOnline}
            syncMetrics={pulseMode ? null : syncMetrics}
            aiBoost={aiEnhanced}
          />
          <div className="min-w-0 flex-1">
            <p className="font-extralight text-[16px] leading-tight truncate text-white/95">
              {profile.name}
              {!pulseMode && profile.age > 0 && (
                <span className="text-white/45">, {profile.age}</span>
              )}
            </p>
            <p
              className={cn(
                "text-[11px] font-extralight flex items-center gap-1.5 mt-0.5 truncate",
                isOnline ? "text-emerald-300/85" : "text-white/40"
              )}
            >
              {isOnline && (
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  {!reduce && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30" />
                  )}
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400/90" />
                </span>
              )}
              <span className="truncate">{statusLine}</span>
              {!pulseMode && syncMetrics && (
                <span className="text-white/35 tabular-nums">· SYNC {syncMetrics.syncPercent}%</span>
              )}
            </p>
          </div>
        </button>

        {!pulseMode && (
          <button
            type="button"
            onClick={() => setSafetyOpen(true)}
            className="w-10 h-10 shrink-0 rounded-xl border border-white/12 bg-white/[0.04] flex items-center justify-center touch-manipulation active:scale-95 transition-transform text-white/80 hover:border-white/25"
            aria-label={labels.safetyAria}
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              />
            </svg>
          </button>
        )}
      </header>

      {pulseMode ? (
        <PulseChatHeader showTyping={showTyping} />
      ) : connectionView ? (
        <SyncChatHeader
          view={connectionView}
          messages={thread.messages}
          copy={{ ...connectionCopy, ...syncCopy }}
          showTyping={showTyping}
          hasUnread={hasUnread}
          justSent={justSent}
          premiumStrip={labels.premiumPlusStrip}
          analysisBundle={connectionAnalysis}
        />
      ) : (
        <div className="shrink-0 px-4 py-3 border-b border-white/10 bg-[#050506]">
          <p className="text-[10px] text-center text-white/40 font-extralight">{labels.reconnect}</p>
        </div>
      )}

      <div
        ref={scrollRef}
        className={cn(
          "flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 ttm-chat-scroll relative",
          !pulseMode && syncMetrics && "ttm-chat-emotional-space"
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {!pulseMode && syncMetrics && (
          <>
            <SyncAmbientField
              tier={syncMetrics.tier}
              intensity={
                syncMetrics.isFading
                  ? 0.15
                  : aiEnhanced
                    ? Math.min(1, 0.45 + syncMetrics.syncPercent / 200)
                    : 0.32
              }
              layered
              heartbeat={syncMetrics.syncPercent >= 50 && !syncMetrics.isFading}
              className="z-0"
            />
            <AnimatedConnectionBackground
              tier={syncMetrics.tier}
              intensity={
                syncMetrics.isFading
                  ? 0.18
                  : aiEnhanced
                    ? Math.min(0.72, 0.35 + syncMetrics.syncPercent / 180)
                    : syncMetrics.tier === "synced"
                      ? 0.58
                      : 0.38
              }
              emotionalGlow={!syncMetrics.isFading}
            />
          </>
        )}
        <div className="relative z-[1] mx-auto w-full max-w-lg pb-4 pt-2">
          <ChatMessageList
            messages={thread.messages}
            locale={locale}
            labels={labels.bubble}
            onReplyTo={(snippet) => setReplySnippet(snippet)}
          />
          {showTyping && (pulseMode ? forceTyping : true) && (
            <div className="mt-3">
              <ChatTypingIndicator />
            </div>
          )}
        </div>
      </div>

      <ChatComposer
        draft={draft}
        onDraftChange={onDraftChange}
        onSend={() => {
          onSend()
          setJustSent(true)
        }}
        replySnippet={replySnippet}
        onClearReply={() => setReplySnippet(null)}
        voiceSeed={thread.profileId * 7919}
        disabled={composerMuted || forceTyping}
        disabledHint={labels.composerMutedHint}
        labels={labels.composer}
      />
    </div>
  )
}
