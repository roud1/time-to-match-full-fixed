"use client"

import { useReducedMotion } from "motion/react"

export function DiscoverAmbient() {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <div className="discover-ambient" aria-hidden>
      <div className="discover-ambient__blob discover-ambient__blob--a" />
      <div className="discover-ambient__blob discover-ambient__blob--b" />
    </div>
  )
}
