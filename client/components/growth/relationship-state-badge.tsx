"use client"

import { useMemo, type CSSProperties } from "react"
import type { ConnectionView } from "@/client/lib/connection-system"
import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import { useI18n, type TranslationKey } from "@/client/lib/i18n"
import {
  deriveLiveRelationshipState,
  getRelationshipStateTokens,
} from "@/client/lib/shared/relationship-live-state"
import { cn } from "@/client/lib/utils"

const STATE_KEYS: Record<string, TranslationKey> = {
  growing: "relStateGrowing",
  stable: "relStateStable",
  fading: "relStateFading",
  intense: "relStateIntense",
  unstable: "relStateUnstable",
  deepening: "relStateDeepening",
}

type RelationshipStateBadgeProps = {
  view: ConnectionView
  analysis?: ConnectionAnalysis | null
  className?: string
}

export function RelationshipStateBadge({ view, analysis, className }: RelationshipStateBadgeProps) {
  const { t } = useI18n()
  const state = useMemo(() => deriveLiveRelationshipState(view, analysis), [view, analysis])
  const tokens = getRelationshipStateTokens(state)

  return (
    <span
      className={cn("p10-rel-badge", className)}
      data-state={tokens.state}
      style={
        {
          ["--p10-hue" as string]: tokens.gradientHue,
        } as CSSProperties
      }
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          state === "fading" ? "bg-white/35" : "bg-indigo-300/80"
        )}
        aria-hidden
      />
      {t(STATE_KEYS[state])}
    </span>
  )
}
