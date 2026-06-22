"use client"

import { motion, type MotionStyle } from "motion/react"
import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/lib/utils"

type DatingParallaxLayerProps = {
  children?: ReactNode
  className?: string
  /** MotionValue<number> for Y translate, or undefined to skip parallax. */
  y?: MotionStyle["y"]
  opacity?: MotionStyle["opacity"]
  style?: MotionStyle
}

/** GPU-friendly scroll parallax wrapper — transform + opacity only. */
export function DatingParallaxLayer({
  children,
  className,
  y,
  opacity,
  style,
}: DatingParallaxLayerProps) {
  if (y === undefined && opacity === undefined) {
    return (
      <div className={className} style={style as CSSProperties | undefined}>
        {children}
      </div>
    )
  }

  return (
    <motion.div className={cn(className)} style={{ y, opacity, ...style }}>
      {children}
    </motion.div>
  )
}
