"use client"

import { useI18n } from "@/client/lib/i18n"
import { STAGE_LABEL_KEYS, type RelationshipEcosystemStage } from "@/client/lib/ecosystem"
import { cn } from "@/client/lib/utils"

type RelationshipStageRibbonProps = {
  stage: RelationshipEcosystemStage
  progress: number
  description?: string
  className?: string
}

export function RelationshipStageRibbon({
  stage,
  progress,
  description,
  className,
}: RelationshipStageRibbonProps) {
  const { t } = useI18n()

  return (
    <div className={cn("eco-stage-ribbon", className)} data-eco-stage={stage}>
      <p className="eco-stage-ribbon__label">{t("ecoStageEyebrow")}</p>
      <p className="eco-stage-ribbon__name">{t(STAGE_LABEL_KEYS[stage])}</p>
      {description && (
        <p className="text-[10px] text-white/40 font-light mt-1 leading-snug line-clamp-2">{description}</p>
      )}
      <div className="eco-stage-ribbon__track" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className="eco-stage-ribbon__fill" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </div>
  )
}
