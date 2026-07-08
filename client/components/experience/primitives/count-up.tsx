"use client"

/**
 * CountUp — анимированный счётчик который считает вверх при появлении в viewport.
 * Используется для "stats" секции — 1 847 человек нашли пару, и т.д.
 */

import { motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react"
import { useEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"

type CountUpProps = {
  to: number
  duration?: number
  delay?: number
  className?: string
  suffix?: string
  prefix?: string
}

export function CountUp({
  to,
  duration = 1.8,
  delay = 0,
  className,
  suffix = "",
  prefix = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: "-60px" })

  const count = useMotionValue(0)
  const spring = useSpring(count, {
    stiffness: reduce ? 1000 : 80,
    damping: reduce ? 50 : 20,
  })
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString())

  useEffect(() => {
    if (!inView) return
    const timer = setTimeout(() => {
      count.set(to)
    }, delay * 1000)
    return () => clearTimeout(timer)
  }, [inView, to, count, delay])

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  )
}
