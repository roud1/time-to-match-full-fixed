"use client"

import { useMemo } from "react"
import type { ConnectionView } from "@/client/lib/connection-system"
import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { ChatMessage } from "@/client/lib/social-store"
import type { ConnectionRecord } from "@/client/lib/connection-system"
import { analyzeRelationshipEvolution } from "@/client/lib/world"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type RelationshipEvolutionPanelProps = {
  view: ConnectionView
  analysis: ConnectionAnalysis
  messages: ChatMessage[]
  record: ConnectionRecord
  className?: string
}

export function RelationshipEvolutionPanel({
  view,
  analysis,
  messages,
  record,
  className,
}: RelationshipEvolutionPanelProps) {
  const { t } = useI18n()
  const snapshot = useMemo(
    () => analyzeRelationshipEvolution(view, analysis, messages, record),
    [view, analysis, messages, record]
  )

  return (
    <div className={cn("world-evo-panel", className)} data-evo-maturity={snapshot.maturity}>
      <p className="world-evo-panel__eyebrow">{t("evoPanelEyebrow")}</p>
      <p className="world-evo-panel__title">{t(snapshot.titleKey)}</p>
      <p className="world-evo-panel__body">{t(snapshot.bodyKey)}</p>
      <div className="world-evo-panel__metrics">
        <span>{t("evoRhythm")} {snapshot.communicationDepth}%</span>
        <span>{t("evoStability")} {snapshot.attachmentStability}%</span>
      </div>
    </div>
  )
}
