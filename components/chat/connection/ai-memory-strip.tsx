"use client"

import { motion, useReducedMotion } from "motion/react"
import type { AIMemoryMoment } from "@/lib/ai-connection-engine/types"
import { cn } from "@/lib/utils"

type AIMemoryStripProps = {
  memories: AIMemoryMoment[]
  className?: string
}

export function AIMemoryStrip({ memories, className }: AIMemoryStripProps) {
  const reduce = useReducedMotion()
  const top = memories.slice(-3)
  if (top.length === 0) return null

  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {top.map((m, i) => (
        <motion.li
          key={`${m.id}-${m.at}`}
          initial={reduce ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[8px] font-extralight text-white/45 backdrop-blur-sm"
        >
          <span className="text-white/25 mr-1" aria-hidden>
            ✦
          </span>
          {m.label}
        </motion.li>
      ))}
    </ul>
  )
}
