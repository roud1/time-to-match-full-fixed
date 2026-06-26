"use client"

import { useRef, type ReactNode } from "react"
import { useSectionParallaxY } from "@/client/hooks/use-parallax"
import { ParallaxLayer } from "@/client/components/experience/primitives/parallax-layer"
import { cn } from "@/client/lib/utils"

const DEPTH_RANGE: Record<1 | 2 | 3, [number, number]> = {
  1: [-18, 18],
  2: [-32, 32],
  3: [-48, 48],
}

const DEPTH_SCALE: Record<1 | 2 | 3, number> = {
  1: 0.55,
  2: 0.85,
  3: 1,
}

type ParallaxDepthProps = {
  children: ReactNode
  className?: string
  depth?: 1 | 2 | 3
}

/** Section-scoped Y parallax — cards float at different scroll speeds. */
export function ParallaxDepth({ children, className, depth = 2 }: ParallaxDepthProps) {
  const ref = useRef<HTMLDivElement>(null)
  const y = useSectionParallaxY(ref, DEPTH_RANGE[depth], DEPTH_SCALE[depth])

  return (
    <div ref={ref} className={cn("relative", className)}>
      <ParallaxLayer y={y}>{children}</ParallaxLayer>
    </div>
  )
}
