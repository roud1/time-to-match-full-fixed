"use client"

/**
 * SpotlightCard — карточка со spotlight эффектом при наведении.
 * Световой блик следует за курсором внутри карточки.
 * Используется для feature cards на лендинге.
 */

import { useCallback, useRef } from "react"
import { cn } from "@/client/lib/utils"

type SpotlightCardProps = {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(247, 37, 133, 0.08)",
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const spotRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    const spot = spotRef.current
    if (!el || !spot) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    spot.style.opacity = "1"
    spot.style.left = `${x}px`
    spot.style.top = `${y}px`
  }, [])

  const handleMouseLeave = useCallback(() => {
    const spot = spotRef.current
    if (spot) spot.style.opacity = "0"
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Spotlight — follows cursor */}
      <div
        ref={spotRef}
        aria-hidden
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${spotlightColor} 0%, transparent 70%)`,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.3s",
          zIndex: 0,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
