"use client"

import { useMemo } from "react"
import { useI18n } from "@/client/lib/i18n"
import type { ConnectionRecord } from "@/client/lib/connection-system"
import type { ChatMessage } from "@/client/lib/social-store"
import { buildConnectionView } from "@/client/lib/connection-system"
import { analyzeConnection } from "@/client/lib/connection-engine"
import { analyzeRelationshipPatterns } from "@/client/lib/shared/relationship-insights"
import { cn } from "@/client/lib/utils"

type RelationshipInsightPanelProps = {
  messages: ChatMessage[]
  record: ConnectionRecord
  className?: string
}

export function RelationshipInsightPanel({ messages, record, className }: RelationshipInsightPanelProps) {
  const { t } = useI18n()
  const insight = useMemo(() => {
    const view = buildConnectionView(record)
    const analysis = analyzeConnection(view, messages, record)
    return analyzeRelationshipPatterns(messages, record, analysis)
  }, [messages, record])

  if (messages.length < 4) return null

  return (
    <div className={cn("p10-insight-panel", className)}>
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-extralight mb-2">
        {t("insightPanelEyebrow")}
      </p>
      <p className="text-sm font-extralight text-white/85">{t(insight.titleKey)}</p>
      <p className="text-xs font-light text-white/50 mt-1 leading-relaxed">{t(insight.bodyKey)}</p>
      <p className="text-[10px] text-indigo-200/60 font-light mt-2">{t(insight.rhythmKey)}</p>
    </div>
  )
}
