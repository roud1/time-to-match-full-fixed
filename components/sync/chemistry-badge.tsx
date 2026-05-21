"use client"

import type { ChemistryLevel } from "@/lib/connection-engine"
import { useI18n } from "@/lib/i18n"
import type { TranslationKey } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type ChemistryBadgeProps = {
  level: ChemistryLevel
  percent?: number
  className?: string
}

const LEVEL_KEY: Record<ChemistryLevel, TranslationKey> = {
  low: "chemistryLow",
  medium: "chemistryMedium",
  high: "chemistryHigh",
  peak: "chemistryPeak",
}

export function ChemistryBadge({ level, percent, className }: ChemistryBadgeProps) {
  const { t } = useI18n()
  const lit = level === "high" || level === "peak"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-extralight",
        lit
          ? "border-white/20 bg-white/[0.07] text-white/80 shadow-[0_0_20px_-10px_rgba(200,210,255,0.35)]"
          : "border-white/10 bg-white/[0.03] text-white/50",
        className
      )}
    >
      <span
        className={cn(
          "rounded-full shrink-0",
          lit ? "w-1.5 h-1.5 bg-white/75" : "w-1 h-1 bg-white/40"
        )}
        aria-hidden
      />
      <span className="text-[9px] uppercase tracking-[0.14em]">{t("chemistryLabel")}</span>
      <span className="text-[10px]">{t(LEVEL_KEY[level])}</span>
      {percent != null && (
        <span className="text-[9px] tabular-nums text-white/45">{percent}%</span>
      )}
    </span>
  )
}
