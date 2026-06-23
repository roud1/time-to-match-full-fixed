"use client"

import type { RelationshipRhythm } from "@/client/lib/intelligence"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

export function RelationshipRhythmBadge({
  rhythm,
  className,
}: {
  rhythm: RelationshipRhythm
  className?: string
}) {
  const { t } = useI18n()

  return (
    <div className={cn("p14-rhythm-badge", className)} data-rhythm={rhythm.type}>
      <p className="p14-rhythm-badge__label">{t(rhythm.labelKey)}</p>
      <p className="p14-rhythm-badge__desc">{t(rhythm.descriptionKey)}</p>
    </div>
  )
}
