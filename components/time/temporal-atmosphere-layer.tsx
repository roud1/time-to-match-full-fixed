"use client"

import type { ReactNode } from "react"
import type { EmotionalTime } from "@/lib/time"
import { cn } from "@/lib/utils"

type TemporalAtmosphereLayerProps = {
  time: EmotionalTime | null
  children: ReactNode
  className?: string
}

export function TemporalAtmosphereLayer({ time, children, className }: TemporalAtmosphereLayerProps) {
  return (
    <div
      className={cn("p17-temporal-layer", time && "p17-temporal-layer--live", className)}
      style={time ? (time.style as React.CSSProperties) : undefined}
      {...(time?.attrs ?? {})}
    >
      {time && (
        <>
          <div className="p17-temporal-layer__gradient" aria-hidden />
          <div className="p17-temporal-layer__fade" aria-hidden />
        </>
      )}
      <div className="p17-temporal-layer__content">{children}</div>
    </div>
  )
}
