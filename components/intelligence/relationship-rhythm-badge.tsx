"use client"

import type { RelationshipRhythm } from "@/lib/intelligence"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

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
