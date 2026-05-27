"use client"

import type { ReactNode } from "react"
import { Children } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

type SparkStaggerProps = {
  children: ReactNode
  className?: string
  stagger?: number
}

export function SparkStagger({ children, className, stagger = 0.1 }: SparkStaggerProps) {
  const reduce = useReducedMotion()
  const items = Children.toArray(children)

  return (
    <div className={cn(className)}>
      {items.map((child, index) => (
        <motion.div
          key={index}
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{
            duration: 0.55,
            delay: reduce ? 0 : index * stagger,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
