"use client"

import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/client/lib/utils"

type GlassPanelProps = {
  children: React.ReactNode
  className?: string
  depth?: 1 | 2 | 3
  tilt?: boolean
}

const DEPTH_CLASS = {
  1: "bg-[var(--xp-glass)] border-[var(--xp-glass-border)] shadow-[var(--xp-glow-purple)]",
  2: "bg-[rgba(26,26,38,0.72)] border-white/10 shadow-[var(--xp-glow-pink)]",
  3: "bg-[rgba(34,34,51,0.78)] border-white/12 shadow-[0_24px_80px_rgba(0,0,0,0.45)]",
} as const

export function GlassPanel({ children, className, depth = 1, tilt }: GlassPanelProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={cn(
        "rounded-[var(--xp-radius-lg)] border backdrop-blur-xl",
        DEPTH_CLASS[depth],
        className
      )}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={tilt && !reduce ? { rotateX: 2, rotateY: -2, scale: 1.01 } : undefined}
      style={{ transformPerspective: 900 }}
    >
      {children}
    </motion.div>
  )
}
