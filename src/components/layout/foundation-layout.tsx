import type { ReactNode } from "react"
import { cn } from "@/src/lib/cn"

type FoundationLayoutProps = {
  children: ReactNode
  className?: string
}

/**
 * Minimal app shell — use as root wrapper for TTM foundation screens.
 */
export function FoundationLayout({ children, className }: FoundationLayoutProps) {
  return (
    <div className={cn("ttm-foundation min-h-dvh antialiased", className)}>{children}</div>
  )
}
