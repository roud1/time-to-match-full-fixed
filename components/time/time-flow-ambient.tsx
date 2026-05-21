"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"
import { getTimeFlowTokens } from "@/lib/time"
import { cn } from "@/lib/utils"

type TimeFlowAmbientProps = {
  className?: string
}

export function TimeFlowAmbient({ className }: TimeFlowAmbientProps) {
  const reduce = useReducedMotion()
  const [hour, setHour] = useState(() => new Date().getHours())

  useEffect(() => {
    const id = window.setInterval(() => setHour(new Date().getHours()), 60_000)
    return () => clearInterval(id)
  }, [])

  if (reduce) return null

  const flow = getTimeFlowTokens(hour)

  return (
    <div
      className={cn("p17-time-ambient", className)}
      aria-hidden
      data-time-period={flow.period}
      style={{
        ["--time-glow" as string]: String(flow.glow),
        ["--time-motion" as string]: String(flow.motion),
      }}
    >
      <div className="p17-time-ambient__sheet" />
    </div>
  )
}
