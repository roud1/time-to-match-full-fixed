"use client"

import { cn } from "@/lib/utils"

export type SkeletonListProps = {
  rows?: number
  rowClassName?: string
  className?: string
  ariaLabel?: string
}

export function SkeletonList({
  rows = 4,
  rowClassName,
  className,
  ariaLabel = "Loading",
}: SkeletonListProps) {
  return (
    <div className={cn("space-y-2.5", className)} aria-busy="true" aria-label={ariaLabel}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-16 rounded-2xl border border-white/8 bg-white/[0.04] animate-pulse",
            rowClassName
          )}
          style={{ animationDelay: `${i * 70}ms` }}
        />
      ))}
    </div>
  )
}
