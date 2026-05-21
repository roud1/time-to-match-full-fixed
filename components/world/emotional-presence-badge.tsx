"use client"

import { useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import type { EmotionalPresence } from "@/lib/world"
import { cn } from "@/lib/utils"

type EmotionalPresenceBadgeProps = {
  presence: EmotionalPresence
  className?: string
  compact?: boolean
}

export function EmotionalPresenceBadge({ presence, className, compact }: EmotionalPresenceBadgeProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <span
      className={cn(
        "world-presence inline-flex items-center gap-1.5 font-extralight",
        compact ? "text-[10px]" : "text-[11px]",
        className
      )}
      data-presence={presence.kind}
      style={{ ["--presence-pulse" as string]: String(presence.pulseLevel) }}
    >
      <span className="world-presence__dot relative flex h-1.5 w-1.5 shrink-0">
        {!reduce && <span className="world-presence__dot-ping" aria-hidden />}
        <span className="world-presence__dot-core" aria-hidden />
      </span>
      <span className="truncate">{t(presence.labelKey)}</span>
    </span>
  )
}
