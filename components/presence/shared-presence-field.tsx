"use client"

import type { SharedPresence } from "@/lib/presence"
import { useI18n } from "@/lib/i18n"
import { useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

type SharedPresenceFieldProps = {
  shared: SharedPresence
  className?: string
}

export function SharedPresenceField({ shared, className }: SharedPresenceFieldProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  if (!shared.active) return null

  return (
    <div
      className={cn("p18-shared-field", !reduce && "p18-shared-field--live", className)}
      role="status"
      aria-live="polite"
      style={{
        ["--pres-together-glow" as string]: String(shared.togetherGlow),
      }}
    >
      <div className="p18-shared-field__merge" aria-hidden />
      <p className="p18-shared-field__label">{t(shared.labelKey)}</p>
    </div>
  )
}
