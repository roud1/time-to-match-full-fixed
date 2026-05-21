"use client"

import type { CompatibilityIntelligence } from "@/lib/intelligence"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type CompatibilityInsightPanelProps = {
  compatibility: CompatibilityIntelligence
  compact?: boolean
  className?: string
}

export function CompatibilityInsightPanel({
  compatibility,
  compact,
  className,
}: CompatibilityInsightPanelProps) {
  const { t } = useI18n()

  return (
    <div className={cn("p14-compat-panel", compact && "p14-compat-panel--compact", className)}>
      <p className="p14-compat-panel__eyebrow">{t("intelCompatEyebrow")}</p>
      <div className="p14-compat-panel__scores">
        <span>
          {t("intelCompatScore")} {compatibility.compatibilityScore}%
        </span>
        {!compact && (
          <>
            <span>
              {t("intelResonance")} {compatibility.emotionalResonance}%
            </span>
            <span>
              {t("intelLongTerm")} {compatibility.longTermPotential}%
            </span>
          </>
        )}
      </div>
      <div className="p14-compat-panel__bar" role="progressbar" aria-valuenow={compatibility.compatibilityScore}>
        <div className="p14-compat-panel__fill" style={{ width: `${compatibility.compatibilityScore}%` }} />
      </div>
    </div>
  )
}
