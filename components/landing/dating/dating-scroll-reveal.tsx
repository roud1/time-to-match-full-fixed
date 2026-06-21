"use client"

import { motion, useInView, useReducedMotion } from "motion/react"
import { useRef, type ReactNode } from "react"
import { useSectionParallaxY } from "@/hooks/use-parallax"
import { cn } from "@/lib/utils"

type DatingScrollRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  /** 0–1 — subtle scroll-linked depth shift while section is in view. */
  depth?: number
}

export function DatingScrollReveal({
  children,
  className,
  delay = 0,
  y = 28,
  depth = 0,
}: DatingScrollRevealProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-70px" })
  const depthY = useSectionParallaxY(
    ref,
    depth > 0 ? [-18 * depth, 18 * depth] : [0, 0],
    depth
  )

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      style={depth > 0 ? { y: depthY } : undefined}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y }}
        animate={inView ? { opacity: 1, y: 0 } : reduce ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
