"use client"

import { useReducedMotion } from "motion/react"
import type { EmotionalMemoryField } from "@/client/lib/emotional-os"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type MemoryAtmosphereProps = {
  memory: EmotionalMemoryField
  className?: string
}

export function MemoryAtmosphere({ memory, className }: MemoryAtmosphereProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  if (memory.atmosphereRecall < 0.2) return null

  return (
    <div
      className={cn("eo-memory-atmo", !reduce && "eo-memory-atmo--live", className)}
      aria-hidden
      style={{
        ["--eo-memory-recall" as string]: String(memory.atmosphereRecall),
        ["--eo-memory-weight" as string]: String(memory.cinematicWeight),
      }}
    >
      {memory.storytellingKey && (
        <p className="eo-memory-atmo__line">{t(memory.storytellingKey)}</p>
      )}
    </div>
  )
}
