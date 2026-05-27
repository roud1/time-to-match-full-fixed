"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import type { BondUiState } from "@/hooks/use-match-bond"
import { cn } from "@/lib/utils"

type BondMeterProps = {
  bond: BondUiState
  className?: string
}

export function BondMeter({ bond, className }: BondMeterProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [showProlongMsg, setShowProlongMsg] = useState(false)

  useEffect(() => {
    if (!bond.lastProlongedFlash) return
    setShowProlongMsg(true)
    const id = window.setTimeout(() => setShowProlongMsg(false), 3000)
    return () => clearTimeout(id)
  }, [bond.lastProlongedFlash, bond.flashKey])

  const progressPct = Math.round(Math.min(100, Math.max(0, bond.bondProgress * 100)))
  const until = bond.messagesUntilNext
  const displayLevel = bond.displayLevel
  const levelLabel =
    displayLevel <= 1
      ? t("bondNewConnection")
      : t("bondLevelLabel").replace("{level}", String(displayLevel))

  const showCountdown = !showProlongMsg && until > 0

  return (
    <div className={cn("ttm-bond-meter w-full min-w-0", className)} aria-live="polite">
      <div className="flex items-center gap-1.5 mb-1">
        <motion.span
          className="text-sm leading-none shrink-0 inline-block"
          aria-hidden
          animate={
            reduce
              ? undefined
              : bond.lastProlongedFlash
                ? { scale: [1, 1.28, 1] }
                : { scale: 1 }
          }
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          🔥
        </motion.span>
        <p className="text-xs font-normal text-[var(--text-secondary)] truncate">{levelLabel}</p>
      </div>

      <div
        className={cn(
          "ttm-bond-meter__track relative h-[4px] w-full rounded-full overflow-hidden",
          bond.lastProlongedFlash && !reduce && "ttm-bond-meter__track--sweep"
        )}
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("bondMeterAria")}
      >
        <div
          className="ttm-bond-meter__fill h-full rounded-full"
          style={{
            width: `${Math.max(progressPct, bond.totalMessages > 0 ? 4 : 0)}%`,
          }}
        />
      </div>

      {(showProlongMsg || showCountdown) && (
        <p className="mt-1 text-xs font-normal text-[var(--text-secondary)] leading-snug">
          {showProlongMsg
            ? t("bondProlongCelebration")
            : t("bondMessagesUntilProlong").replace("{count}", String(until))}
        </p>
      )}
    </div>
  )
}
