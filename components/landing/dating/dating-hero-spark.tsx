"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

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
      <svg
        className="ttm-dating-hero__spark-trails"
        viewBox="0 0 400 360"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="dt-spark-trail-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(251, 191, 36, 0)" />
            <stop offset="45%" stopColor="rgba(251, 113, 133, 0.85)" />
            <stop offset="100%" stopColor="rgba(249, 115, 22, 0.95)" />
          </linearGradient>
        </defs>
        <path
          className="ttm-dating-hero__spark-trail ttm-dating-hero__spark-trail--left"
          d="M 88 118 Q 138 142 200 158"
          pathLength={1}
        />
        <path
          className="ttm-dating-hero__spark-trail ttm-dating-hero__spark-trail--right"
          d="M 312 248 Q 258 200 200 158"
          pathLength={1}
        />
      </svg>

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
