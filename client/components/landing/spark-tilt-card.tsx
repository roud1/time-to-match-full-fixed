"use client"

import type { ReactNode, CSSProperties } from "react"
import { useRef, useState, useCallback } from "react"
import { useReducedMotion } from "motion/react"
import { cn } from "@/client/lib/utils"

type SparkTiltCardProps = {
  children: ReactNode
  className?: string
  innerClassName?: string
  maxTilt?: number
}

export function SparkTiltCard({
  children,
  className,
  innerClassName,
  maxTilt = 10,
}: SparkTiltCardProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<CSSProperties>({})

  const reset = useCallback(() => {
    setStyle({
      transform: "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      boxShadow: "var(--shadow-md)",
    })
  }, [])

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reduce || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      const rotateY = x * maxTilt * 2
      const rotateX = -y * maxTilt * 2
      const shadowX = -x * 18
      const shadowY = y * 18 + 12
      setStyle({
        transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`,
        boxShadow: `${shadowX}px ${shadowY}px 40px -8px rgba(88, 28, 135, 0.35), 0 12px 32px -12px rgba(0, 0, 0, 0.25)`,
      })
    },
    [maxTilt, reduce]
  )

  return (
    <div
      ref={ref}
      className={cn("spark-tilt-card", className)}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onPointerEnter={onMove}
      style={{ transition: reduce ? undefined : "transform 0.15s ease-out, box-shadow 0.15s ease-out" }}
    >
      <div className={cn("spark-tilt-card__inner", innerClassName)} style={style}>
        {children}
      </div>
    </div>
  )
}
