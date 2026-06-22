"use client"

import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

type DatingPulseLineProps = {
  className?: string
}

export function DatingPulseLine({ className }: DatingPulseLineProps) {
  const reduce = useReducedMotion()

  return (
    <div className={cn("ttm-dating-pulse-line", className)} aria-hidden>
      <svg viewBox="0 0 400 48" preserveAspectRatio="none" className="ttm-dating-pulse-line__svg">
        <defs>
          <linearGradient id="pulse-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--neon-purple)" stopOpacity="0" />
            <stop offset="20%" stopColor="var(--accent-copper)" stopOpacity="0.9" />
            <stop offset="50%" stopColor="var(--neon-pink)" stopOpacity="1" />
            <stop offset="80%" stopColor="var(--accent-copper)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--neon-blue)" stopOpacity="0" />
          </linearGradient>
          <filter id="pulse-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M0,24 L40,24 L48,12 L56,36 L64,24 L120,24 L128,8 L136,40 L144,24 L200,24 L208,16 L216,32 L224,24 L280,24 L288,10 L296,38 L304,24 L360,24 L368,18 L376,30 L384,24 L400,24"
          fill="none"
          stroke="url(#pulse-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#pulse-glow)"
          className={cn(!reduce && "ttm-dating-pulse-line__path--animate")}
        />
        {!reduce && (
          <motion.circle
            r="3"
            fill="var(--accent-copper)"
            filter="url(#pulse-glow)"
            animate={{ cx: [0, 400], cy: [24, 24] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        )}
      </svg>
    </div>
  )
}
