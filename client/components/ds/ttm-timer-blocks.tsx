"use client"

import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/client/lib/utils"

type Unit = { value: number; label: string; pulse?: boolean }

type TtmTimerBlocksProps = {
  units: Unit[]
  tick?: boolean
  className?: string
}

export function TtmTimerBlocks({ units, tick, className }: TtmTimerBlocksProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={cn("inline-flex items-center justify-center gap-3 sm:gap-4", className)}
      animate={tick && !reduce ? { scale: [1, 1.012, 1] } : undefined}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {units.map((unit) => (
        <div key={unit.label} className="ttm-timer-block">
          <span
            className={cn(
              "ttm-timer-block__value",
              unit.pulse && tick && "ttm-timer-block--tick"
            )}
          >
            {String(unit.value).padStart(2, "0")}
          </span>
          <span className="ttm-timer-block__label">{unit.label}</span>
        </div>
      ))}
    </motion.div>
  )
}
