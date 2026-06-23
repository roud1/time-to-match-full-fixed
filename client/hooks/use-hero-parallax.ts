"use client"

import { useMotionValue, useSpring, useTransform } from "motion/react"
import { useEffect } from "react"

/** Subtle pointer-driven parallax for hero glow layers (desktop). */
export function useHeroParallax(strength = 18) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 80, damping: 20 })
  const sy = useSpring(my, { stiffness: 80, damping: 20 })
  const x = useTransform(sx, (v) => v * strength)
  const y = useTransform(sy, (v) => v * strength)

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      return
    }
    let frame = 0
    const onMove = (e: MouseEvent) => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const nx = (e.clientX / window.innerWidth - 0.5) * 2
        const ny = (e.clientY / window.innerHeight - 0.5) * 2
        mx.set(nx)
        my.set(ny)
      })
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => {
      window.removeEventListener("mousemove", onMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [mx, my])

  return { x, y }
}
