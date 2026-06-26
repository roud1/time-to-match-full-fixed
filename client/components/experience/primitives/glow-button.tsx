"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/client/lib/utils"

type GlowButtonProps = {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  type?: "button" | "submit"
  variant?: "pink" | "ghost"
  className?: string
  disabled?: boolean
}

export function GlowButton({
  children,
  href,
  onClick,
  type = "button",
  variant = "pink",
  className,
  disabled,
}: GlowButtonProps) {
  const reduce = useReducedMotion()

  const base = cn(
    "relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--xp-pink)]",
    variant === "pink" &&
      "bg-[var(--xp-pink)] text-[#0b0b10] shadow-[var(--xp-glow-pink)] hover:brightness-110",
    variant === "ghost" &&
      "border border-white/15 bg-white/5 text-[var(--xp-text)] hover:bg-white/10",
    disabled && "pointer-events-none opacity-50",
    className
  )

  const motionProps = reduce
    ? {}
    : {
        whileTap: { scale: 0.97 },
        whileHover: { scale: 1.02 },
      }

  if (href) {
    return (
      <motion.div {...motionProps} className="inline-flex">
        <Link href={href} className={base}>
          {children}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={base}
      {...motionProps}
    >
      {children}
    </motion.button>
  )
}
