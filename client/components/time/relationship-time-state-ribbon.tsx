"use client"

import type { RelationshipTimeState } from "@/client/lib/time"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

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
