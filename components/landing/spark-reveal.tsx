"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

type SparkRevealProps = {
  children: ReactNode
  className?: string
  as?: "section" | "div"
  delay?: number
  id?: string
}

export function SparkReveal({
  children,
  className,
  as = "section",
  delay = 0,
  id,
}: SparkRevealProps) {
  const reduce = useReducedMotion()
  const motionProps = {
    id,
    className: cn("spark-reveal", className),
    initial: reduce ? false : { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" as const },
    transition: {
      duration: 0.55,
      delay: reduce ? 0 : delay,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }

  if (as === "section") {
    return <motion.section {...motionProps}>{children}</motion.section>
  }

  return <motion.div {...motionProps}>{children}</motion.div>
}
