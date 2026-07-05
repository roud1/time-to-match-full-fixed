"use client"

import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/client/lib/utils"

import type { CSSProperties } from "react"

type GlassPanelProps = {
  children: React.ReactNode
  className?: string
  depth?: 1 | 2 | 3
  tilt?: boolean
  /** Skip scroll-reveal — use for above-the-fold panels */
  immediate?: boolean
  /** Inline style overrides (e.g. custom border-color, box-shadow) */
  style?: CSSProperties
}

const DEPTH_CLASS = {
  1: "bg-[var(--xp-glass)] border-[var(--xp-glass-border)] shadow-[var(--xp-glow-purple),0_8px_32px_rgba(0,0,0,0.25)]",
  2: "bg-[rgba(26,26,38,0.72)] border-white/10 shadow-[var(--xp-glow-pink),0_12px_40px_rgba(0,0,0,0.3)]",
  3: "bg-[rgba(34,34,51,0.78)] border-white/12 shadow-[var(--xp-glow-purple),var(--xp-glow-pink),0_24px_80px_rgba(0,0,0,0.45)]",
} as const

export function GlassPanel({ children, className, depth = 1, tilt, immediate, style }: GlassPanelProps) {
  const reduce = useReducedMotion()
  const skipReveal = reduce || immediate

  return (
    <motion.div
      className={cn(
        "rounded-[var(--xp-radius-lg)] border backdrop-blur-xl",
        DEPTH_CLASS[depth],
        className
      )}
      initial={skipReveal ? false : { opacity: 0, y: 16 }}
      animate={immediate && !reduce ? { opacity: 1, y: 0 } : undefined}
      whileInView={skipReveal ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-4%" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={tilt && !reduce ? { rotateX: 2, rotateY: -2, scale: 1.01 } : undefined}
      style={{ transformPerspective: 900, ...style }}
    >
      {children}
    </motion.div>
  )
}
