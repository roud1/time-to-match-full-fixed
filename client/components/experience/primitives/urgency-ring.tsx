"use client"

import { motion, useReducedMotion } from "motion/react"
import { useEffect, useId, useState } from "react"
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
  const gradId = useId().replace(/:/g, "")
  const [remaining, setRemaining] = useState(totalSeconds)
  const stroke = size >= 200 ? 7 : size >= 120 ? 5 : 4
  const r = (size - stroke * 2) / 2
  const circumference = 2 * Math.PI * r
  const progress = remaining / totalSeconds
  const offset = circumference * (1 - progress)
  const critical = remaining <= criticalBelow
  const { h, m, s } = formatTime(remaining)
  const cx = size / 2
  const cy = size / 2

  const timeClass =
    size >= 220 ? "text-3xl sm:text-4xl" : size >= 140 ? "text-xl sm:text-2xl" : "text-base sm:text-lg"

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
            ? {
                filter: [
                  "drop-shadow(0 0 14px rgba(255,46,99,0.45))",
                  "drop-shadow(0 0 32px rgba(255,46,99,0.75))",
                ],
              }
            : undefined
        }
        transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--xp-purple)" />
            <stop offset="45%" stopColor="var(--xp-pink)" />
            <stop offset="100%" stopColor="var(--xp-green)" />
          </linearGradient>
        </defs>

        <circle
          cx={cx}
          cy={cy}
          r={r + stroke * 0.6}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
        />

        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
        />

        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={critical ? "var(--xp-pink)" : `url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{
            filter: critical
              ? "drop-shadow(0 0 10px rgba(255,46,99,0.65))"
              : "drop-shadow(0 0 8px rgba(108,92,231,0.4))",
          }}
          animate={!reduce && !critical ? { opacity: [0.88, 1, 0.88] } : undefined}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {size >= 180 &&
          [0, 90, 180, 270].map((deg) => {
            const rad = (deg * Math.PI) / 180
            const tickR = r - stroke
            const x1 = cx + tickR * Math.cos(rad)
            const y1 = cy + tickR * Math.sin(rad)
            const x2 = cx + (tickR + 6) * Math.cos(rad)
            const y2 = cy + (tickR + 6) * Math.sin(rad)
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            )
          })}
      </motion.svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center" aria-live="polite">
        <span
          className={cn(
            "font-[family-name:var(--xp-font-display)] font-bold tabular-nums tracking-tight text-[var(--xp-text)]",
            timeClass
          )}
        >
          {String(h).padStart(2, "0")}
          <span className="text-[var(--xp-text-dim)]">:</span>
          {String(m).padStart(2, "0")}
          <span className="text-[var(--xp-text-dim)]">:</span>
          {String(s).padStart(2, "0")}
        </span>
        {label ? (
          <span className="mt-1 max-w-[10rem] px-2 text-[0.6rem] uppercase leading-snug tracking-[0.16em] text-[var(--xp-text-muted)] sm:text-[0.65rem]">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  )
}
