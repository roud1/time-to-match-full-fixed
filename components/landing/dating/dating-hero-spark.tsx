"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

const BURST_DOTS = 14

/** Card stack + gap + heart — sync with dating-landing.css layout (400×430 viewBox). */
const HEART_SVG = { x: 200, y: 408 } as const

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
        viewBox="0 0 400 430"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="dt-spark-trail-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(251, 113, 133, 0.85)" />
            <stop offset="55%" stopColor="rgba(251, 191, 36, 0.75)" />
            <stop offset="100%" stopColor="rgba(249, 115, 22, 0.95)" />
          </linearGradient>
        </defs>
        <path
          className="ttm-dating-hero__spark-trail ttm-dating-hero__spark-trail--left"
          d={`M 108 318 L 108 352 Q 148 378 ${HEART_SVG.x} ${HEART_SVG.y}`}
          pathLength={1}
        />
        <path
          className="ttm-dating-hero__spark-trail ttm-dating-hero__spark-trail--right"
          d={`M 292 328 L 292 358 Q 252 382 ${HEART_SVG.x} ${HEART_SVG.y}`}
          pathLength={1}
        />
        <path
          className="ttm-dating-hero__spark-trail ttm-dating-hero__spark-trail--center"
          d={`M ${HEART_SVG.x} 312 L ${HEART_SVG.x} ${HEART_SVG.y}`}
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
