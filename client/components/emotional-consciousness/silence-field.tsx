"use client"

import { useReducedMotion } from "motion/react"
import type { SilenceUnderstanding } from "@/client/lib/emotional-consciousness"
import { cn } from "@/client/lib/utils"

type SilenceFieldProps = {
  silence: SilenceUnderstanding
  className?: string
}

/** Phase 22 — visual stillness from understood silence. */
export function SilenceField({ silence, className }: SilenceFieldProps) {
  const reduce = useReducedMotion()

  return (
    <div
      className={cn("ec-silence-field", className)}
      aria-hidden
      data-ec-silence={silence.kind}
      style={{
        ["--ec-silence-depth" as string]: String(silence.depth),
        ["--ec-silence-still" as string]: String(silence.stillness),
        animationDuration: reduce ? "0ms" : undefined,
      }}
    />
  )
}
