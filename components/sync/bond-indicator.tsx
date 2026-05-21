"use client"

import type { BondLevel } from "@/lib/connection-engine"
import { useI18n } from "@/lib/i18n"
import type { TranslationKey } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type BondIndicatorProps = {
  level: BondLevel
  percent: number
  className?: string
  compact?: boolean
}

const LEVEL_KEY: Record<BondLevel, TranslationKey> = {
  forming: "bondForming",
  growing: "bondGrowing",
  stable: "bondStable",
  deep: "bondDeep",
}

export function BondIndicator({ level, percent, className, compact }: BondIndicatorProps) {
  const { t } = useI18n()

  return (
    <div className={cn("sync-metric-block", className)}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span
          className={cn(
            "uppercase tracking-[0.18em] text-white/35 font-extralight",
            compact ? "text-[8px]" : "text-[9px]"
          )}
        >
          {t("bondLabel")}
        </span>
        <span
          className={cn(
            "tabular-nums text-white/70 font-extralight",
            compact ? "text-[9px]" : "text-[10px]"
          )}
        >
          {percent}%
        </span>
      </div>
      <div className={cn("sync-metric-bar", compact ? "h-[2px]" : "h-[3px]")}>
        <div className="sync-metric-bar__fill sync-metric-bar__fill--bond" style={{ width: `${percent}%` }} />
      </div>
      <p className={cn("mt-1 text-white/40 font-extralight", compact ? "text-[8px]" : "text-[9px]")}>
        {t(LEVEL_KEY[level])}
      </p>
    </div>
  )
}
