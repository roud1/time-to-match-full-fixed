"use client"

import { useI18n } from "@/lib/i18n"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { ChatProfileAvatar } from "@/components/chat/chat-profile-avatar"
import { ChatHeaderSyncBlock } from "@/components/chat/chat-header-sync-block"
import type { RelationshipPersonality } from "@/lib/relationship-identity/types"
import type { SyncMetrics } from "@/lib/sync-system"
import { BondMeter } from "@/components/chat/bond-meter"
import { ChatMatchExpiryBar } from "@/components/chat/chat-match-expiry-bar"
import { RelationshipStateBadge } from "@/components/growth/relationship-state-badge"
import { EmotionalPresenceBadge } from "@/components/world/emotional-presence-badge"
import type { useConnectionLive } from "@/hooks/use-connection-live"
import type { useConnectionAnalysis } from "@/hooks/use-connection-analysis"
import type { useMatchBond } from "@/hooks/use-match-bond"
import type { useEmotionalPresenceSystem } from "@/hooks/use-emotional-presence-system"
import type { EmotionalPresence } from "@/lib/chat-presence"
import { cn } from "@/lib/utils"

type ConnectionView = NonNullable<ReturnType<typeof useConnectionLive>>
type Analysis = ReturnType<typeof useConnectionAnalysis>["analysis"]
type Bond = ReturnType<typeof useMatchBond>
type PresenceSystem = ReturnType<typeof useEmotionalPresenceSystem>

export type ChatRoomHeaderProps = {
  profile: SwipeProfile
  labels: { back: string; safetyAria: string }
  statusLine: string
  showTyping: boolean
  isReachable: boolean
  emotionalPresence: EmotionalPresence | null
  presenceSystem: PresenceSystem
  syncMetrics: SyncMetrics | null | undefined
  aiEnhanced: boolean
  syncSurge: boolean
  relationshipPersonality?: RelationshipPersonality
  evolutionProgress?: number
  connectionView: ConnectionView | null
  analysis: Analysis
  bond: Bond
  shareMoment: unknown
  onBack: () => void
  showBack?: boolean
  compact?: boolean
  onOpenProfile: () => void
  onOpenSafety: () => void
  onOpenShare: () => void
  onOpenSyncStats?: () => void
  reduceMotion: boolean | null
}

export function ChatRoomHeader({
  profile,
  labels,
  statusLine,
  showTyping,
  isReachable,
  emotionalPresence,
  presenceSystem,
  syncMetrics,
  aiEnhanced,
  syncSurge,
  relationshipPersonality,
  evolutionProgress,
  connectionView,
  analysis,
  bond,
  shareMoment,
  onBack,
  showBack = true,
  compact = false,
  onOpenProfile,
  onOpenSafety,
  onOpenShare,
  onOpenSyncStats,
  reduceMotion,
}: ChatRoomHeaderProps) {
  const { t } = useI18n()
  const showPresenceBadge = !showTyping && Boolean(emotionalPresence)
  const showStatusText = showTyping || !showPresenceBadge

  return (
    <header className={cn("ttm-chat-room-header", compact && "ttm-chat-room-header--compact")}>
      <div className="ttm-chat-room-header__row">
        <div className="ttm-chat-room-header__lead">
          {showBack ? (
            <button
              type="button"
              onClick={onBack}
              className="ttm-chat-room-header__icon-btn"
              aria-label={labels.back}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : null}

          <button
            type="button"
            onClick={onOpenProfile}
            className="ttm-chat-room-header__profile touch-manipulation"
            aria-label={t("swipeProfileOpenAria")}
          >
            <ChatProfileAvatar
              src={profile.image}
              name={profile.name}
              size="sm"
              showOnline={!presenceSystem}
              emotionalPresence={emotionalPresence}
              resonance={presenceSystem?.resonance ?? null}
              sharedPresence={presenceSystem?.shared.active}
              syncMetrics={syncMetrics}
              aiBoost={aiEnhanced}
              syncSurge={syncSurge}
              relationshipPersonality={relationshipPersonality}
              evolutionProgress={evolutionProgress}
            />
            <div className="ttm-chat-room-header__identity min-w-0">
              <p className="ttm-chat-room-header__name">
                <span className="truncate">{profile.name}</span>
                {profile.age > 0 && (
                  <span className="ttm-chat-room-header__age">, {profile.age}</span>
                )}
              </p>
              {(profile.location || profile.distance) && (
                <p className="ttm-chat-room-header__city">
                  {profile.location}
                  {profile.location && profile.distance ? (
                    <span className="ttm-chat-room-header__distance"> · {profile.distance}</span>
                  ) : (
                    profile.distance
                  )}
                </p>
              )}
            </div>
          </button>
        </div>

        <div className="ttm-chat-room-header__rail">
          <div className="ttm-chat-room-header__toolbar">
            <ChatHeaderSyncBlock
              syncMetrics={syncMetrics}
              analysis={analysis}
              syncSurge={syncSurge}
              compact={compact}
              showMeta
              onOpen={onOpenSyncStats}
            />
            <ChatMatchExpiryBar
              profileId={profile.id}
              compact
              variant="header"
              className="ttm-chat-room-header__expiry"
            />
          </div>

          {connectionView && !compact && (
            <RelationshipStateBadge
              view={connectionView}
              analysis={analysis}
              className="hidden xl:inline-flex shrink-0 self-center"
            />
          )}

          {!compact && (
            <button
              type="button"
              disabled={!shareMoment}
              onClick={onOpenShare}
              className="ttm-chat-room-header__icon-btn hidden sm:inline-flex self-center"
              aria-label={t("shareMomentCta")}
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSafety}
            className="ttm-chat-room-header__icon-btn self-center"
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
        </div>
      </div>

      <div
        className={cn(
          "ttm-chat-room-header__foot",
          showBack && "ttm-chat-room-header__foot--indented"
        )}
      >
        <BondMeter bond={bond} className="ttm-chat-room-header__bond" />
        {(showTyping || showPresenceBadge || showStatusText) && (
          <p
            className={cn(
              "ttm-chat-room-header__status",
              isReachable ? "ttm-chat-room-header__status--live" : "ttm-chat-room-header__status--muted"
            )}
          >
            {showPresenceBadge && emotionalPresence && (
              <EmotionalPresenceBadge presence={emotionalPresence} compact className="shrink-0" />
            )}
            {showTyping && (
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                {!reduceMotion && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-30" />
                )}
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400/90" />
              </span>
            )}
            {showStatusText && <span className="truncate">{statusLine}</span>}
          </p>
        )}
      </div>
    </header>
  )
}
