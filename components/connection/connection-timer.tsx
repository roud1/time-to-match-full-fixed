"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { ConnectionView } from "@/lib/connection-system"

const AURA: Record<ConnectionView["auraTier"], string> = {
  0: "ttm-connection-aura-0",
  1: "ttm-connection-aura-1",
  2: "ttm-connection-aura-2",
  3: "ttm-connection-aura-3",
  4: "ttm-connection-aura-4",
}

type ConnectionTimerProps = {
  view: ConnectionView
  className?: string
  compact?: boolean
  stableLabel?: string
}

export function ConnectionTimer({ view, className, compact, stableLabel }: ConnectionTimerProps) {
  if (view.isStable && !view.showTimer && stableLabel) {
    return (
      <span className={cn("font-light text-emerald-200/90", compact ? "text-[10px]" : "text-xs", className)}>
        {stableLabel}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "tabular-nums font-light",
        compact ? "text-[10px]" : "text-xs",
        view.isFading ? "text-amber-200/90" : "text-pink-200",
        view.urgency === "critical" && "ttm-connection-timer-critical",
        className
      )}
    >
      {view.formattedTime}
    </span>
  )
}

type ConnectionAuraProps = {
  view: ConnectionView
  className?: string
  children: ReactNode
}

export function ConnectionAura({ view, className, children }: ConnectionAuraProps) {
  return (
    <div
      className={cn(
        "relative",
        AURA[view.auraTier],
        view.isFading && "ttm-connection-fading",
        className
      )}
      style={view.isFading ? { ["--ttm-fade" as string]: view.fadeIntensity } : undefined}
    >
      {children}
    </div>
  )
}
