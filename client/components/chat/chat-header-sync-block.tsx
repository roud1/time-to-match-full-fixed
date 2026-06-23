"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { SyncMetrics } from "@/client/lib/sync-system"
import { getChemistryLabel, getEnergyLabel } from "@/client/lib/connection-core-labels"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type ChatHeaderSyncBlockProps = {
  syncMetrics: SyncMetrics | null | undefined
  analysis: ConnectionAnalysis | null
  syncSurge?: boolean
  compact?: boolean
  /** Show chemistry / energy chips (always in header toolbar) */
  showMeta?: boolean
  onOpen?: () => void
  className?: string
}

export function ChatHeaderSyncBlock({
  syncMetrics,
  analysis,
  syncSurge,
  compact = false,
  showMeta = false,
  onOpen,
  className,
}: ChatHeaderSyncBlockProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  const syncPercent = syncMetrics?.syncPercent ?? analysis?.syncPercent ?? 0
  const energyPercent = syncMetrics?.energyPercent ?? analysis?.energyPercent ?? syncPercent
  const tier = syncMetrics?.tier ?? "cold"
  const chemistryLevel = syncMetrics?.chemistryLevel ?? analysis?.chemistryLevel
  const chemistryLabel = chemistryLevel ? getChemistryLabel(chemistryLevel, t) : null
  const energyLabel = getEnergyLabel(energyPercent, t)

  const label = `${t("syncLabel")} ${syncPercent}%`

  const body = (
    <>
      <div className="ttm-chat-header-sync__main">
        <span className="ttm-chat-header-sync__label">{t("syncLabel")}</span>
        <motion.span
          key={syncPercent}
          className="ttm-chat-header-sync__value tabular-nums"
          initial={reduce ? false : { opacity: 0.6, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
        >
          {syncPercent}%
        </motion.span>
        <div className="ttm-chat-header-sync__track" aria-hidden>
          <motion.div
            className="ttm-chat-header-sync__fill"
            initial={false}
            animate={{ width: `${Math.min(100, Math.max(0, energyPercent))}%` }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 24 }}
          />
        </div>
      </div>

      {(!compact || showMeta) && (chemistryLabel || energyLabel) && (
        <div className="ttm-chat-header-sync__meta">
          {chemistryLabel && (
            <p className="ttm-chat-header-sync__chip">
              <span className="ttm-chat-header-sync__chip-key">{t("syncChemistryLabel")}</span>
              <span className="ttm-chat-header-sync__chip-val">{chemistryLabel}</span>
            </p>
          )}
          <p className="ttm-chat-header-sync__chip">
            <span className="ttm-chat-header-sync__chip-key">{t("syncEnergyLabel")}</span>
            <span className="ttm-chat-header-sync__chip-val">{energyLabel}</span>
          </p>
        </div>
      )}
    </>
  )

  const classes = cn(
    "ttm-chat-header-sync",
    `ttm-chat-header-sync--${tier}`,
    syncSurge && "ttm-chat-header-sync--surge",
    compact && !showMeta && "ttm-chat-header-sync--compact",
    (!compact || showMeta) && "ttm-chat-header-sync--wide",
    onOpen && "ttm-chat-header-sync--clickable",
    className
  )

  if (onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={classes}
        style={{ ["--sync-p" as string]: syncPercent }}
        aria-label={t("chatSyncStatsOpenAria").replace("{percent}", String(syncPercent))}
      >
        {body}
      </button>
    )
  }

  return (
    <div className={classes} style={{ ["--sync-p" as string]: syncPercent }} aria-label={label}>
      {body}
    </div>
  )
}
