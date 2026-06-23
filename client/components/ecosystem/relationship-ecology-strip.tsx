"use client"

import type { RelationshipEcology } from "@/client/lib/ecosystem"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type RelationshipEcologyStripProps = {
  ecology: RelationshipEcology
  className?: string
}

export function RelationshipEcologyStrip({ ecology, className }: RelationshipEcologyStripProps) {
  const { t } = useI18n()

  return (
    <div className={cn("eco-ecology-strip", className)} aria-label={t("ecoEcologyAria")}>
      <span>
        <span className="eco-ecology-strip__dot" aria-hidden />
        {t("ecoRhythm")} {ecology.rhythmScore}%
      </span>
      <span>{t("ecoConsistency")} {ecology.consistencyScore}%</span>
      <span>{t(ecology.insightTitleKey)}</span>
    </div>
  )
}
