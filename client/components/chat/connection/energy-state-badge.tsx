"use client"

import { motion, useReducedMotion } from "motion/react"
import { getEnergyLabel } from "@/client/lib/connection-core-labels"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type EnergyStateBadgeProps = {
  percent: number
  label?: string
  className?: string
}

export function EnergyStateBadge({ percent, label, className }: EnergyStateBadgeProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const energyLabel = getEnergyLabel(percent, t)
  const tone =
    percent >= 70 ? "high" : percent >= 40 ? "steady" : percent >= 25 ? "steady" : "cooling"

  return (
    <motion.div
      layout
      className={cn(
        "energy-state-badge inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 backdrop-blur-md",
        tone === "high" && "energy-state-badge--high",
        tone === "cooling" && "energy-state-badge--cooling",
        className
      )}
      animate={reduce ? undefined : { opacity: [0.88, 1, 0.88] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full shrink-0",
          tone === "high"
            ? "bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
            : tone === "cooling"
              ? "bg-amber-200/50"
              : "bg-white/40"
        )}
        aria-hidden
      />
      <div className="min-w-0">
        {label && (
          <p className="text-[7px] uppercase tracking-[0.16em] text-white/28 font-extralight leading-none">
            {label}
          </p>
        )}
        <p className="text-[10px] font-extralight text-white/75 leading-tight">{energyLabel}</p>
      </div>
    </motion.div>
  )
}
