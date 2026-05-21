"use client"

import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type SharedEnergyBarProps = {
  value: number
  momentum?: number
  className?: string
}

export function SharedEnergyBar({ value, momentum = 0, className }: SharedEnergyBarProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const v = Math.min(100, Math.max(0, value))

  return (
    <div className={cn("sync-energy", className)}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[8px] uppercase tracking-[0.18em] text-white/32 font-extralight">
          {t("syncEnergyLabel")}
        </span>
        <span className="text-[9px] tabular-nums text-white/55 font-extralight">{v}%</span>
      </div>
      <div className="sync-energy__track h-[4px] rounded-full overflow-hidden">
        <motion.div
          className="sync-energy__fill h-full rounded-full"
          initial={false}
          animate={{ width: `${v}%` }}
          transition={
            reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 22 }
          }
        />
        {momentum > 40 && !reduce && (
          <motion.span
            className="sync-energy__shimmer absolute inset-y-0 w-1/3"
            animate={{ x: ["-100%", "320%"] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
        )}
      </div>
    </div>
  )
}
