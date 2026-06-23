"use client"

import { useLayoutEffect } from "react"
import { useMotionValue, useTransform, type MotionValue } from "motion/react"
import { useReducedMotion } from "motion/react"

export type TopCardSwipeMotion = {
  x: MotionValue<number>
  rotate: MotionValue<number>
  likeOpacity: MotionValue<number>
  nopeOpacity: MotionValue<number>
}

export function useTopCardSwipe(topProfileId: number | undefined): TopCardSwipeMotion {
  const x = useMotionValue(0)
  const reduceMotion = useReducedMotion()

  useLayoutEffect(() => {
    x.set(0)
  }, [topProfileId, x])

  const rotate = useTransform(x, [-300, 300], reduceMotion ? [0, 0] : [-18, 18])
  const likeOpacity = useTransform(x, [0, 72], [0, 1])
  const nopeOpacity = useTransform(x, [-72, 0], [1, 0])

  return { x, rotate, likeOpacity, nopeOpacity }
}
