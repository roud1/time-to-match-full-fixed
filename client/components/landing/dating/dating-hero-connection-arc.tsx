"use client"

import { useReducedMotion } from "motion/react"
import { cn } from "@/client/lib/utils"

export function DatingHeroConnectionArc() {
  const reduce = useReducedMotion()

  return (
    <div className="ttm-dating-hero__connection-arc" aria-hidden>
      <svg
        className="ttm-dating-hero__connection-arc-svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="dt-hero-arc-grad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="rgba(251, 113, 133, 0)" />
            <stop offset="28%" stopColor="rgba(251, 113, 133, 0.35)" />
            <stop offset="50%" stopColor="rgba(249, 115, 22, 0.55)" />
            <stop offset="72%" stopColor="rgba(251, 113, 133, 0.35)" />
            <stop offset="100%" stopColor="rgba(251, 191, 36, 0)" />
          </linearGradient>
          <filter id="dt-hero-arc-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          className={cn(
            "ttm-dating-hero__connection-arc-path",
            !reduce && "ttm-dating-hero__connection-arc-path--live"
          )}
          d="M 180 420 Q 720 280 1260 380"
          stroke="url(#dt-hero-arc-grad)"
          strokeWidth="2.5"
          filter="url(#dt-hero-arc-glow)"
          pathLength={1}
        />
        <path
          className={cn(
            "ttm-dating-hero__connection-arc-path ttm-dating-hero__connection-arc-path--soft",
            !reduce && "ttm-dating-hero__connection-arc-path--live"
          )}
          d="M 220 480 Q 720 360 1200 440"
          stroke="url(#dt-hero-arc-grad)"
          strokeWidth="1.5"
          opacity="0.45"
          pathLength={1}
        />
      </svg>
      <div
        className={cn(
          "ttm-dating-hero__connection-arc-node",
          !reduce && "ttm-dating-hero__connection-arc-node--live"
        )}
      />
    </div>
  )
}
