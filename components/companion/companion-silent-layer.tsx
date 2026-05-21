"use client"

import type { ReactNode } from "react"
import type { EmotionalCompanion } from "@/lib/companion"
import { cn } from "@/lib/utils"

type CompanionSilentLayerProps = {
  companion: EmotionalCompanion | null
  children: ReactNode
  className?: string
}

/** Invisible companion: breathing field + CSS tokens — no chat surface. */
export function CompanionSilentLayer({ companion, children, className }: CompanionSilentLayerProps) {
  return (
    <div
      className={cn("p15-companion-layer", companion && "p15-companion-layer--live", className)}
      style={companion ? (companion.style as React.CSSProperties) : undefined}
      {...(companion?.attrs ?? {})}
    >
      {companion && (
        <>
          <div className="p15-companion-layer__breathe" aria-hidden />
          <div className="p15-companion-layer__glow" aria-hidden />
        </>
      )}
      {children}
    </div>
  )
}
