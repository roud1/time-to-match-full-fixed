"use client"

import {
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type TransformInputRange,
} from "motion/react"
import { useEffect, useState, type RefObject } from "react"

type ScrollRange = TransformInputRange

/** 0 when reduced motion or mobile; scales parallax intensity on small screens. */
export function useParallaxIntensity(desktop = 1) {
  const reduce = useReducedMotion()
  const [intensity, setIntensity] = useState(reduce ? 0 : desktop)

  useEffect(() => {
    if (reduce) {
      setIntensity(0)
      return
    }

    const mq = window.matchMedia("(max-width: 767px)")
    const update = () => setIntensity(mq.matches ? desktop * 0.35 : desktop)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [reduce, desktop])

  return intensity
}

type UseScrollParallaxOptions = {
  /** Scroll input range in px. Default [0, 600]. */
  input?: ScrollRange
  /** Output Y range in px. Positive = moves down on scroll. */
  output: [number, number]
  scrollY?: MotionValue<number>
}

/** Scroll-linked Y transform; returns undefined when parallax is disabled. */
export function useScrollParallaxY({
  input = [0, 600],
  output,
  scrollY: scrollYProp,
}: UseScrollParallaxOptions) {
  const reduce = useReducedMotion()
  const intensity = useParallaxIntensity(1)
  const { scrollY: defaultScrollY } = useScroll()
  const scrollY = scrollYProp ?? defaultScrollY
  const raw = useTransform(scrollY, input, output)
  const y = useTransform(raw, (v) => v * intensity)

  if (reduce || intensity === 0) return undefined
  return y
}

/** Section-scoped scroll progress parallax (element enters/leaves viewport). */
export function useSectionParallaxY(
  ref: RefObject<HTMLElement | null>,
  output: [number, number],
  intensityScale = 1
) {
  const reduce = useReducedMotion()
  const mobileScale = useParallaxIntensity(intensityScale)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const raw = useTransform(scrollYProgress, [0, 1], output)
  const y = useTransform(raw, (v) => v * mobileScale)

  if (reduce || mobileScale === 0) return undefined
  return y
}
