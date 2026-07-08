"use client"

/**
 * StaggerIn — контейнер который показывает дочерние элементы с задержкой по очереди.
 * Используется для списков, сеток карточек, статистики.
 * Анимация запускается когда контейнер попадает в viewport.
 */

import { motion, useReducedMotion, useInView } from "motion/react"
import { useRef } from "react"
import { cn } from "@/client/lib/utils"

type StaggerInProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  stagger?: number
  from?: "bottom" | "left" | "right" | "top" | "scale"
}

const VARIANTS = {
  bottom: { hidden: { y: 28, opacity: 0 }, visible: { y: 0, opacity: 1 } },
  left:   { hidden: { x: -28, opacity: 0 }, visible: { x: 0, opacity: 1 } },
  right:  { hidden: { x: 28, opacity: 0 }, visible: { x: 0, opacity: 1 } },
  top:    { hidden: { y: -28, opacity: 0 }, visible: { y: 0, opacity: 1 } },
  scale:  { hidden: { scale: 0.88, opacity: 0 }, visible: { scale: 1, opacity: 1 } },
}

export function StaggerIn({
  children,
  className,
  delay = 0,
  stagger = 0.1,
  from = "bottom",
}: StaggerInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: "-60px" })
  const { hidden, visible } = VARIANTS[from]

  return (
    <div ref={ref} className={cn("contents", className)}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : hidden}
              animate={inView ? visible : hidden}
              transition={{
                delay: delay + i * stagger,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {child}
            </motion.div>
          ))
        : children}
    </div>
  )
}
