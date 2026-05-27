"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import type { ChatThread } from "@/lib/social-store"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { markThreadSeen } from "@/lib/chat-thread-seen"
import { ChatTypingIndicator } from "@/components/chat/chat-typing-indicator"
import { ChatMessageList } from "@/components/chat/chat-message-list"
import { SwipeProfileDetailScreen } from "@/components/app/swipe-profile-detail-screen"
import { useChatScrollEnd } from "@/hooks/use-chat-scroll-end"
import { useI18n } from "@/lib/i18n"
import { useEmotionalRealityExpansion } from "@/hooks/use-emotional-reality-expansion"
import { PresenceProximityLayer } from "@/components/reality-expansion/presence-proximity-layer"
import { RelationshipNarrativeWhisper } from "@/components/reality-expansion/relationship-narrative-whisper"
import { ReflectionV2Whisper } from "@/components/emotional-consciousness/reflection-v2-whisper"
import { SpaceEvolutionLayer } from "@/components/emotional-consciousness/space-evolution-layer"
import { SilenceField } from "@/components/emotional-consciousness/silence-field"
import { TensionVeil } from "@/components/emotional-consciousness/tension-veil"
import { getPeerTrustSignals } from "@/lib/demo-trust-signals"
import { isEmotionallyReachable, resolveEmotionalPresence } from "@/lib/chat-presence"
import { useEmotionalPresenceSystem } from "@/hooks/use-emotional-presence-system"
import { EmotionalPresenceShell } from "@/components/presence/emotional-presence-shell"
import { SilentPresencePulse } from "@/components/presence/silent-presence-pulse"
import { PresenceInsightWhisper } from "@/components/presence/presence-insight-whisper"
import { ConnectionPulseLayer } from "@/components/world/connection-pulse-layer"
import { emitWorldPulse } from "@/lib/world"
import { buildConnectionCopy } from "@/lib/connection-copy"
import { buildSyncCopy } from "@/lib/sync-copy"
import { useConnectionLive } from "@/hooks/use-connection-live"
import { ConnectionHeader } from "@/components/sync/connection-header"
import { AmbientChatBackground } from "@/components/chat/connection/ambient-chat-background"
import { EmotionalInsightCard } from "@/components/chat/connection/emotional-insight-card"
import { deriveChatExperience } from "@/lib/chat-emotional-experience"
import { pickAIInsight } from "@/lib/ai-connection-engine"
import { extractAIConnectionSignals } from "@/lib/ai-connection-engine"
import { getConnection } from "@/lib/connection-store"
import { useConnectionAnalysis } from "@/hooks/use-connection-analysis"
import { useRelationshipEcosystem } from "@/hooks/use-relationship-ecosystem"
import { SharedSyncSpace } from "@/components/ecosystem/shared-sync-space"
import { IntelligentSpaceLayer } from "@/components/intelligence/intelligent-space-layer"
import { useConnectionIntelligence } from "@/hooks/use-connection-intelligence"
import { useEmotionalCompanion } from "@/hooks/use-emotional-companion"
import { CompanionSilentLayer } from "@/components/companion/companion-silent-layer"
import { CompanionPresenceStrip } from "@/components/companion/companion-presence-strip"
import { CompanionMomentHalo } from "@/components/companion/companion-moment-halo"
import { useEmotionalReality } from "@/hooks/use-emotional-reality"
import { RelationshipRealitySpace } from "@/components/reality/relationship-reality-space"
import { useEmotionalTime } from "@/hooks/use-emotional-time"
import { TemporalAtmosphereLayer } from "@/components/time/temporal-atmosphere-layer"
import { RelationshipTimeStateRibbon } from "@/components/time/relationship-time-state-ribbon"
import { ConnectionRhythmStrip } from "@/components/time/connection-rhythm-strip"
import { TimeMemoryWhisper } from "@/components/time/time-memory-whisper"
import { OfflinePresenceGlow } from "@/components/time/offline-presence-glow"
import { RelationshipEcologyStrip } from "@/components/ecosystem/relationship-ecology-strip"
import { ConnectionAura } from "@/components/relationship/connection-aura"
import { MemoryCard } from "@/components/relationship/memory-card"
import { hasUnreadThread } from "@/lib/chat-thread-seen"
import { SafetyHubDialog } from "@/components/trust/safety-hub-dialog"
import { RelationshipStateBadge } from "@/components/growth/relationship-state-badge"
import { RelationshipInsightPanel } from "@/components/growth/relationship-insight-panel"
import { EmotionalShareCard } from "@/components/network/emotional-share-card"
import { detectEvolutionEvents, persistEvolutionEvents } from "@/lib/network"
import { analyzeRelationshipEcology } from "@/lib/ecosystem"
import { CinematicMemoryArchive } from "@/components/growth/cinematic-memory-archive"
import {
  buildSyncShareMoment,
  deriveLiveRelationshipState,
} from "@/lib/shared"
import { MatchUrgencySnackbar } from "@/components/chat/match-urgency-snackbar"
import { useChatMatchExpiry } from "@/hooks/use-chat-match-expiry"
import { useMatchBond } from "@/hooks/use-match-bond"
import { ChatArea } from "@/components/chat/chat-area"
import { ChatFooter } from "@/components/chat/chat-footer"
import { ChatMessagesPane } from "@/components/chat/chat-messages-pane"
import { ChatRoomHeader } from "@/components/chat/chat-room-header"
import { IcebreakerPanel } from "@/components/chat/icebreaker-panel"
import { cn } from "@/lib/utils"

type ChatRoomScreenProps = {
  profile: SwipeProfile
  thread: ChatThread
  onBack: () => void
  draft: string
  onDraftChange: (v: string) => void
  onSend: () => void
  onSendText?: (text: string) => void
  composerMuted?: boolean
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
  labels,
}: ChatRoomScreenProps) {
  const { locale, t, location } = useI18n()
  const realityExpansion = useEmotionalRealityExpansion({
    locale,
    position: location.position,
    profileId: profile.id,
    messages: thread.messages,
  })
  const reduce = useReducedMotion()
  const [typing, setTyping] = useState(true)
  const [replySnippet, setReplySnippet] = useState<string | null>(null)
  const [safetyOpen, setSafetyOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [justSent, setJustSent] = useState(false)
  const [syncSurge, setSyncSurge] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
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
  const recentActivity = Boolean(justSent || typing || hasUnread)
  const connectionAnalysis = useConnectionAnalysis(connectionView ?? null, thread.messages, {
    recentActivity,
    enableAI: true,
  })
  const {
    analysis,
    metrics: syncMetrics,
    aiEnhanced,
    aiInsight,
    aiLoading,
    ai: aiAnalysis,
  } = connectionAnalysis

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
    aiAnalysis
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
  const showTyping = typing && isReachable

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
    ? labels.typing
    : emotionalPresence
      ? t(emotionalPresence.labelKey)
      : t("presenceQuiet")

  const scrollInsight = useMemo(() => {
    const record = connectionView ? getConnection(connectionView.profileId) : undefined
    const signals = record ? extractAIConnectionSignals(thread.messages, record) : null
    return pickAIInsight(aiAnalysis, analysis, signals, recentActivity, t)
  }, [aiAnalysis, aiInsight, analysis, connectionView, thread.messages, recentActivity, t])

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

  useEffect(() => {
    const last = thread.messages[thread.messages.length - 1]
    if (last?.from === "them") {
      setTyping(false)
      return
    }
    setTyping(true)
    const id = window.setTimeout(() => setTyping(false), 2000)
    return () => clearTimeout(id)
  }, [thread.profileId, thread.messages.length, thread.messages])

  const matchExpiry = useChatMatchExpiry(profile.id)
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
      <ChatTypingIndicator />
    </div>
  ) : null

  const chatFooter = (
    <ChatFooter
      draft={draft}
      onDraftChange={onDraftChange}
      onSend={() => {
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

  return (
    <>
    {matchExpiry && (
      <MatchUrgencySnackbar expiresAt={matchExpiry.expiresAt} profileId={profile.id} />
    )}
    <div
      className={cn(
        "ttm-chat-room p10-chat-atmosphere flex flex-col w-full h-full min-h-0 ttm-gpu-layer"
      )}
      data-exp={experience.state}
      data-rel-state={liveState}
      data-ai-enhanced={aiEnhanced ? "true" : undefined}
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

      <ChatArea
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
            aiEnhanced={aiEnhanced}
            syncSurge={syncSurge}
            relationshipPersonality={identity?.personality}
            evolutionProgress={identity?.evolutionProgress}
            connectionView={connectionView}
            analysis={analysis}
            bond={bond}
            shareMoment={shareMoment}
            onBack={onBack}
            onOpenProfile={() => setProfileOpen(true)}
            onOpenSafety={() => setSafetyOpen(true)}
            onOpenShare={() => setShareOpen(true)}
            reduceMotion={reduce}
          />
        }
        body={
          connectionView ? (
        <TemporalAtmosphereLayer time={emotionalTime} className="flex flex-col flex-1 min-h-0">
        <EmotionalPresenceShell system={presenceSystem} className="flex flex-col flex-1 min-h-0">
        <CompanionSilentLayer companion={companion} className="flex flex-col flex-1 min-h-0">
        <IntelligentSpaceLayer intelligence={intelligence} className="flex flex-col flex-1 min-h-0">
        <SharedSyncSpace
          ecology={ecology}
          stageProgress={stageProgress}
          className="flex-1 min-h-0"
          sidebar={
            <>
              <ConnectionHeader
                view={connectionView}
                messages={thread.messages}
                copy={{ ...connectionCopy, ...syncCopy }}
                showTyping={showTyping}
                hasUnread={hasUnread}
                justSent={justSent}
                syncSurge={syncSurge}
                analysisBundle={connectionAnalysis}
                relationshipIdentity={identity}
                relationshipAura={aura}
                relationshipMoments={moments}
              />
              {ecology && <RelationshipEcologyStrip ecology={ecology} />}
              {companion && (
                <details className="shrink-0 px-3 py-1.5 border-b border-white/[0.06] group md:border-b-0">
                  <summary className="text-[9px] uppercase tracking-[0.16em] text-white/35 font-extralight cursor-pointer list-none">
                    {t("chatInsightLabel")}
                  </summary>
                  <div className="space-y-2 pt-2 pb-1">
                    <CompanionPresenceStrip profileId={profile.id} companion={companion} />
                    {emotionalTime && (
                      <>
                        <RelationshipTimeStateRibbon state={emotionalTime.timeState} />
                        <ConnectionRhythmStrip rhythm={emotionalTime.rhythm} />
                      </>
                    )}
                    {emotionalTime?.memories[0] && (
                      <TimeMemoryWhisper memory={emotionalTime.memories[0]} />
                    )}
                    {presenceSystem?.insight && (
                      <PresenceInsightWhisper
                        profileId={profile.id}
                        insight={presenceSystem.insight}
                      />
                    )}
                  </div>
                </details>
              )}
            </>
          }
        >
        <RelationshipRealitySpace reality={reality} surge={syncSurge} className="flex-1 min-h-0">
          <SilenceField
            silence={realityExpansion.consciousness.silence}
            className="ec-silence-field--chat"
          />
          <TensionVeil
            tension={realityExpansion.consciousness.tension}
            className="ec-tension-veil--chat"
          />
          {realityExpansion.consciousness.space && (
            <SpaceEvolutionLayer
              space={realityExpansion.consciousness.space}
              className="ec-space-evolution--chat"
            />
          )}
          <PresenceProximityLayer immersion={realityExpansion.presence} />
          {realityExpansion.consciousness.reflection?.scope === "connection" ? (
            <ReflectionV2Whisper
              reflection={realityExpansion.consciousness.reflection}
              profileId={profile.id}
              className="shrink-0 px-4 py-2"
            />
          ) : (
            realityExpansion.narrative?.scope === "connection" && (
              <RelationshipNarrativeWhisper
                narrative={realityExpansion.narrative}
                profileId={profile.id}
                className="shrink-0 px-4 py-2"
              />
            )
          )}
          <ChatMessagesPane
            scrollRef={scrollRef}
            className={cn(syncMetrics && "ttm-chat-emotional-space")}
            innerClassName="md:max-w-2xl lg:max-w-none"
            overlay={
              <>
                {emotionalTime && <OfflinePresenceGlow presence={emotionalTime.offline} />}
                <ConnectionPulseLayer syncMetrics={syncMetrics} surge={syncSurge} className="p16-pulse-bridge" />
                {syncMetrics && aura && (
                  <>
                    <ConnectionAura aura={aura} />
                    <AmbientChatBackground experience={experience} syncMetrics={syncMetrics} />
                  </>
                )}
              </>
            }
            before={
              <>
                {presenceSystem && <SilentPresencePulse silent={presenceSystem.silent} className="mb-3" />}
                {companion?.moment && <CompanionMomentHalo moment={companion.moment} className="mb-3" />}
                {identity && moments.length > 0 && (
                  <div className="mb-4 grid gap-2">
                    {moments
                      .filter((m) => m.reached && m.importance >= 0.85)
                      .slice(-1)
                      .map((m) => (
                        <MemoryCard key={m.id} moment={m} locale={locale} featured />
                      ))}
                  </div>
                )}
                {(scrollInsight || (aiLoading && justSent)) && (
                  <div className="mb-4">
                    <EmotionalInsightCard
                      insight={scrollInsight ?? ""}
                      loading={aiLoading && !scrollInsight}
                    />
                  </div>
                )}
              </>
            }
            after={
              <>
                {typingBlock}
                <CinematicMemoryArchive profileId={profile.id} limit={3} className="mt-6" />
              </>
            }
          >
            {messageList}
          </ChatMessagesPane>
        </RelationshipRealitySpace>
        </SharedSyncSpace>
        </IntelligentSpaceLayer>
        </CompanionSilentLayer>
        </EmotionalPresenceShell>
        </TemporalAtmosphereLayer>
      ) : (
        <>
          <div className="shrink-0 px-4 py-3 border-b border-white/10 bg-[#050506]">
            <p className="text-[10px] text-center text-white/40 font-extralight">{labels.reconnect}</p>
          </div>
          {connectionRecord && (
            <div className="shrink-0 px-4 py-2 border-b border-white/[0.06]">
              <RelationshipInsightPanel messages={thread.messages} record={connectionRecord} />
            </div>
          )}
          <ChatMessagesPane scrollRef={scrollRef} after={typingBlock}>
            {messageList}
          </ChatMessagesPane>
        </>
      )
        }
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
