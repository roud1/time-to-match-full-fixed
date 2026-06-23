"use client"

import type { ReactNode } from "react"
import type { ConnectionIntelligence } from "@/client/lib/intelligence"
import { cn } from "@/client/lib/utils"

type IntelligentSpaceLayerProps = {
  intelligence: ConnectionIntelligence | null
  children: ReactNode
  className?: string
}

/** Evolves shared sync space lighting from AI intelligence tokens. */
export function IntelligentSpaceLayer({ intelligence, children, className }: IntelligentSpaceLayerProps) {
  return (
    <div
      className={cn("p14-intelligent-space", className)}
      style={intelligence ? (intelligence.uiStyle as React.CSSProperties) : undefined}
      {...(intelligence?.uiAttrs ?? {})}
    >
      {intelligence && <div className="p14-intelligent-space__aura" aria-hidden />}
      {children}
    </div>
  )
}
