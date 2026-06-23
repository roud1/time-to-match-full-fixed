"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"
import { cn } from "@/client/lib/utils"

const BURST_DOTS = 14

type DatingHeroSparkProps = {
  className?: string
}

export function DatingHeroSpark({ className }: DatingHeroSparkProps) {
  const reduce = useReducedMotion()
  const [burst, setBurst] = useState(false)

  useEffect(() => {
    if (reduce) return
    const id = window.setTimeout(() => setBurst(true), 680)
    return () => window.clearTimeout(id)
  }, [reduce])

  if (reduce) return null

  return (
    <div className={cn("ttm-dating-hero__spark-sequence", className)} aria-hidden>
      <div className="ttm-dating-hero__spark-aura ttm-dating-hero__spark-aura--live" />
      <div className="ttm-dating-hero__spark-bloom ttm-dating-hero__spark-bloom--live" />

      {burst ? (
        <div className="ttm-dating-hero__spark-burst">
          {Array.from({ length: BURST_DOTS }, (_, i) => (
            <span
              key={i}
              className="ttm-dating-hero__spark-burst-dot"
              style={{ ["--burst-i" as string]: i }}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
