"use client"

import { useReducedMotion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { DatingParallaxLayer } from "@/components/landing/dating/dating-parallax-layer"
import { useSectionParallaxY } from "@/hooks/use-parallax"
import { cn } from "@/lib/utils"

type DatingParallaxBgProps = {
  className?: string
}

export function DatingParallaxBg({ className }: DatingParallaxBgProps) {
  const reduce = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const pinkY = useSectionParallaxY(containerRef, [-40, 40], 1)
  const blueY = useSectionParallaxY(containerRef, [-28, 28], 0.75)
  const violetY = useSectionParallaxY(containerRef, [-52, 52], 1.15)

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
    <div ref={containerRef} className={cn("ttm-dating-parallax", className)} aria-hidden>
      <DatingParallaxLayer y={pinkY} className="ttm-dating-parallax__blob ttm-dating-parallax__blob--pink">
        <div style={{ transform: `translate(${px * 28}px, ${py * 22}px)`, width: "100%", height: "100%" }} />
      </DatingParallaxLayer>
      <DatingParallaxLayer y={blueY} className="ttm-dating-parallax__blob ttm-dating-parallax__blob--blue">
        <div style={{ transform: `translate(${px * -22}px, ${py * -18}px)`, width: "100%", height: "100%" }} />
      </DatingParallaxLayer>
      <DatingParallaxLayer
        y={violetY}
        className="ttm-dating-parallax__blob ttm-dating-parallax__blob--violet"
      >
        <div style={{ transform: `translate(${px * 14}px, ${py * -26}px)`, width: "100%", height: "100%" }} />
      </DatingParallaxLayer>
      <div className="ttm-dating-parallax__mesh" />
    </div>
  )
}
