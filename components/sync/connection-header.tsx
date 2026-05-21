"use client"

import { useState, type CSSProperties } from "react"
import { motion, useReducedMotion } from "motion/react"
import type { ChatMessage } from "@/lib/social-store"
import type { ConnectionView, ConnectionCopyKeys } from "@/lib/connection-system"
import { stageLabel, streakMessage } from "@/lib/connection-system"
import type { SyncCopyKeys } from "@/lib/sync-copy"
import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { SyncMetrics } from "@/lib/sync-system"
import type { TimelineMilestone } from "@/lib/connection-timeline"
import { deriveChatExperience, getChatExperienceLabel } from "@/lib/chat-emotional-experience"
import { getAIConnectionStateLabel } from "@/lib/ai-connection-engine"
import { ConnectionTimer } from "@/components/connection/connection-timer"
import { SharedEnergyBar } from "@/components/sync/shared-energy-bar"
import { SyncTimeline } from "@/components/sync/sync-timeline"
import { useConnectionAnalysis } from "@/hooks/use-connection-analysis"
import { useI18n } from "@/lib/i18n"
import {
  SyncStatusBar,
  EnergyStateBadge,
  EmotionalInsightCard,
  ConnectionPersonalityBadge,
} from "@/components/chat/connection"
import {
  RelationshipIdentityStrip,
  RelationshipStoryTimeline,
  MemoryCard,
} from "@/components/relationship"
import type { ConnectionAuraProfile, RelationshipIdentity } from "@/lib/relationship-identity/types"
import type { RelationshipMoment } from "@/lib/relationship-identity/types"
import { cn } from "@/lib/utils"

export type ConnectionAnalysisBundle = {
  analysis: ConnectionAnalysis | null
  metrics: SyncMetrics | null
  milestones: TimelineMilestone[]
  aiInsight: string | null
  aiLoading: boolean
  aiEnhanced: boolean
  aiMemories?: import("@/lib/ai-connection-engine/types").AIMemoryMoment[]
}

type ConnectionHeaderProps = {
  view: ConnectionView
  messages: ChatMessage[]
  copy: ConnectionCopyKeys & SyncCopyKeys & { waitingReply: string }
  showTyping?: boolean
  hasUnread?: boolean
  justSent?: boolean
  syncSurge?: boolean
  analysisBundle?: ConnectionAnalysisBundle
  relationshipIdentity?: RelationshipIdentity | null
  relationshipAura?: ConnectionAuraProfile | null
  relationshipMoments?: RelationshipMoment[]
}

export function ConnectionHeader({
  view,
  messages,
  copy,
  showTyping,
  hasUnread,
  justSent,
  syncSurge,
  analysisBundle,
  relationshipIdentity,
  relationshipAura,
  relationshipMoments = [],
}: ConnectionHeaderProps) {
  const { t, locale } = useI18n()
  const reduce = useReducedMotion()
  const [expanded, setExpanded] = useState(false)
  const recentActivity = Boolean(justSent || showTyping || hasUnread)

  const internal = useConnectionAnalysis(view, messages, {
    recentActivity,
    enableAI: !analysisBundle,
  })

  const { analysis, metrics, milestones, aiInsight, aiLoading, aiEnhanced, aiMemories } =
    analysisBundle ?? internal

  const experience = deriveChatExperience(analysis, view, recentActivity, metrics)
  const displayInsight = aiInsight

  const syncPercent = metrics?.syncPercent ?? 0
  const glowIntensity =
    metrics?.atmosphereGlow ??
    (metrics?.isFading
      ? 0.2
      : syncPercent >= 80
        ? 0.95
        : syncPercent >= 50
          ? 0.65
          : syncPercent >= 20
            ? 0.4
            : 0.22)

  const stage = stageLabel(view.stage, copy)
  const streak = streakMessage(view, copy)
  const detailLine = view.isFading
    ? view.fadeIntensity > 0.5
      ? copy.fadingLong
      : copy.fading
    : !view.bothParticipated
      ? copy.waitingReply
      : streak

  return (
    <section
      className={cn(
        "connection-header connection-header-v2 shrink-0 border-b md:border-b-0 px-3 py-2.5",
        view.isFading ? "border-amber-500/18" : "border-white/[0.07]",
        aiEnhanced && "connection-header--ai-live"
      )}
      style={
        {
          ...(view.isFading ? { ["--ttm-fade" as string]: view.fadeIntensity } : {}),
          ["--sync-glow-intensity" as string]: glowIntensity,
        } as CSSProperties
      }
      data-exp={experience.state}
      data-rel-personality={relationshipAura?.personality ?? relationshipIdentity?.personality}
    >
      <div className="connection-header-v2__panel connection-header__panel relative z-[1] rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl px-3 py-3 overflow-hidden">
        <motion.div
          className="connection-header-v2__glow connection-header__glow pointer-events-none absolute inset-0 rounded-2xl"
          aria-hidden
          animate={
            reduce
              ? undefined
              : {
                  opacity: [
                    0.35 + experience.intensity * 0.2,
                    0.55 + experience.intensity * 0.35,
                    0.35 + experience.intensity * 0.2,
                  ],
                }
          }
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        />

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full text-left touch-manipulation relative z-[1]"
          aria-expanded={expanded}
        >
          {analysis && metrics ? (
            <SyncStatusBar
              analysis={analysis}
              copy={copy}
              syncSurge={syncSurge}
              className="pr-8"
            />
          ) : (
            <p className="text-[10px] text-white/40 font-extralight">{copy.syncStatusWaiting}</p>
          )}

          <div className="absolute right-0 top-1 flex flex-col items-end gap-2">
            <ConnectionTimer view={view} compact stableLabel={copy.stableLabel} />
            <svg
              className={cn(
                "w-3.5 h-3.5 text-white/35 transition-transform",
                expanded && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {analysis && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2 relative z-[1]">
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[9px] font-extralight uppercase tracking-[0.14em]",
                "border-white/[0.08] bg-white/[0.03] text-white/55",
                experience.state === "aligned_intimacy" && "text-white/80 border-white/15",
                experience.state === "energy_fading" && "text-amber-200/65 border-amber-500/20"
              )}
            >
              {metrics?.aiConnectionState
                ? getAIConnectionStateLabel(metrics.aiConnectionState, t)
                : getChatExperienceLabel(experience.state, t)}
            </span>
            {relationshipIdentity && relationshipAura && (
              <ConnectionPersonalityBadge personality={relationshipIdentity.personality} />
            )}
            <EnergyStateBadge percent={analysis.energyPercent} label={copy.energyLabel} />
            <span className="text-[9px] text-white/28 font-extralight ml-auto hidden sm:inline">
              {stage}
            </span>
          </div>
        )}

        {relationshipIdentity && relationshipAura && !expanded && (
          <div className="mt-2 relative z-[1]">
            <RelationshipIdentityStrip identity={relationshipIdentity} aura={relationshipAura} />
          </div>
        )}

        <div className="mt-2.5 relative z-[1]">
          <SharedEnergyBar value={metrics?.energyPercent ?? 0} momentum={analysis?.momentum} />
        </div>

        {(displayInsight || aiLoading) && (
          <div className="mt-2.5 relative z-[1]">
            <EmotionalInsightCard insight={displayInsight ?? ""} loading={aiLoading && !displayInsight} />
          </div>
        )}

        {detailLine && !expanded && (
          <p className="mt-2 text-[9px] text-amber-200/55 font-extralight truncate relative z-[1]">
            {detailLine}
          </p>
        )}

        {expanded && (
          <motion.div
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden pt-3 mt-3 border-t border-white/[0.06] relative z-[1] space-y-3"
          >
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/28">
              {t("relStoryTitle")}
            </p>
            {relationshipMoments.length > 0 ? (
              <RelationshipStoryTimeline moments={relationshipMoments} />
            ) : null}
            <div className="grid gap-2 mt-3">
              {relationshipMoments
                .filter((m) => m.reached)
                .slice(-2)
                .map((m) => (
                  <MemoryCard key={m.id} moment={m} locale={locale} />
                ))}
            </div>
            <SyncTimeline messages={messages} className="!h-6 mt-3" />
            <p className="text-[8px] text-white/28 font-extralight mt-2">{copy.interactionHint}</p>
          </motion.div>
        )}
      </div>
    </section>
  )
}
