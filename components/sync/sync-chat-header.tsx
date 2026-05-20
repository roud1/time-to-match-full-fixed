"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import type { ChatMessage } from "@/lib/social-store"
import type { ConnectionView, ConnectionCopyKeys } from "@/lib/connection-system"
import { stageLabel, streakMessage } from "@/lib/connection-system"
import { deriveSyncMetrics, syncStatusKey } from "@/lib/sync-system"
import type { SyncCopyKeys } from "@/lib/sync-copy"
import type { SyncStatusKey } from "@/lib/sync-system"
import type { TranslationKey } from "@/lib/i18n"
import { ConnectionTimer } from "@/components/connection/connection-timer"
import { SyncTimeline } from "@/components/sync/sync-timeline"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type SyncChatHeaderProps = {
  view: ConnectionView
  messages: ChatMessage[]
  copy: ConnectionCopyKeys & SyncCopyKeys
  showTyping?: boolean
  hasUnread?: boolean
  justSent?: boolean
  premiumStrip?: string
  /** @deprecated Always compact in chat; expanded on tap */
  compact?: boolean
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className="text-[8px] uppercase tracking-wider text-white/32 truncate">{label}</span>
        <span className="text-[9px] tabular-nums text-white/55 font-extralight shrink-0">{value}%</span>
      </div>
      <div className="sync-metric-bar h-[2px]">
        <div className="sync-metric-bar__fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export function SyncChatHeader({
  view,
  messages,
  copy,
  showTyping,
  hasUnread,
  justSent,
  premiumStrip,
}: SyncChatHeaderProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [expanded, setExpanded] = useState(false)
  const recentActivity = Boolean(justSent || showTyping || hasUnread)
  const metrics = deriveSyncMetrics(view, { recentActivity })
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

  return (
    <section
      className={cn(
        "sync-chat-header shrink-0 border-b px-3 py-2",
        view.isFading ? "border-amber-500/18 bg-[#070707]" : "border-white/[0.07] bg-[#070707]"
      )}
      style={view.isFading ? { ["--ttm-fade" as string]: view.fadeIntensity } : undefined}
    >
      <div className="relative z-[1] rounded-xl border border-white/[0.07] bg-white/[0.025] px-2.5 py-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center gap-2 text-left touch-manipulation"
          aria-expanded={expanded}
        >
          <div className="min-w-0 flex-1 flex items-baseline gap-2">
            <span className="text-[9px] uppercase tracking-[0.18em] text-white/35 font-extralight shrink-0">
              {copy.syncLabel}
            </span>
            <span className="text-lg font-extralight tabular-nums text-white/92 leading-none">
              {metrics?.syncPercent ?? 0}%
            </span>
            <span className="text-[10px] text-white/45 font-extralight truncate">
              {t(statusKey as TranslationKey)}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline text-[9px] text-white/30 font-extralight">{stage}</span>
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

        <div className="flex gap-2 mt-2">
          <MiniMetric label={copy.connectionLabel} value={metrics?.connectionPercent ?? 0} />
          <MiniMetric label={copy.chemistryLabel} value={metrics?.chemistryPercent ?? 0} />
          <MiniMetric label={copy.energyLabel} value={metrics?.energyPercent ?? 0} />
        </div>

        {showDetail && !expanded && (
          <p className="mt-1.5 text-[9px] text-amber-200/55 font-extralight truncate">{detailLine}</p>
        )}

        {!reduce && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden pt-2 mt-2 border-t border-white/[0.06]"
          >
            <p className="text-[9px] uppercase tracking-[0.16em] text-white/28 mb-1">
              {copy.timelineTitle}
            </p>
            <SyncTimeline messages={messages} className="!h-5" />
            {detailLine && (
              <p className="mt-1.5 text-[9px] text-white/40 font-extralight">{detailLine}</p>
            )}
            <p className="mt-1 text-[8px] text-white/28 font-extralight">{copy.interactionHint}</p>
            {premiumStrip && (
              <p className="mt-1.5 text-[8px] text-center text-white/40 font-extralight">{premiumStrip}</p>
            )}
          </motion.div>
        )}

        {reduce && expanded && (
          <div className="pt-2 mt-2 border-t border-white/[0.06]">
            <SyncTimeline messages={messages} className="!h-5" />
          </div>
        )}
      </div>
    </section>
  )
}
