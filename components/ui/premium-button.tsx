"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

type PremiumButtonProps = {
  href?: string
  variant?: "primary" | "ghost"
  className?: string
  children: React.ReactNode
} & Omit<ComponentProps<"button">, "children">

export function PremiumButton({
  href,
  variant = "primary",
  className,
  children,
  ...props
}: PremiumButtonProps) {
  const base = cn(
    "relative inline-flex items-center justify-center px-8 py-4 rounded-full font-light text-base tracking-wide transition-all duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    variant === "primary" &&
      "text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 shadow-lg shadow-pink-500/30",
    variant === "ghost" &&
      "text-foreground/85 border border-foreground/15 bg-foreground/[0.04] hover:bg-foreground/[0.08]",
    className
  )

  const inner = (
  <>
      {variant === "primary" && (
        <span className="absolute inset-0 rounded-full premium-btn-shimmer opacity-0 hover:opacity-100 transition-opacity duration-500" />
      )}
      <span className="relative z-10">{children}</span>
    </>
  )

  if (href) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link href={href} className={base}>
          {inner}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={base}
      {...props}
    >
      {inner}
    </motion.button>
  )
}
