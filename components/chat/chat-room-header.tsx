"use client"

import { useI18n } from "@/lib/i18n"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { ChatProfileAvatar } from "@/components/chat/chat-profile-avatar"
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
  onOpenProfile: () => void
  onOpenSafety: () => void
  onOpenShare: () => void
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
  onOpenProfile,
  onOpenSafety,
  onOpenShare,
  reduceMotion,
}: ChatRoomHeaderProps) {
  const { t } = useI18n()

  return (
    <>
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
        onClick={onOpenProfile}
        className="flex flex-1 min-w-0 items-center gap-3 rounded-2xl px-1 py-1 text-left touch-manipulation transition-all hover:bg-white/[0.04] active:scale-[0.99]"
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
        <div className="min-w-0 flex-1">
          <p className="font-extralight text-[16px] leading-tight truncate text-white/95">
            {profile.name}
            {profile.age > 0 && <span className="text-white/45">, {profile.age}</span>}
          </p>
          <BondMeter bond={bond} className="mt-1 pr-1" />
          <p
            className={cn(
              "text-[11px] font-extralight flex items-center gap-1.5 mt-0.5 truncate",
              isReachable ? "text-indigo-200/80" : "text-white/40"
            )}
          >
            {!showTyping && emotionalPresence && (
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
            <span className="truncate">{statusLine}</span>
            {syncMetrics && (
              <span className="text-white/35 tabular-nums">· SYNC {syncMetrics.syncPercent}%</span>
            )}
          </p>
        </div>
      </button>

      {connectionView && (
        <RelationshipStateBadge view={connectionView} analysis={analysis} className="hidden sm:inline-flex" />
      )}

      <ChatMatchExpiryBar profileId={profile.id} compact className="max-w-[min(100%,11.5rem)] sm:max-w-none" />

      <button
        type="button"
        disabled={!shareMoment}
        onClick={onOpenShare}
        className="w-10 h-10 shrink-0 rounded-xl border border-white/12 bg-white/[0.04] flex items-center justify-center touch-manipulation text-white/70 hover:border-indigo-400/30 disabled:opacity-30"
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

      <button
        type="button"
        onClick={onOpenSafety}
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
    </>
  )
}
