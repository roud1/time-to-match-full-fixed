"use client"

import { motion } from "motion/react"
import type { ConnectionMemory } from "@/lib/connection-system"
import { cn } from "@/lib/utils"

type ConnectionMemoriesProps = {
  memories: ConnectionMemory[]
  title: string
  daysLabel: (days: number) => string
  fadedLabel: string
  expiredLabel: string
}

export function ConnectionMemories({
  memories,
  title,
  daysLabel,
  fadedLabel,
  expiredLabel,
}: ConnectionMemoriesProps) {
  if (memories.length === 0) return null

  return (
    <section className="mt-8 space-y-3">
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80 font-light px-1">
        {title}
      </h2>
      <ul className="space-y-2">
        {memories.slice(0, 5).map((m, i) => (
          <motion.li
            key={`${m.profileId}-${m.endedAt}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div
              className={cn(
                "rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3",
                "backdrop-blur-md"
              )}
            >
              <p className="text-sm font-light text-foreground/80">
                {m.profileName || `#${m.profileId}`}
              </p>
              <p className="text-xs text-muted-foreground/75 font-light mt-1">
                {daysLabel(m.daysTogether)}
              </p>
              <p className="text-[10px] text-muted-foreground/55 font-light mt-0.5">
                {m.reason === "faded" ? fadedLabel : expiredLabel}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
