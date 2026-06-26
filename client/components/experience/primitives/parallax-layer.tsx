"use client"

import { motion, type MotionStyle } from "motion/react"
import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/client/lib/utils"

type ParallaxLayerProps = {
  children?: ReactNode
  className?: string
  y?: MotionStyle["y"]
  x?: MotionStyle["x"]
  opacity?: MotionStyle["opacity"]
  scale?: MotionStyle["scale"]
  style?: MotionStyle
}

/** GPU-friendly scroll parallax wrapper — transform + opacity only. */
export function ParallaxLayer({
  children,
  className,
  y,
  x,
  opacity,
  scale,
  style,
}: ParallaxLayerProps) {
  const hasMotion = y !== undefined || x !== undefined || opacity !== undefined || scale !== undefined

  if (!hasMotion) {
    return (
      <div className={className} style={style as CSSProperties | undefined}>
        {children}
      </div>
    )
  }

  return (
    <motion.div className={cn(className)} style={{ y, x, opacity, scale, ...style }}>
      {children}
    </motion.div>
  )
}
