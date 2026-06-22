"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

export type LogoVariant = "full" | "icon" | "wordmark"
export type LogoSize = "sm" | "md" | "lg" | "xl"
export type LogoTheme = "dark" | "light"

type LogoProps = {
  variant?: LogoVariant
  size?: LogoSize
  theme?: LogoTheme
  showTagline?: boolean
  glow?: boolean
  className?: string
}

const ICON_PX: Record<LogoSize, number> = {
  sm: 28,
  md: 36,
  lg: 52,
  xl: 72,
}

const WORDMARK: Record<LogoSize, { line1: string; match: string; tagline: string }> = {
  sm: { line1: "text-[11px]", match: "text-[13px]", tagline: "text-[5px]" },
  md: { line1: "text-[13px]", match: "text-[16px]", tagline: "text-[6px]" },
  lg: { line1: "text-base", match: "text-xl", tagline: "text-[7px]" },
  xl: { line1: "text-lg", match: "text-2xl", tagline: "text-[8px]" },
}

const GRADIENT =
  "bg-gradient-to-r from-[#FF2D55] via-[#A855F7] to-[#3B82F6] bg-clip-text text-transparent"

const GLOW_STYLE = {
  filter:
    "drop-shadow(0 0 3px rgba(255,45,85,0.55)) drop-shadow(0 0 8px rgba(168,85,247,0.35)) drop-shadow(0 0 14px rgba(59,130,246,0.25))",
} as const

function LogoIcon({
  size,
  glow,
  gradId,
  className,
}: {
  size: number
  glow: boolean
  gradId: string
  className?: string
}) {
  return (
    <svg
      width={size}
      height={Math.round(size * (88 / 80))}
      viewBox="0 0 80 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
      style={glow ? GLOW_STYLE : undefined}
    >
      <defs>
        <linearGradient id={gradId} x1="8" y1="4" x2="72" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF2D55" />
          <stop offset="0.45" stopColor="#A855F7" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <rect x="32" y="2" width="16" height="6" rx="3" fill={`url(#${gradId})`} />
      <path d="M40 8V14" stroke={`url(#${gradId})`} strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M40 76C18 58 10 46 10 34C10 22 18 14 28 14C33 14 37 17 40 22C43 17 47 14 52 14C62 14 70 22 70 34C70 46 62 58 40 76Z"
        stroke={`url(#${gradId})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M40 42V32" stroke={`url(#${gradId})`} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40 42H54" stroke={`url(#${gradId})`} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="40" cy="42" r="2.5" fill={`url(#${gradId})`} />
    </svg>
  )
}

function LogoWordmark({
  size,
  theme,
  showTagline,
  className,
}: {
  size: LogoSize
  theme: LogoTheme
  showTagline: boolean
  className?: string
}) {
  const scale = WORDMARK[size]
  const textColor = theme === "dark" ? "text-white" : "text-[#0B0F14]"
  const mutedColor = theme === "dark" ? "text-white/65" : "text-[#0B0F14]/55"

  return (
    <span className={cn("flex flex-col leading-none select-none", className)}>
      <span className={cn("flex items-baseline gap-[0.15em] font-medium tracking-tight", scale.line1, textColor)}>
        <span>time</span>
        <span className={cn("font-normal opacity-80", "text-[0.55em]")}>to</span>
      </span>
      <span className={cn("font-semibold tracking-tight -mt-0.5", scale.match, GRADIENT)}>match</span>
      {showTagline && (
        <span
          className={cn(
            "mt-1 font-medium uppercase tracking-[0.22em]",
            scale.tagline,
            mutedColor
          )}
        >
          24 hours to connect
        </span>
      )}
    </span>
  )
}

export function Logo({
  variant = "icon",
  size = "md",
  theme = "dark",
  showTagline = false,
  glow = true,
  className,
}: LogoProps) {
  const gradId = useId().replace(/:/g, "")
  const iconPx = ICON_PX[size]

  if (variant === "icon") {
    return (
      <span
        className={cn("inline-flex items-center justify-center", className)}
        role="img"
        aria-label="Time to Match"
      >
        <LogoIcon size={iconPx} glow={glow} gradId={gradId} />
      </span>
    )
  }

  if (variant === "wordmark") {
    return (
      <span className={cn("inline-flex", className)} role="img" aria-label="Time to Match">
        <LogoWordmark size={size} theme={theme} showTagline={showTagline} />
      </span>
    )
  }

  return (
    <span
      className={cn("inline-flex items-center gap-2.5 sm:gap-3", className)}
      role="img"
      aria-label="Time to Match"
    >
      <LogoIcon size={iconPx} glow={glow} gradId={gradId} />
      <LogoWordmark size={size} theme={theme} showTagline={showTagline} />
    </span>
  )
}
