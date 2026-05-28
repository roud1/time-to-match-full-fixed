"use client"

import { useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type DatingParallaxBgProps = {
  className?: string
}

export function DatingParallaxBg({ className }: DatingParallaxBgProps) {
  const reduce = useReducedMotion()
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (reduce) return

    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      setPos({ x, y })
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [reduce])

  const px = reduce ? 0 : pos.x
  const py = reduce ? 0 : pos.y

  return (
    <div className={cn("ttm-dating-parallax", className)} aria-hidden>
      <div
        className="ttm-dating-parallax__blob ttm-dating-parallax__blob--pink"
        style={{ transform: `translate(${px * 28}px, ${py * 22}px)` }}
      />
      <div
        className="ttm-dating-parallax__blob ttm-dating-parallax__blob--blue"
        style={{ transform: `translate(${px * -22}px, ${py * -18}px)` }}
      />
      <div
        className="ttm-dating-parallax__blob ttm-dating-parallax__blob--violet"
        style={{ transform: `translate(${px * 14}px, ${py * -26}px)` }}
      />
      <div className="ttm-dating-parallax__mesh" />
    </div>
  )
}
