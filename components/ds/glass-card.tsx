"use client"

import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type GlassCardProps = {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function GlassCard({ children, className, hover = true, onClick }: GlassCardProps) {
  const reduce = useReducedMotion()
  const Comp = onClick ? motion.button : motion.div

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl text-left w-full",
        className
      )}
      whileHover={
        hover && !reduce
          ? { y: -2, boxShadow: "0 0 48px -12px rgba(221,230,255,0.12)" }
          : undefined
      }
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  )
}
