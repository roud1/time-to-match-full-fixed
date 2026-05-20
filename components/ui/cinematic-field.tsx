import type { ReactNode } from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type CinematicFieldProps = {
  label: string
  error?: string
  children: ReactNode
  className?: string
}

/** Unified label + control + error spacing for auth & profile forms */
export function CinematicField({ label, error, children, className }: CinematicFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label className="ttm-type-label font-normal">{label}</Label>
      {children}
      {error ? <p className="text-xs text-red-400/95 font-light leading-snug">{error}</p> : null}
    </div>
  )
}
