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
    "relative inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--xp-pink)]",
    "transition-all duration-200",
    variant === "pink" && [
      "px-7 py-3.5",
      "bg-gradient-to-r from-[var(--xp-pink)] via-[var(--xp-mid)] to-[var(--xp-purple)]",
      "text-white",
      "shadow-[0_4px_24px_rgba(247,37,133,0.45),0_0_0_1px_rgba(247,37,133,0.2)]",
      "hover:shadow-[0_8px_36px_rgba(247,37,133,0.6),0_0_0_1px_rgba(247,37,133,0.3)]",
      "hover:brightness-110",
    ],
    variant === "ghost" && [
      "px-5 py-2.5",
      "border border-white/12 bg-white/[0.04]",
      "text-[var(--xp-text-muted)]",
      "hover:bg-white/[0.08] hover:border-white/20 hover:text-[var(--xp-text)]",
    ],
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
