"use client"

import { useState, type CSSProperties } from "react"
import { motion, useReducedMotion } from "motion/react"
import type { ChatMessage } from "@/lib/social-store"
import type { ConnectionView, ConnectionCopyKeys } from "@/lib/connection-system"
import { stageLabel, streakMessage } from "@/lib/connection-system"
import { syncStatusKey } from "@/lib/sync-system"
import type { SyncCopyKeys } from "@/lib/sync-copy"
import type { TranslationKey } from "@/lib/i18n"
import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { SyncMetrics } from "@/lib/sync-system"
import type { TimelineMilestone } from "@/lib/connection-timeline"
import { ConnectionTimer } from "@/components/connection/connection-timer"
import { ChemistryBadge } from "@/components/sync/chemistry-badge"
import { ChemistryIndicator } from "@/components/sync/chemistry-indicator"
import { BondIndicator } from "@/components/sync/bond-indicator"
import { BondStatus } from "@/components/sync/bond-status"
import { EmotionalStatus } from "@/components/sync/emotional-status"
import { SharedEnergyBar } from "@/components/sync/shared-energy-bar"
import { ConnectionTimeline } from "@/components/sync/connection-timeline"
import { SyncTimeline } from "@/components/sync/sync-timeline"
import { useConnectionAnalysis } from "@/hooks/use-connection-analysis"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export type ConnectionAnalysisBundle = {
  analysis: ConnectionAnalysis | null
  metrics: SyncMetrics | null
  milestones: TimelineMilestone[]
  aiInsight: string | null
  aiLoading: boolean
  aiEnhanced: boolean
}

type SyncChatHeaderProps = {
  view: ConnectionView
  messages: ChatMessage[]
  copy: ConnectionCopyKeys & SyncCopyKeys
  showTyping?: boolean
  hasUnread?: boolean
  justSent?: boolean
  premiumStrip?: string
  /** When provided, skips duplicate AI fetch (parent owns useConnectionAnalysis). */
  analysisBundle?: ConnectionAnalysisBundle
}

export function SyncChatHeader({
  view,
  messages,
  copy,
  showTyping,
  hasUnread,
  justSent,
  premiumStrip,
  analysisBundle,
}: SyncChatHeaderProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [expanded, setExpanded] = useState(false)
  const recentActivity = Boolean(justSent || showTyping || hasUnread)

  const internal = useConnectionAnalysis(view, messages, {
    recentActivity,
    enableAI: !analysisBundle,
  })

  const { analysis, metrics, milestones, aiInsight, aiLoading, aiEnhanced } =
    analysisBundle ?? internal

  const statusKey = metrics ? syncStatusKey(metrics, view) : "syncStatusGrowing"
  const stage = stageLabel(view.stage, copy)
  const streak = streakMessage(view, copy)
  const detailLine = view.isFading
    ? view.fadeIntensity > 0.5
      ? copy.fadingLong
      : copy.fading
    : !view.bothParticipated
      ? copy.waitingReply
      : streak
  const showDetail = Boolean(detailLine && (view.isFading || !view.bothParticipated))
  const glowIntensity = metrics
    ? metrics.isFading
      ? 0.2
      : metrics.syncPercent >= 80
        ? 0.95
        : metrics.syncPercent >= 50
          ? 0.65
          : metrics.syncPercent >= 20
            ? 0.4
            : 0.22
    : 0.25

  return (
    <section
      className={cn(
        "sync-chat-sanctuary shrink-0 border-b px-3 py-2.5",
        view.isFading ? "border-amber-500/18" : "border-white/[0.07]",
        aiEnhanced && "sync-chat-sanctuary--ai-live"
      )}
      style={
        {
          ...(view.isFading ? { ["--ttm-fade" as string]: view.fadeIntensity } : {}),
          ["--sync-glow-intensity" as string]: glowIntensity,
        } as CSSProperties
      }
    >
      <div className="sync-chat-sanctuary__panel relative z-[1] rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl px-3 py-2.5 overflow-hidden">
        <motion.div
          className="sync-chat-sanctuary__glow pointer-events-none absolute inset-0 rounded-2xl"
          aria-hidden
          animate={
            reduce || !aiEnhanced
              ? undefined
              : { opacity: [0.5, 0.85, 0.5] }
          }
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-start gap-3 text-left touch-manipulation relative z-[1]"
          aria-expanded={expanded}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[9px] uppercase tracking-[0.22em] text-white/32 font-extralight">
                {copy.syncLabel}
              </span>
              <motion.span
                key={metrics?.syncPercent ?? 0}
                initial={reduce ? false : { opacity: 0.6, scale: 0.96 }}
                animate={{
                  opacity: 1,
                  scale: aiEnhanced && !reduce ? [1, 1.05, 1] : 1,
                }}
                transition={
                  aiEnhanced && !reduce
                    ? { scale: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }
                    : { duration: 0.45 }
                }
                className={cn(
                  "text-2xl font-extralight tabular-nums leading-none tracking-tight",
                  aiEnhanced ? "text-white sync-percent--ai" : "text-white/95"
                )}
              >
                {metrics?.syncPercent ?? 0}%
              </motion.span>
            </div>
            <BondStatus view={view} metrics={metrics} size="sm" className="mt-0.5" />
            <p className="mt-1 text-[11px] text-white/55 font-extralight leading-snug">
              {aiLoading ? t("syncAnalyzing") : t(statusKey as TranslationKey)}
            </p>
            {aiInsight && !aiLoading && (
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-[10px] text-white/45 font-extralight leading-snug italic sync-insight-line"
              >
                {aiInsight}
              </motion.p>
            )}
            {analysis && metrics && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <ChemistryBadge
                  level={analysis.chemistryLevel}
                  percent={analysis.chemistryPercent}
                />
                <ChemistryIndicator metrics={metrics} label={copy.chemistryLabel} />
                <span className="text-[9px] text-white/30 font-extralight hidden xs:inline">
                  {stage}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <ConnectionTimer view={view} compact stableLabel={copy.stableLabel} />
            <svg
              className={cn(
                "w-3.5 h-3.5 text-white/35 transition-transform mt-0.5",
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
          <div className="mt-3 grid grid-cols-2 gap-2 relative z-[1]">
            <BondIndicator level={analysis.bondLevel} percent={analysis.bondPercent} compact />
            <EmotionalStatus state={analysis.emotionalState} />
          </div>
        )}

        <div className="mt-2 relative z-[1]">
          <SharedEnergyBar value={metrics?.energyPercent ?? 0} momentum={analysis?.momentum} />
        </div>

        {showDetail && !expanded && (
          <p className="mt-2 text-[9px] text-amber-200/55 font-extralight truncate relative z-[1]">
            {detailLine}
          </p>
        )}

        {!reduce && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden pt-3 mt-3 border-t border-white/[0.06] relative z-[1]"
          >
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/28 mb-2">
              {copy.timelineTitle}
            </p>
            <ConnectionTimeline milestones={milestones} compact />
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/28 mt-3 mb-1">
              {t("timelineActivityLabel")}
            </p>
            <SyncTimeline messages={messages} className="!h-6" />
            <p className="mt-2 text-[8px] text-white/28 font-extralight">{copy.interactionHint}</p>
            {detailLine && (
              <p className="mt-1.5 text-[9px] text-white/40 font-extralight">{detailLine}</p>
            )}
            {premiumStrip && (
              <p className="mt-1.5 text-[8px] text-center text-white/40 font-extralight">
                {premiumStrip}
              </p>
            )}
          </motion.div>
        )}

        {reduce && expanded && (
          <div className="pt-3 mt-3 border-t border-white/[0.06] relative z-[1]">
            <ConnectionTimeline milestones={milestones} compact />
            <SyncTimeline messages={messages} className="!h-6 mt-2" />
          </div>
        )}
      </div>
    </section>
  )
}
