"use client"

import type { RelationshipTimeState } from "@/lib/time"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type RelationshipTimeStateRibbonProps = {
  state: RelationshipTimeState
  className?: string
}

export function RelationshipTimeStateRibbon({ state, className }: RelationshipTimeStateRibbonProps) {
  const { t } = useI18n()

  return (
    <div className={cn("p17-time-state", className)} data-time-state={state.id}>
      <p className="p17-time-state__label">{t(state.labelKey)}</p>
      <p className="p17-time-state__desc">{t(state.descriptionKey)}</p>
    </div>
  )
}
