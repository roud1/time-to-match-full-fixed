"use client"

import type { ConnectionTimeRhythm } from "@/client/lib/time"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type ConnectionRhythmStripProps = {
  rhythm: ConnectionTimeRhythm
  className?: string
}

export function ConnectionRhythmStrip({ rhythm, className }: ConnectionRhythmStripProps) {
  const { t } = useI18n()

  return (
    <p className={cn("p17-rhythm-strip", className)} role="status">
      {t(rhythm.insightKey)}
    </p>
  )
}
