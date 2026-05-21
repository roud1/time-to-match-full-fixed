"use client"

import { useReducedMotion } from "motion/react"
import type { PlatformSoul } from "@/lib/reality-expansion"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type PlatformSoulFieldProps = {
  soul: PlatformSoul
  className?: string
}

/** Invisible atmospheric soul — not a mascot. */
export function PlatformSoulField({ soul, className }: PlatformSoulFieldProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  if (!soul.active) return null

  return (
    <div
      className={cn("er-soul-field", !reduce && "er-soul-field--breathe", className)}
      role="status"
      aria-live="polite"
      style={{
        ["--er-soul-depth" as string]: String(soul.depth),
        ["--er-soul-breath" as string]: String(soul.breathRate),
      }}
    >
      <div className="er-soul-field__halo" aria-hidden />
      <p className="er-soul-field__line">{t(soul.presenceKey)}</p>
    </div>
  )
}
