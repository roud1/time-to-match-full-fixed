"use client"

import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { cn } from "@/client/lib/utils"

type UrgencyRingProps = {
  totalSeconds: number
  label?: string
  size?: number
  criticalBelow?: number
  className?: string
  onCritical?: () => void
}

function formatTime(total: number) {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return { h, m, s }
}

export function UrgencyRing({
  totalSeconds,
  label,
  size = 220,
  criticalBelow = 3600,
  className,
  onCritical,
}: UrgencyRingProps) {
  const reduce = useReducedMotion()
  const [remaining, setRemaining] = useState(totalSeconds)
  const stroke = 6
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const progress = remaining / totalSeconds
  const offset = circumference * (1 - progress)
  const critical = remaining <= criticalBelow
  const { h, m, s } = formatTime(remaining)

  useEffect(() => {
    setRemaining(totalSeconds)
  }, [totalSeconds])

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        const next = prev <= 0 ? totalSeconds : prev - 1
        if (next <= criticalBelow && prev > criticalBelow) onCritical?.()
        return next
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [totalSeconds, criticalBelow, onCritical])

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn(critical && !reduce && "xp-shake")}
        animate={
          critical && !reduce
            ? { filter: ["drop-shadow(0 0 12px rgba(255,46,99,0.4))", "drop-shadow(0 0 28px rgba(255,46,99,0.7))"] }
            : undefined
        }
        transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={critical ? "var(--xp-pink)" : "var(--xp-purple)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: critical ? "var(--xp-glow-pink)" : "var(--xp-glow-purple)" }}
        />
      </motion.svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
        aria-live="polite"
      >
        <span className="font-[family-name:var(--xp-font-display)] text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
          {String(h).padStart(2, "0")}
          <span className="text-[var(--xp-text-dim)]">:</span>
          {String(m).padStart(2, "0")}
          <span className="text-[var(--xp-text-dim)]">:</span>
          {String(s).padStart(2, "0")}
        </span>
        {label ? (
          <span className="mt-1 max-w-[10rem] text-[0.65rem] uppercase tracking-[0.18em] text-[var(--xp-text-muted)]">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  )
}
