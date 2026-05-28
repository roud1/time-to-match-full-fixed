import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type GlassPanelProps = {
  children: ReactNode
  className?: string
}

export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/12 bg-white/[0.05] backdrop-blur-2xl",
        className
      )}
    >
      {children}
    </div>
  )
}
