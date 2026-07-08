"use client"

/**
 * TextReveal — каждое слово появляется снизу вверх по очереди.
 * Используется для заголовков — создаёт кинематографическое ощущение.
 */

import { motion, useReducedMotion, useInView } from "motion/react"
import { useRef } from "react"
import { cn } from "@/client/lib/utils"

type TextRevealProps = {
  text: string
  as?: "h1" | "h2" | "h3" | "p" | "span"
  className?: string
  delay?: number
  stagger?: number
}

export function TextReveal({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
  stagger = 0.08,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: "-80px" })
  const words = text.split(" ")

  if (reduce) {
    return (
      <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={className}>
        {text}
      </Tag>
    )
  }

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={cn("overflow-hidden", className)}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{
              delay: delay + i * stagger,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
