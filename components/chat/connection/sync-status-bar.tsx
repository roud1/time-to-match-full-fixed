"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { SyncCopyKeys } from "@/lib/sync-copy"
import { getBondLabel, getChemistryLabel, getEnergyLabel } from "@/lib/connection-core-labels"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type SyncStatusBarProps = {
  analysis: ConnectionAnalysis
  copy: SyncCopyKeys
  syncSurge?: boolean
  className?: string
}

export function SyncStatusBar({ analysis, copy, syncSurge, className }: SyncStatusBarProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <div
      className={cn(
        "sync-status-bar flex flex-wrap items-end gap-x-4 gap-y-1",
        syncSurge && "sync-status-bar--surge",
        className
      )}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-[9px] uppercase tracking-[0.22em] text-white/32 font-extralight">
          {copy.syncLabel}
        </span>
        <motion.span
          key={analysis.syncPercent}
          initial={reduce ? false : { opacity: 0.5, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="sync-status-bar__sync-value text-[2rem] font-extralight tabular-nums leading-none text-white tracking-tight"
        >
          {analysis.syncPercent}%
        </motion.span>
      </div>

      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-[11px] font-extralight text-white/55">
          <span className="text-white/30">{copy.chemistryLabel}: </span>
          <span className="text-white/85">{getChemistryLabel(analysis.chemistryLevel, t)}</span>
        </p>
        <p className="text-[11px] font-extralight text-white/55">
          <span className="text-white/30">{copy.bondLabel}: </span>
          <span className="text-white/85">{getBondLabel(analysis.bondLevel, t)}</span>
        </p>
        <p className="text-[11px] font-extralight text-white/55">
          <span className="text-white/30">{copy.energyLabel}: </span>
          <span className="text-white/85">{getEnergyLabel(analysis.energyPercent, t)}</span>
        </p>
      </div>
    </div>
  )
}
