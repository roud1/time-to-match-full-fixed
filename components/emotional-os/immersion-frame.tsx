"use client"

import type { ReactNode } from "react"
import type { EmotionalOperatingSystem } from "@/lib/emotional-os"
import { cn } from "@/lib/utils"

type ImmersionFrameProps = {
  os: EmotionalOperatingSystem | null
  children: ReactNode
  className?: string
}

/** Full-immersion surface — minimal UI noise, emotional depth. */
export function ImmersionFrame({ os, children, className }: ImmersionFrameProps) {
  return (
    <div
      className={cn("eo-immersion-frame flex flex-col flex-1 min-h-0", className)}
      {...(os?.attrs ?? {})}
      style={os?.style as React.CSSProperties}
    >
      {children}
    </div>
  )
}
