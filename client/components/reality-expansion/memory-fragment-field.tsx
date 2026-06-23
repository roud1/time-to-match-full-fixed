"use client"

import { useReducedMotion } from "motion/react"
import type { MemoryWorldField } from "@/client/lib/reality-expansion"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type MemoryFragmentFieldProps = {
  memory: MemoryWorldField
  className?: string
}

export function MemoryFragmentField({ memory, className }: MemoryFragmentFieldProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  if (memory.fragmentCount === 0 && !memory.whisperKey) return null

  return (
    <div
      className={cn("er-memory-world", !reduce && "er-memory-world--live", className)}
      aria-hidden={!memory.whisperKey}
      style={{
        ["--er-memory-remnant" as string]: String(memory.atmosphereRemnant),
        ["--er-memory-cine" as string]: String(memory.cinematicDepth),
      }}
    >
      {memory.fragments.map((f) => (
        <span key={f.id} className="er-memory-world__fragment" style={{ opacity: f.weight }} />
      ))}
      {memory.whisperKey && (
        <p className="er-memory-world__whisper">{t(memory.whisperKey)}</p>
      )}
    </div>
  )
}
