"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import type { ChatThread } from "@/client/lib/social-store"
import type { SwipeProfile } from "@/client/lib/demo-profiles"
import { markThreadSeen } from "@/client/lib/chat-thread-seen"
import { ChatTypingIndicator } from "@/client/components/chat/chat-typing-indicator"
import { ChatMessageList } from "@/client/components/chat/chat-message-list"
import { SwipeProfileDetailScreen } from "@/client/components/app/swipe-profile-detail-screen"
import { useChatScrollEnd } from "@/client/hooks/use-chat-scroll-end"
import { useI18n } from "@/client/lib/i18n"
import { useEmotionalRealityExpansion } from "@/client/hooks/use-emotional-reality-expansion"
import { getPeerTrustSignals } from "@/client/lib/demo-trust-signals"
import { isEmotionallyReachable, resolveEmotionalPresence } from "@/client/lib/chat-presence"
import { useEmotionalPresenceSystem } from "@/client/hooks/use-emotional-presence-system"
import { emitWorldPulse } from "@/client/lib/world"
import { buildConnectionCopy } from "@/client/lib/connection-copy"
import { buildSyncCopy } from "@/client/lib/sync-copy"
import { useConnectionLive } from "@/client/hooks/use-connection-live"
import { deriveChatExperience } from "@/client/lib/chat-emotional-experience"
import { pickAIInsight } from "@/client/lib/ai-connection-engine"
import { extractAIConnectionSignals } from "@/client/lib/ai-connection-engine"
import { getConnection } from "@/client/lib/connection-store"
import { useConnectionAnalysis } from "@/client/hooks/use-connection-analysis"
import { usePersistedConnectionScore } from "@/client/hooks/use-persisted-connection-score"
import { useRelationshipEcosystem } from "@/client/hooks/use-relationship-ecosystem"
import { useConnectionIntelligence } from "@/client/hooks/use-connection-intelligence"
import { useEmotionalCompanion } from "@/client/hooks/use-emotional-companion"
import { useEmotionalReality } from "@/client/hooks/use-emotional-reality"
import { useEmotionalTime } from "@/client/hooks/use-emotional-time"
import { hasUnreadThread } from "@/client/lib/chat-thread-seen"
import { SafetyHubDialog } from "@/client/components/trust/safety-hub-dialog"
import { EmotionalShareCard } from "@/client/components/network/emotional-share-card"
import { detectEvolutionEvents, persistEvolutionEvents } from "@/client/lib/network"
import { analyzeRelationshipEcology } from "@/client/lib/ecosystem"
import {
  buildSyncShareMoment,
  deriveLiveRelationshipState,
} from "@/client/lib/shared"
import { MatchUrgencySnackbar } from "@/client/components/chat/match-urgency-snackbar"
import { useChatMatchExpiry } from "@/client/hooks/use-chat-match-expiry"
import { useChatRealtime, type ChatRealtimeProps } from "@/client/hooks/use-chat-realtime"
import { useMatches } from "@/client/hooks/use-matches"
import { discoverIdToNumeric } from "@/client/lib/discover/map-profile"
import { useMatchBond } from "@/client/hooks/use-match-bond"
import { ChatArea } from "@/client/components/chat/chat-area"
import { ChatFooter } from "@/client/components/chat/chat-footer"
import { ChatMessagesPane } from "@/client/components/chat/chat-messages-pane"
import { ChatRoomHeader } from "@/client/components/chat/chat-room-header"
import { IcebreakerPanel } from "@/client/components/chat/icebreaker-panel"
import { SyncStatsSheet } from "@/client/components/chat/sync-stats-sheet"
import { ChatFadingBanners } from "@/client/components/chat/chat-fading-banners"
import { cn } from "@/client/lib/utils"

type ChatRoomScreenProps = {
  profile: SwipeProfile
  thread: ChatThread
  onBack: () => void
  draft: string
  onDraftChange: (v: string) => void
  onSend: () => void
  onSendText?: (text: string) => void
  composerMuted?: boolean
  showBack?: boolean
  /** fullscreen = mobile; embedded = desktop column in messenger */
  layout?: "fullscreen" | "embedded"
  labels: {
    back: string
    typing: string
    online: string
    lastSeen: string
    reconnect: string
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
  /** Socket.io realtime (typing/presence) — skips internal Pusher/polling hook when set. */
  realtime?: ChatRealtimeProps
}

export function ChatRoomScreen({
  profile,
  thread,
  onBack,
  draft,
  onDraftChange,
  onSend,
  onSendText,
  composerMuted = false,
  showBack = true,
  layout = "fullscreen",
  labels,
  realtime: realtimeOverride,
}: ChatRoomScreenProps) {
  const isEmbedded = layout === "embedded"
  const { locale, t, location } = useI18n()
  const realityExpansion = useEmotionalRealityExpansion({
    locale,
    position: location.position,
    profileId: profile.id,
    messages: thread.messages,
  })
  const reduce = useReducedMotion()
  const matchExpiry = useChatMatchExpiry(profile.id)
  const { data: serverMatches } = useMatches()
  const peerUserId = useMemo(() => {
    const match = serverMatches?.find((m) => discoverIdToNumeric(m.peerUserId) === profile.id)
    return match?.peerUserId ?? null
  }, [serverMatches, profile.id])
  const internalRealtime = useChatRealtime(realtimeOverride ? null : (matchExpiry?.matchId ?? null), {
    peerUserId,
  })
  const { partnerTyping, partnerOnline, reportDraftChange, reportStoppedTyping } =
    realtimeOverride ?? internalRealtime
  const [replySnippet, setReplySnippet] = useState<string | null>(null)
  const [safetyOpen, setSafetyOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [justSent, setJustSent] = useState(false)
  const [syncSurge, setSyncSurge] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [syncStatsOpen, setSyncStatsOpen] = useState(false)
  const [icebreakerDismissed, setIcebreakerDismissed] = useState(false)
  const prevMsgCount = useRef(thread.messages.length)

  const hasSentFromMe = thread.messages.some((m) => m.from === "me")
  const showIcebreakers =
    !composerMuted && !hasSentFromMe && !icebreakerDismissed && Boolean(onSendText)

  const focusComposer = () => {
    requestAnimationFrame(() => {
      document.getElementById("chat-composer-input")?.focus()
    })
  }
  const { ref: scrollRef } = useChatScrollEnd(thread.messages.length, thread.profileId)
  const trust = getPeerTrustSignals(profile.id)
  const connectionView = useConnectionLive(profile.id)
  const connectionCopy = buildConnectionCopy(t)
  const syncCopy = buildSyncCopy(t)
  const lastMsg = thread.messages[thread.messages.length - 1]
  const hasUnread = hasUnreadThread(thread.profileId, thread.updatedAt, lastMsg?.from === "them")
  const recentActivity = Boolean(justSent || partnerTyping || hasUnread)
  const connectionAnalysis = useConnectionAnalysis(connectionView ?? null, thread.messages, {
    recentActivity,
    enableAI: true,
  })
  const persistedScore = usePersistedConnectionScore(matchExpiry?.matchId ?? null)
  const {
    analysis,
    metrics: syncMetrics,
    aiEnhanced,
    aiLoading,
    ai: aiAnalysis,
  } = connectionAnalysis

  const persistedAi = persistedScore.score
  const workerAnalyzing = persistedScore.analyzing
  const displayAiAnalysis = persistedAi ?? aiAnalysis
  const displayAiLoading = workerAnalyzing || (aiLoading && !persistedAi?.insight)
  const displayAiEnhanced =
    Boolean(persistedAi?.source === "openrouter") || aiEnhanced

  const {
    identity,
    aura,
    moments,
    ecology,
    stageProgress,
    ecosystemStyle,
    ecosystemAttrs,
  } = useRelationshipEcosystem(
    profile.id,
    connectionView ?? null,
    thread.messages,
    analysis,
    syncMetrics,
    displayAiAnalysis
  )

  const experience = useMemo(
    () =>
      deriveChatExperience(analysis, connectionView ?? null, recentActivity, syncMetrics),
    [analysis, connectionView, recentActivity, syncMetrics]
  )

  const liveState = useMemo(
    () => (connectionView ? deriveLiveRelationshipState(connectionView, analysis) : "growing"),
    [connectionView, analysis]
  )

  const shareMoment = useMemo(() => {
    if (!connectionView || !syncMetrics) return null
    return buildSyncShareMoment(profile.name, connectionView, syncMetrics, liveState, {
      title: t("shareMomentTitle"),
      subtitle: t("shareMomentSubtitle"),
    })
  }, [connectionView, syncMetrics, liveState, profile.name, t])

  const connectionRecord = useMemo(
    () => (connectionView ? getConnection(connectionView.profileId) : undefined),
    [connectionView]
  )

  const intelligence = useConnectionIntelligence(
    connectionView ?? null,
    analysis,
    thread.messages,
    connectionRecord
  )

  const companion = useEmotionalCompanion(
    profile.id,
    intelligence,
    analysis,
    thread.messages.length,
    { syncSurge, recentActivity }
  )

  const reality = useEmotionalReality(intelligence, analysis, companion, syncMetrics ?? null, {
    syncSurge,
  })

  const syncPercent = syncMetrics?.syncPercent ?? analysis?.syncPercent ?? 0

  const emotionalTime = useEmotionalTime(
    profile.id,
    connectionRecord,
    thread.messages,
    analysis,
    syncPercent,
    reality,
    { recentActivity }
  )

  const emotionalPresenceEarly = resolveEmotionalPresence(profile.id, {
    thread,
    view: connectionView ?? null,
    syncMetrics: syncMetrics ?? null,
  })
  const isReachable = isEmotionallyReachable(emotionalPresenceEarly)
  const showTyping = partnerTyping && isReachable
  const partnerTypingLabel = t("chatPartnerTyping").replace("{name}", profile.name)

  const presenceSystem = useEmotionalPresenceSystem(profile.id, {
    thread,
    view: connectionView ?? null,
    syncMetrics: syncMetrics ?? null,
    analysis: analysis ?? null,
    intelligence: intelligence ?? undefined,
    emotionalTime: emotionalTime ?? undefined,
    recentActivity: Boolean(justSent || showTyping || hasUnread),
    syncSurge,
  })

  const emotionalPresence = presenceSystem?.presence ?? emotionalPresenceEarly
  const statusLine = showTyping
    ? partnerTypingLabel
    : partnerOnline
      ? labels.online
      : emotionalPresence
        ? t(emotionalPresence.labelKey)
        : t("presenceQuiet")

  const scrollInsight = useMemo(() => {
    if (persistedAi?.insight) return persistedAi.insight
    const record = connectionView ? getConnection(connectionView.profileId) : undefined
    const signals = record ? extractAIConnectionSignals(thread.messages, record) : null
    return pickAIInsight(displayAiAnalysis, analysis, signals, recentActivity, t)
  }, [
    persistedAi?.insight,
    displayAiAnalysis,
    analysis,
    connectionView,
    thread.messages,
    recentActivity,
    t,
  ])

  useEffect(() => {
    setIcebreakerDismissed(false)
  }, [thread.profileId])

  useEffect(() => {
    markThreadSeen(thread.profileId, thread.updatedAt)
  }, [thread.profileId, thread.updatedAt])

  useEffect(() => {
    const count = thread.messages.length
    if (count > prevMsgCount.current) {
      const last = thread.messages[count - 1]
      if (last?.from === "me") {
        setJustSent(true)
        setSyncSurge(true)
      }
    }
    prevMsgCount.current = count
  }, [thread.messages])

  useEffect(() => {
    if (!justSent) return
    const id = window.setTimeout(() => setJustSent(false), 1200)
    return () => clearTimeout(id)
  }, [justSent])

  useEffect(() => {
    if (!syncSurge) return
    const id = window.setTimeout(() => setSyncSurge(false), 1400)
    return () => clearTimeout(id)
  }, [syncSurge])

  useEffect(() => {
    if (!syncSurge || !connectionView || !analysis) return
    const record = getConnection(profile.id)
    if (!record) return
    const eco =
      ecology ??
      analyzeRelationshipEcology(
        connectionView,
        analysis,
        thread.messages,
        record,
        identity?.evolutionStage ?? "forming"
      )
    const detected = detectEvolutionEvents(profile.id, connectionView, analysis, eco)
    if (detected.length > 0) persistEvolutionEvents(detected)
  }, [syncSurge, connectionView, analysis, ecology, identity?.evolutionStage, profile.id, thread.messages])

  const bond = useMatchBond(profile.id, matchExpiry?.matchId ?? null)

  const messageList = (
    <ChatMessageList
      messages={thread.messages}
      locale={locale}
      labels={labels.bubble}
      syncTier={syncMetrics?.tier}
      highlightLatest={justSent}
      onReplyTo={(snippet) => setReplySnippet(snippet)}
    />
  )

  const typingBlock = showTyping ? (
    <div className="mt-3">
      <ChatTypingIndicator label={partnerTypingLabel} />
    </div>
  ) : null

  const chatFooter = (
    <ChatFooter
      draft={draft}
      onDraftChange={(v) => {
        onDraftChange(v)
        reportDraftChange(v)
      }}
      onSend={() => {
        reportStoppedTyping()
        onSend()
        setJustSent(true)
        setSyncSurge(true)
        emitWorldPulse("sync")
      }}
      replySnippet={replySnippet}
      onClearReply={() => setReplySnippet(null)}
      voiceSeed={thread.profileId * 7919}
      disabled={composerMuted}
      disabledHint={labels.composerMutedHint}
      labels={labels.composer}
      beforeComposer={
        showIcebreakers && onSendText ? (
          <IcebreakerPanel
            variant="compact"
            onPick={(text) => {
              onSendText(text)
              setIcebreakerDismissed(true)
            }}
            onDismiss={() => {
              setIcebreakerDismissed(true)
              focusComposer()
            }}
          />
        ) : null
      }
    />
  )

  const embeddedChatBody = connectionView ? (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden ttm-chat-room__messages">
      {matchExpiry && (
        <MatchUrgencySnackbar
          placement="inline"
          expiresAt={matchExpiry.expiresAt}
          profileId={profile.id}
          urgencySignal={matchExpiry.flashKey}
        />
      )}
      <ChatFadingBanners
        expiresAt={matchExpiry?.expiresAt}
        lastMessageAt={lastMsg?.at}
      />
      <ChatMessagesPane
        scrollRef={scrollRef}
        className="flex-1 min-h-0"
        innerClassName="max-w-none"
        after={typingBlock}
      >
        {messageList}
      </ChatMessagesPane>
    </div>
  ) : (
    <>
      <div className="ttm-chat-reconnect shrink-0 px-4 py-2 border-b border-white/10 bg-[#050506]">
        <p className="text-[10px] text-center text-white/40 font-extralight">{labels.reconnect}</p>
      </div>
      <ChatMessagesPane scrollRef={scrollRef} className="flex-1 min-h-0" after={typingBlock}>
        {messageList}
      </ChatMessagesPane>
    </>
  )

  return (
    <>
    <div
      className={cn(
        "ttm-chat-room p10-chat-atmosphere flex flex-col w-full h-full min-h-0 ttm-gpu-layer",
        isEmbedded && "ttm-chat-room--embedded"
      )}
      data-exp={experience.state}
      data-rel-state={liveState}
      data-ai-enhanced={displayAiEnhanced ? "true" : undefined}
      {...ecosystemAttrs}
      {...realityExpansion.attrs}
      {...realityExpansion.os.attrs}
      {...realityExpansion.consciousness.attrs}
      {...(presenceSystem?.attrs ??
        emotionalTime?.attrs ??
        reality?.attrs ??
        companion?.attrs ??
        intelligence?.uiAttrs ??
        {})}
      style={
        {
          ...realityExpansion.style,
          ...realityExpansion.os.style,
          ...realityExpansion.consciousness.style,
          ...(syncMetrics
            ? {
                ["--chat-atmosphere-glow" as string]:
                  syncMetrics.atmosphereGlow ?? experience.intensity,
                ["--chat-atmosphere-motion" as string]:
                  syncMetrics.atmosphereMotion ?? experience.motionScale,
              }
            : {}),
          ...ecosystemStyle,
          ...(presenceSystem?.style ??
            emotionalTime?.style ??
            reality?.style ??
            companion?.style ??
            intelligence?.uiStyle ??
            {}),
        } as React.CSSProperties
      }
    >
      <SyncStatsSheet
        open={syncStatsOpen}
        onClose={() => setSyncStatsOpen(false)}
        profileName={profile.name}
        connectionView={connectionView}
        messages={thread.messages}
        copy={{ ...connectionCopy, ...syncCopy }}
        analysis={analysis}
        syncMetrics={syncMetrics}
        analysisBundle={connectionAnalysis}
        showTyping={showTyping}
        hasUnread={hasUnread}
        justSent={justSent}
        syncSurge={syncSurge}
        relationshipIdentity={identity}
        relationshipAura={aura}
        relationshipMoments={moments}
      />

      <SafetyHubDialog
        open={safetyOpen}
        onOpenChange={setSafetyOpen}
        profileId={profile.id}
        profileName={profile.name}
        serverUserId={profile.userId}
        context="chat"
        onAfterBlock={onBack}
        onAfterUnmatch={onBack}
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

      <ChatArea
        className={isEmbedded ? "ttm-chat-area--embedded" : undefined}
        header={
          <ChatRoomHeader
            profile={profile}
            labels={{ back: labels.back, safetyAria: labels.safetyAria }}
            statusLine={statusLine}
            showTyping={showTyping}
            isReachable={isReachable}
            emotionalPresence={emotionalPresence}
            presenceSystem={presenceSystem}
            syncMetrics={syncMetrics}
            aiEnhanced={displayAiEnhanced}
            syncSurge={syncSurge}
            relationshipPersonality={identity?.personality}
            evolutionProgress={identity?.evolutionProgress}
            connectionView={connectionView}
            analysis={analysis}
            bond={bond}
            shareMoment={shareMoment}
            onBack={onBack}
            showBack={showBack}
            compact={isEmbedded}
            partnerOnline={partnerOnline}
            showAnalyzing={displayAiLoading}
            onOpenProfile={() => setProfileOpen(true)}
            onOpenSafety={() => setSafetyOpen(true)}
            onOpenShare={() => setShareOpen(true)}
            onOpenSyncStats={() => setSyncStatsOpen(true)}
            reduceMotion={reduce}
          />
        }
        body={embeddedChatBody}
        footer={chatFooter}
      />

      <AnimatePresence>
        {shareOpen && shareMoment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setShareOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm">
              <EmotionalShareCard moment={shareMoment} onClose={() => setShareOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
    </>
  )
}
