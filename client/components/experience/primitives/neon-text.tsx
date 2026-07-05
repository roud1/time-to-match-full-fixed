"use client"

import { cn } from "@/client/lib/utils"

type NeonTextProps = {
  children: React.ReactNode
  variant?: "pink" | "purple" | "green" | "white"
  as?: "span" | "p" | "h1" | "h2" | "h3"
  className?: string
  id?: string
}

const VARIANT_CLASS = {
  pink:   "text-[var(--xp-pink)]   drop-shadow-[0_0_28px_rgba(247,37,133,0.6)]",
  purple: "text-[var(--xp-purple)] drop-shadow-[0_0_28px_rgba(114,9,183,0.55)]",
  green:  "text-[var(--xp-green)]  drop-shadow-[0_0_20px_rgba(0,255,163,0.42)]",
  white:  "text-[var(--xp-text)]",
} as const

export function NeonText({
  children,
  variant = "white",
  as: Tag = "span",
  className,
  id,
}: NeonTextProps) {
  return (
    <Tag
      id={id}
      className={cn(
        "font-[family-name:var(--xp-font-display)] tracking-tight",
        VARIANT_CLASS[variant],
        className
      )}
    >
      {children}
    </Tag>
  )
}
